import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { PushService } from '../push/push.service';
export declare class NotificationsService {
    private prisma;
    private emailService;
    private pushService;
    private readonly logger;
    constructor(prisma: PrismaService, emailService: EmailService, pushService: PushService);
    sendInvitationNotification(inviteeId: string, inviterName: string, eventName: string, eventDate: string, eventId: string, locationName?: string, personalMessage?: string): Promise<void>;
    getNotifications(userId: string, page?: number, limit?: number): Promise<{
        items: {
            id: string;
            createdAt: Date;
            data: import("@prisma/client/runtime/library").JsonValue | null;
            type: string;
            title: string;
            message: string;
            userId: string;
            read: boolean;
            readAt: Date | null;
        }[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    markAsRead(notificationId: string, userId: string): Promise<{
        id: string;
        createdAt: Date;
        data: import("@prisma/client/runtime/library").JsonValue | null;
        type: string;
        title: string;
        message: string;
        userId: string;
        read: boolean;
        readAt: Date | null;
    }>;
    markAllAsRead(userId: string): Promise<import(".prisma/client").Prisma.BatchPayload>;
    getUnreadCount(userId: string): Promise<number>;
}
