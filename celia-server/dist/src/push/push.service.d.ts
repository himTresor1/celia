import { ConfigService } from '@nestjs/config';
export declare class PushService {
    private configService;
    private readonly logger;
    private expo;
    constructor(configService: ConfigService);
    sendPushNotification(pushToken: string, title: string, body: string, data?: any): Promise<boolean>;
    sendBulkPushNotifications(pushTokens: string[], title: string, body: string, data?: any): Promise<number>;
}
