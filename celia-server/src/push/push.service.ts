import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Expo } from 'expo-server-sdk';

@Injectable()
export class PushService {
  private readonly logger = new Logger(PushService.name);
  private expo: Expo;

  constructor(private configService: ConfigService) {
    const accessToken = this.configService.get<string>('EXPO_ACCESS_TOKEN');
    this.expo = new Expo({
      accessToken: accessToken || undefined,
    });
    
    if (accessToken) {
      this.logger.log('Expo push notification service initialized');
    } else {
      this.logger.warn('Expo access token not found in environment variables');
    }
  }

  async sendPushNotification(
    pushToken: string,
    title: string,
    body: string,
    data?: any,
  ): Promise<boolean> {
    if (!pushToken) {
      this.logger.warn('No push token provided');
      return false;
    }

    if (!Expo.isExpoPushToken(pushToken)) {
      this.logger.error(`Invalid Expo push token: ${pushToken}`);
      return false;
    }

    const messages = [
      {
        to: pushToken,
        sound: 'default' as const,
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

      // Check for errors
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
    } catch (error: any) {
      this.logger.error(`❌ Failed to send push notification:`, error.message);
      return false;
    }
  }

  async sendBulkPushNotifications(
    pushTokens: string[],
    title: string,
    body: string,
    data?: any,
  ): Promise<number> {
    if (!pushTokens || pushTokens.length === 0) {
      this.logger.warn('No push tokens provided for bulk notification');
      return 0;
    }

    const validTokens = pushTokens.filter((token) => {
      if (!token) return false;
      return Expo.isExpoPushToken(token);
    });

    if (validTokens.length === 0) {
      this.logger.warn('No valid push tokens provided');
      return 0;
    }

    const messages = validTokens.map((token) => ({
      to: token,
      sound: 'default' as const,
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

      // Count successful sends
      let successCount = 0;
      for (const ticket of tickets) {
        if (ticket.status === 'ok') {
          successCount++;
        } else {
          this.logger.error(`Push notification error: ${ticket.message}`);
        }
      }

      this.logger.log(`✅ Bulk push notifications sent: ${successCount}/${validTokens.length} successful`);
      return successCount;
    } catch (error: any) {
      this.logger.error(`❌ Failed to send bulk push notifications:`, error.message);
      return 0;
    }
  }
}

