import {
  Injectable,
  ForbiddenException,
  BadRequestException,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Storage } from '@google-cloud/storage';
import { randomUUID } from 'crypto';
import { UploadKind, UserRole } from '@grow-fitness/shared-types';
import type { UploadPresignDto, UploadFinalizeDto, UploadDeleteDto } from '@grow-fitness/shared-schemas';
import type { JwtPayload } from '../auth/auth.service';
import { Kid, KidDocument } from '../../infra/database/schemas/kid.schema';
import { User, UserDocument } from '../../infra/database/schemas/user.schema';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class UploadsService {
  private readonly storage: Storage;
  private readonly bucketName: string;
  private readonly publicBase: string;

  constructor(
    private readonly config: ConfigService,
    @InjectModel(Kid.name) private readonly kidModel: Model<KidDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly auditService: AuditService
  ) {
    this.bucketName = this.config.get<string>('GCS_BUCKET_NAME', '');
    const projectId = this.config.get<string>('GCP_PROJECT_ID', '');
    this.storage = new Storage(projectId ? { projectId } : undefined);
    this.publicBase = (this.config.get<string>('GCS_PUBLIC_BASE_URL', '') || '').replace(/\/$/, '');
  }

  private ensureBucket(): void {
    if (!this.bucketName) {
      throw new ServiceUnavailableException({
        message: 'File uploads are not configured (GCS_BUCKET_NAME)',
      });
    }
  }

  private isGoogleCredentialsError(error: unknown): boolean {
    return (
      error instanceof Error &&
      (error.message.includes('Could not load the default credentials') ||
        error.message.includes('Unable to detect a Project Id') ||
        error.message.includes('Cannot sign data without'))
    );
  }

  /** v4 signed URLs on Cloud Run use IAM signBlob; failures do not always match isGoogleCredentialsError. */
  private isGoogleSignedUrlIamError(error: unknown): boolean {
    return (
      error instanceof Error &&
      (error.message.includes('signBlob') || error.message.includes('iam.serviceAccounts'))
    );
  }

  private extensionForContentType(contentType: string): string {
    const map: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp',
      'application/pdf': 'pdf',
    };
    return map[contentType] ?? 'bin';
  }

  private buildObjectKey(kind: UploadKind, entityId: string, contentType: string): string {
    const ext = this.extensionForContentType(contentType);
    const id = randomUUID();
    switch (kind) {
      case UploadKind.KID_AVATAR:
        return `public/avatars/kids/${entityId}/${id}.${ext}`;
      case UploadKind.PARENT_AVATAR:
        return `public/avatars/parents/${entityId}/${id}.${ext}`;
      case UploadKind.COACH_PHOTO:
        return `public/avatars/coaches/${entityId}/${id}.${ext}`;
      case UploadKind.COACH_CV:
        return `public/cvs/coaches/${entityId}/${id}.${ext}`;
      default:
        throw new BadRequestException('Invalid upload kind');
    }
  }

  private expectedKeyPrefix(kind: UploadKind, entityId: string): string {
    switch (kind) {
      case UploadKind.KID_AVATAR:
        return `public/avatars/kids/${entityId}/`;
      case UploadKind.PARENT_AVATAR:
        return `public/avatars/parents/${entityId}/`;
      case UploadKind.COACH_PHOTO:
        return `public/avatars/coaches/${entityId}/`;
      case UploadKind.COACH_CV:
        return `public/cvs/coaches/${entityId}/`;
      default:
        throw new BadRequestException('Invalid upload kind');
    }
  }

  publicUrlForKey(objectKey: string): string {
    const base = this.publicBase || `https://storage.googleapis.com/${this.bucketName}`;
    const encoded = objectKey.split('/').map(encodeURIComponent).join('/');
    return `${base}/${encoded}`;
  }

  private async assertKidAvatarAuth(entityId: string, user: JwtPayload): Promise<void> {
    const kid = await this.kidModel.findById(entityId).exec();
    if (!kid) {
      throw new NotFoundException('Kid not found');
    }
    if (user.role === UserRole.ADMIN) {
      return;
    }
    if (user.role !== UserRole.PARENT || kid.parentId.toString() !== user.sub) {
      throw new ForbiddenException('Not allowed to upload for this kid');
    }
  }

  private async assertCoachEntity(entityId: string): Promise<void> {
    const coach = await this.userModel.findOne({ _id: entityId, role: UserRole.COACH }).exec();
    if (!coach) {
      throw new NotFoundException('Coach not found');
    }
  }

  private async assertParentAvatarAuth(entityId: string, user: JwtPayload): Promise<void> {
    const parent = await this.userModel.findOne({ _id: entityId, role: UserRole.PARENT }).exec();
    if (!parent) {
      throw new NotFoundException('Parent not found');
    }
    if (user.role === UserRole.ADMIN) {
      return;
    }
    if (user.role !== UserRole.PARENT || entityId !== user.sub) {
      throw new ForbiddenException('Not allowed to upload for this account');
    }
  }

  async presign(dto: UploadPresignDto, user: JwtPayload) {
    this.ensureBucket();
    if (dto.kind === UploadKind.KID_AVATAR) {
      await this.assertKidAvatarAuth(dto.entityId, user);
    } else if (dto.kind === UploadKind.PARENT_AVATAR) {
      await this.assertParentAvatarAuth(dto.entityId, user);
    } else {
      if (user.role !== UserRole.ADMIN) {
        throw new ForbiddenException('Only admins can upload coach files');
      }
      await this.assertCoachEntity(dto.entityId);
    }

    const objectKey = this.buildObjectKey(dto.kind, dto.entityId, dto.contentType);
    const expiresMs = 15 * 60 * 1000;
    const bucket = this.storage.bucket(this.bucketName);
    const file = bucket.file(objectKey);
    let uploadUrl: string;

    try {
      [uploadUrl] = await file.getSignedUrl({
        version: 'v4',
        action: 'write',
        expires: Date.now() + expiresMs,
        contentType: dto.contentType,
      });
    } catch (error) {
      if (this.isGoogleCredentialsError(error) || this.isGoogleSignedUrlIamError(error)) {
        throw new ServiceUnavailableException({
          message:
            'File uploads: Google signing failed. Locally, set GOOGLE_APPLICATION_CREDENTIALS to a service account JSON key. On Cloud Run, grant the runtime service account Storage access on the bucket and roles/iam.serviceAccountTokenCreator on that same service account (required for v4 signed URLs). See apps/api/.env.example.',
        });
      }
      throw error;
    }

    const publicUrl = this.publicUrlForKey(objectKey);
    const expiresAt = new Date(Date.now() + expiresMs).toISOString();
    return { uploadUrl, publicUrl, objectKey, expiresAt };
  }

  async finalize(dto: UploadFinalizeDto, user: JwtPayload) {
    this.ensureBucket();
    const prefix = this.expectedKeyPrefix(dto.kind, dto.entityId);
    if (!dto.objectKey.startsWith(prefix)) {
      throw new BadRequestException('Invalid object key');
    }
    const publicUrl = this.publicUrlForKey(dto.objectKey);
    if (dto.publicUrl && dto.publicUrl !== publicUrl) {
      throw new BadRequestException('publicUrl does not match objectKey');
    }

    if (dto.kind === UploadKind.KID_AVATAR) {
      await this.assertKidAvatarAuth(dto.entityId, user);
      await this.kidModel.findByIdAndUpdate(dto.entityId, { profilePhotoUrl: publicUrl }).exec();
    } else if (dto.kind === UploadKind.PARENT_AVATAR) {
      await this.assertParentAvatarAuth(dto.entityId, user);
      await this.userModel
        .findByIdAndUpdate(dto.entityId, { $set: { 'parentProfile.photoUrl': publicUrl } })
        .exec();
    } else {
      if (user.role !== UserRole.ADMIN) {
        throw new ForbiddenException('Only admins can finalize coach files');
      }
      await this.assertCoachEntity(dto.entityId);
      if (dto.kind === UploadKind.COACH_PHOTO) {
        await this.userModel
          .findByIdAndUpdate(dto.entityId, { $set: { 'coachProfile.photoUrl': publicUrl } })
          .exec();
      } else {
        await this.userModel
          .findByIdAndUpdate(dto.entityId, { $set: { 'coachProfile.cvUrl': publicUrl } })
          .exec();
      }
    }

    await this.auditService.log({
      actorId: user.sub,
      action: 'UPLOAD_FINALIZE',
      entityType: 'Upload',
      entityId: dto.entityId,
      metadata: { kind: dto.kind, objectKey: dto.objectKey },
    });

    return { publicUrl, objectKey: dto.objectKey };
  }

  private objectKeyFromPublicUrl(publicUrl: string): string | null {
    const base = this.publicBase || `https://storage.googleapis.com/${this.bucketName}`;
    const normalizedBase = base.replace(/\/$/, '');
    const normalizedUrl = publicUrl.replace(/\/$/, '');
    if (!normalizedUrl.startsWith(`${normalizedBase}/`)) {
      return null;
    }
    const rawKey = normalizedUrl.slice(normalizedBase.length + 1);
    if (!rawKey) return null;
    // Decode each path segment (GCS public URLs are encoded segment-by-segment).
    return rawKey
      .split('/')
      .map(seg => decodeURIComponent(seg))
      .join('/');
  }

  async delete(dto: UploadDeleteDto, user: JwtPayload) {
    this.ensureBucket();

    // Auth checks mirror presign/finalize.
    if (dto.kind === UploadKind.KID_AVATAR) {
      await this.assertKidAvatarAuth(dto.entityId, user);
    } else if (dto.kind === UploadKind.PARENT_AVATAR) {
      await this.assertParentAvatarAuth(dto.entityId, user);
    } else {
      if (user.role !== UserRole.ADMIN) {
        throw new ForbiddenException('Only admins can delete coach files');
      }
      await this.assertCoachEntity(dto.entityId);
    }

    const objectKey = this.objectKeyFromPublicUrl(dto.publicUrl);
    if (!objectKey) {
      throw new BadRequestException('publicUrl is not a recognized Grow Fitness upload URL');
    }

    const prefix = this.expectedKeyPrefix(dto.kind, dto.entityId);
    if (!objectKey.startsWith(prefix)) {
      throw new BadRequestException('publicUrl does not match the expected upload path');
    }

    const bucket = this.storage.bucket(this.bucketName);
    await bucket.file(objectKey).delete({ ignoreNotFound: true });

    if (dto.kind === UploadKind.KID_AVATAR) {
      await this.kidModel
        .findByIdAndUpdate(dto.entityId, { $unset: { profilePhotoUrl: '' } })
        .exec();
    } else if (dto.kind === UploadKind.PARENT_AVATAR) {
      await this.userModel
        .findByIdAndUpdate(dto.entityId, { $unset: { 'parentProfile.photoUrl': '' } })
        .exec();
    } else if (dto.kind === UploadKind.COACH_PHOTO) {
      await this.userModel
        .findByIdAndUpdate(dto.entityId, { $unset: { 'coachProfile.photoUrl': '' } })
        .exec();
    } else {
      await this.userModel
        .findByIdAndUpdate(dto.entityId, { $unset: { 'coachProfile.cvUrl': '' } })
        .exec();
    }

    await this.auditService.log({
      actorId: user.sub,
      action: 'UPLOAD_DELETE',
      entityType: 'Upload',
      entityId: dto.entityId,
      metadata: { kind: dto.kind, objectKey },
    });

    return { objectKey };
  }
}
