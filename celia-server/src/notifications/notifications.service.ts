import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { PushService } from '../push/push.service';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
    private pushService: PushService,
  ) {}

  async sendInvitationNotification(
    inviteeId: string,
    inviterName: string,
    eventName: string,
    eventDate: string,
    eventId: string,
    locationName?: string,
    personalMessage?: string,
  ): Promise<void> {
    try {
      // Get invitee details
      const invitee = await this.prisma.user.findUnique({
        where: { id: inviteeId },
        select: { 
          email: true, 
          pushToken: true,
          fullName: true,
        },
      });

      if (!invitee) {
        this.logger.warn(`Invitee not found: ${inviteeId}`);
        return;
      }

      // Create in-app notification
      await this.prisma.notification.create({
        data: {
          userId: inviteeId,
          type: 'invitation',
          title: `${inviterName} invited you to ${eventName}`,
          message: personalMessage || `You've been invited to ${eventName}`,
          data: {
            eventId,
            eventName,
            eventDate,
            inviterName,
            locationName,
          },
        },
      });

      this.logger.log(`✅ In-app notification created for user ${inviteeId}`);

      // Send email (async, don't wait)
      if (invitee.email) {
        this.emailService
          .sendInvitationEmail(
            invitee.email,
            inviterName,
            eventName,
            eventDate,
            locationName,
            personalMessage,
          )
          .catch((error) =>
            this.logger.error(`Email sending failed for ${invitee.email}:`, error),
          );
      }

      // Send push notification (async, don't wait)
      if (invitee.pushToken) {
        this.pushService
          .sendPushNotification(
            invitee.pushToken,
            `${inviterName} invited you`,
            `You've been invited to ${eventName}`,
            {
              type: 'invitation',
              eventId,
              eventName,
            },
          )
          .catch((error) =>
            this.logger.error(`Push notification failed for ${inviteeId}:`, error),
          );
      }
    } catch (error: any) {
      this.logger.error(`Failed to send invitation notification:`, error);
      // Don't throw - we don't want to fail the invitation if notification fails
    }
  }

  async getNotifications(userId: string, page = 1, limit = 50) {
    const skip = (page - 1) * limit;

    const [notifications, total] = await Promise.all([
      this.prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.notification.count({
        where: { userId },
      }),
    ]);

    return {
      items: notifications,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async markAsRead(notificationId: string, userId: string) {
    const notification = await this.prisma.notification.findFirst({
      where: {
        id: notificationId,
        userId,
      },
    });

    if (!notification) {
      throw new Error('Notification not found');
    }

    return this.prisma.notification.update({
      where: { id: notificationId },
      data: {
        read: true,
        readAt: new Date(),
      },
    });
  }

  async markAllAsRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: {
        userId,
        read: false,
      },
      data: {
        read: true,
        readAt: new Date(),
      },
    });
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.prisma.notification.count({
      where: {
        userId,
        read: false,
      },
    });
  }
}

