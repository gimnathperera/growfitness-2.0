import { Model, Types } from 'mongoose';
import { UserDocument } from '../../infra/database/schemas/user.schema';
import { SessionDocument } from '../../infra/database/schemas/session.schema';
import { KidDocument } from '../../infra/database/schemas/kid.schema';
import { GoogleCalendarApiService } from './google-calendar-api.service';
export declare class GoogleCalendarSyncService {
    private sessionModel;
    private userModel;
    private kidModel;
    private googleCalendarApi;
    private logger;
    constructor(sessionModel: Model<SessionDocument>, userModel: Model<UserDocument>, kidModel: Model<KidDocument>, googleCalendarApi: GoogleCalendarApiService);
    private getConnectedUserIds;
    private getConnectedAdminIds;
    private getStakeholderUserIds;
    private fetchSessionForSync;
    syncSessionCreated(sessionId: string): Promise<void>;
    syncSessionUpdated(sessionId: string): Promise<void>;
    syncSessionDeleted(sessionId: string, coachId: string, kidObjectIds: Types.ObjectId[]): Promise<void>;
    private getParentIdsFromKidObjectIds;
}
