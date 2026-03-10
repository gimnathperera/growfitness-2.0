import { Model } from 'mongoose';
import { SessionDocument } from '../../infra/database/schemas/session.schema';
import { InvoiceDocument } from '../../infra/database/schemas/invoice.schema';
import { UserDocument } from '../../infra/database/schemas/user.schema';
import { KidDocument } from '../../infra/database/schemas/kid.schema';
import { NotificationService } from '../notifications/notifications.service';
export declare class RemindersService {
    private sessionModel;
    private invoiceModel;
    private userModel;
    private kidModel;
    private notificationService;
    private readonly logger;
    constructor(sessionModel: Model<SessionDocument>, invoiceModel: Model<InvoiceDocument>, userModel: Model<UserDocument>, kidModel: Model<KidDocument>, notificationService: NotificationService);
    remindAdminsToCreateInvoices(): Promise<void>;
    remindParentsToPayInvoices(): Promise<void>;
    sendMonthEndPaymentReminder(): Promise<void>;
    sendUpcomingSessionReminder(): Promise<void>;
}
