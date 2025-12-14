import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Location, LocationDocument } from '../../infra/database/schemas/location.schema';
import { CreateLocationDto, UpdateLocationDto } from '@grow-fitness/shared-schemas';
import { AuditService } from '../audit/audit.service';
import { ErrorCode } from '../../common/enums/error-codes.enum';
import { PaginationDto, PaginatedResponseDto } from '../../common/dto/pagination.dto';

@Injectable()
export class LocationsService {
  constructor(
    @InjectModel(Location.name) private locationModel: Model<LocationDocument>,
    private auditService: AuditService
  ) {}

  async findAll(pagination: PaginationDto) {
    const skip = (pagination.page - 1) * pagination.limit;
    const [data, total] = await Promise.all([
      this.locationModel.find().sort({ name: 1 }).skip(skip).limit(pagination.limit).exec(),
      this.locationModel.countDocuments().exec(),
    ]);

    return new PaginatedResponseDto(data, total, pagination.page, pagination.limit);
  }

  async findById(id: string) {
    const location = await this.locationModel.findById(id).exec();

    if (!location) {
      throw new NotFoundException({
        errorCode: ErrorCode.LOCATION_NOT_FOUND,
        message: 'Location not found',
      });
    }

    return location;
  }

  async create(createLocationDto: CreateLocationDto, actorId: string) {
    const location = new this.locationModel(createLocationDto);
    await location.save();

    await this.auditService.log({
      actorId,
      action: 'CREATE_LOCATION',
      entityType: 'Location',
      entityId: location._id.toString(),
      metadata: createLocationDto,
    });

    return location;
  }

  async update(id: string, updateLocationDto: UpdateLocationDto, actorId: string) {
    const location = await this.locationModel.findById(id).exec();

    if (!location) {
      throw new NotFoundException({
        errorCode: ErrorCode.LOCATION_NOT_FOUND,
        message: 'Location not found',
      });
    }

    Object.assign(location, updateLocationDto);
    await location.save();

    await this.auditService.log({
      actorId,
      action: 'UPDATE_LOCATION',
      entityType: 'Location',
      entityId: id,
      metadata: updateLocationDto,
    });

    return location;
  }

  async delete(id: string, actorId: string) {
    const location = await this.locationModel.findById(id).exec();

    if (!location) {
      throw new NotFoundException({
        errorCode: ErrorCode.LOCATION_NOT_FOUND,
        message: 'Location not found',
      });
    }

    await this.locationModel.deleteOne({ _id: id }).exec();

    await this.auditService.log({
      actorId,
      action: 'DELETE_LOCATION',
      entityType: 'Location',
      entityId: id,
    });

    return { message: 'Location deleted successfully' };
  }
}
