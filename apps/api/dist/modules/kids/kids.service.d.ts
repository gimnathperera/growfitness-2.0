import { Model } from 'mongoose';
import { KidDocument } from '../../infra/database/schemas/kid.schema';
import { UserDocument } from '../../infra/database/schemas/user.schema';
import { CreateKidDto, UpdateKidDto } from '@grow-fitness/shared-schemas';
import { AuditService } from '../audit/audit.service';
import { PaginationDto, PaginatedResponseDto } from '../../common/dto/pagination.dto';
export declare class KidsService {
    private kidModel;
    private userModel;
    private auditService;
    constructor(kidModel: Model<KidDocument>, userModel: Model<UserDocument>, auditService: AuditService);
    findAll(pagination: PaginationDto, parentId?: string, sessionType?: string, search?: string): Promise<PaginatedResponseDto<any>>;
    findById(id: string): Promise<any>;
    create(createKidDto: CreateKidDto, actorId: string): Promise<any>;
    update(id: string, updateKidDto: UpdateKidDto, actorId: string): Promise<any>;
    linkToParent(kidId: string, parentId: string, actorId: string): Promise<any>;
    unlinkFromParent(kidId: string, actorId: string): Promise<any>;
}
