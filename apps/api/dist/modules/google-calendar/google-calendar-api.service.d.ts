import { ConfigService } from '@nestjs/config';
import { Model, Types } from 'mongoose';
import { UserDocument } from '../../infra/database/schemas/user.schema';
import { GoogleCalendarEventDocument } from '../../infra/database/schemas/google-calendar-event.schema';
type SessionLike = {
    _id: Types.ObjectId;
    title: string;
    type: string;
    status: string;
    dateTime: Date;
    duration: number;
    locationId?: any;
};
export declare class GoogleCalendarApiService {
    private configService;
    private userModel;
    private mappingModel;
    private logger;
    constructor(configService: ConfigService, userModel: Model<UserDocument>, mappingModel: Model<GoogleCalendarEventDocument>);
    private getOauthClientForRefreshToken;
    private buildEvent;
    private getUserRefreshToken;
    private getMapping;
    private setMapping;
    private removeMapping;
    upsertSessionEvent(userId: string, session: SessionLike): Promise<void>;
    deleteSessionEvent(userId: string, sessionObjectId: Types.ObjectId): Promise<void>;
}
export {};
