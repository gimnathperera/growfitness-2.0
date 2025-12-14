import { Module } from '@nestjs/common';
import { NotificationService } from './notifications.service';
import { EmailProvider } from './providers/email.provider';
import { WhatsAppProvider } from './providers/whatsapp.provider';

@Module({
  providers: [NotificationService, EmailProvider, WhatsAppProvider],
  exports: [NotificationService],
})
export class NotificationsModule {}

