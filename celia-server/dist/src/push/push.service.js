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
var PushService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PushService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const expo_server_sdk_1 = require("expo-server-sdk");
let PushService = PushService_1 = class PushService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(PushService_1.name);
        const accessToken = this.configService.get('EXPO_ACCESS_TOKEN');
        this.expo = new expo_server_sdk_1.Expo({
            accessToken: accessToken || undefined,
        });
        if (accessToken) {
            this.logger.log('Expo push notification service initialized');
        }
        else {
            this.logger.warn('Expo access token not found in environment variables');
        }
    }
    async sendPushNotification(pushToken, title, body, data) {
        if (!pushToken) {
            this.logger.warn('No push token provided');
            return false;
        }
        if (!expo_server_sdk_1.Expo.isExpoPushToken(pushToken)) {
            this.logger.error(`Invalid Expo push token: ${pushToken}`);
            return false;
        }
        const messages = [
            {
                to: pushToken,
                sound: 'default',
                title,
                body,
                data: data || {},
                badge: 1,
            },
        ];
        try {
            const chunks = this.expo.chunkPushNotifications(messages);
            const tickets = [];
            for (const chunk of chunks) {
                const ticketChunk = await this.expo.sendPushNotificationsAsync(chunk);
                tickets.push(...ticketChunk);
            }
            for (const ticket of tickets) {
                if (ticket.status === 'error') {
                    this.logger.error(`Push notification error: ${ticket.message}`);
                    if (ticket.details) {
                        this.logger.error('Error details:', ticket.details);
                    }
                }
            }
            this.logger.log(`✅ Push notification sent to ${pushToken}`);
            return true;
        }
        catch (error) {
            this.logger.error(`❌ Failed to send push notification:`, error.message);
            return false;
        }
    }
    async sendBulkPushNotifications(pushTokens, title, body, data) {
        if (!pushTokens || pushTokens.length === 0) {
            this.logger.warn('No push tokens provided for bulk notification');
            return 0;
        }
        const validTokens = pushTokens.filter((token) => {
            if (!token)
                return false;
            return expo_server_sdk_1.Expo.isExpoPushToken(token);
        });
        if (validTokens.length === 0) {
            this.logger.warn('No valid push tokens provided');
            return 0;
        }
        const messages = validTokens.map((token) => ({
            to: token,
            sound: 'default',
            title,
            body,
            data: data || {},
            badge: 1,
        }));
        try {
            const chunks = this.expo.chunkPushNotifications(messages);
            const tickets = [];
            for (const chunk of chunks) {
                const ticketChunk = await this.expo.sendPushNotificationsAsync(chunk);
                tickets.push(...ticketChunk);
            }
            let successCount = 0;
            for (const ticket of tickets) {
                if (ticket.status === 'ok') {
                    successCount++;
                }
                else {
                    this.logger.error(`Push notification error: ${ticket.message}`);
                }
            }
            this.logger.log(`✅ Bulk push notifications sent: ${successCount}/${validTokens.length} successful`);
            return successCount;
        }
        catch (error) {
            this.logger.error(`❌ Failed to send bulk push notifications:`, error.message);
            return 0;
        }
    }
};
exports.PushService = PushService;
exports.PushService = PushService = PushService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], PushService);
//# sourceMappingURL=push.service.js.map