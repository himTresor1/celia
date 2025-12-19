"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var NotificationsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const email_service_1 = require("../email/email.service");
const push_service_1 = require("../push/push.service");
let NotificationsService = NotificationsService_1 = class NotificationsService {
    constructor(prisma, emailService, pushService) {
        this.prisma = prisma;
        this.emailService = emailService;
        this.pushService = pushService;
        this.logger = new common_1.Logger(NotificationsService_1.name);
    }
    async sendInvitationNotification(inviteeId, inviterName, eventName, eventDate, eventId, locationName, personalMessage) {
        try {
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
            if (invitee.email) {
                this.emailService
                    .sendInvitationEmail(invitee.email, inviterName, eventName, eventDate, locationName, personalMessage)
                    .catch((error) => this.logger.error(`Email sending failed for ${invitee.email}:`, error));
            }
            if (invitee.pushToken) {
                this.pushService
                    .sendPushNotification(invitee.pushToken, `${inviterName} invited you`, `You've been invited to ${eventName}`, {
                    type: 'invitation',
                    eventId,
                    eventName,
                })
                    .catch((error) => this.logger.error(`Push notification failed for ${inviteeId}:`, error));
            }
        }
        catch (error) {
            this.logger.error(`Failed to send invitation notification:`, error);
        }
    }
    async getNotifications(userId, page = 1, limit = 50) {
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
    async markAsRead(notificationId, userId) {
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
    async markAllAsRead(userId) {
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
    async getUnreadCount(userId) {
        return this.prisma.notification.count({
            where: {
                userId,
                read: false,
            },
        });
    }
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = NotificationsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        email_service_1.EmailService,
        push_service_1.PushService])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map