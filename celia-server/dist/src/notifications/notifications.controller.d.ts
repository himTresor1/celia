import { NotificationsService } from './notifications.service';
export declare class NotificationsController {
    private notificationsService;
    constructor(notificationsService: NotificationsService);
    getNotifications(user: {
        id: string;
    }, page?: string, limit?: string): Promise<{
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
    getUnreadCount(user: {
        id: string;
    }): Promise<{
        count: number;
    }>;
    markAsRead(user: {
        id: string;
    }, id: string): Promise<{
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
    markAllAsRead(user: {
        id: string;
    }): Promise<import(".prisma/client").Prisma.BatchPayload>;
}
