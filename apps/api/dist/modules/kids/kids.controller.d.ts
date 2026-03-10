import { KidsService } from './kids.service';
import { CreateKidDto, UpdateKidDto } from '@grow-fitness/shared-schemas';
import { FindKidsQueryDto } from './dto/find-kids-query.dto';
export declare class KidsController {
    private readonly kidsService;
    constructor(kidsService: KidsService);
    findAll(query: FindKidsQueryDto): Promise<import("../../common/dto/pagination.dto").PaginatedResponseDto<any>>;
    create(createKidDto: CreateKidDto, actorId: string): Promise<any>;
    findById(id: string): Promise<any>;
    update(id: string, updateKidDto: UpdateKidDto, actorId: string): Promise<any>;
    linkToParent(kidId: string, parentId: string, actorId: string): Promise<any>;
    unlinkFromParent(kidId: string, actorId: string): Promise<any>;
}
