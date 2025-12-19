import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as sgMail from '@sendgrid/mail';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('SENDGRID_API_KEY');
    if (apiKey) {
      sgMail.setApiKey(apiKey);
      this.logger.log('SendGrid API key configured');
    } else {
      this.logger.warn('SendGrid API key not found in environment variables');
    }
  }

  async sendInvitationEmail(
    to: string,
    inviterName: string,
    eventName: string,
    eventDate: string,
    locationName?: string,
    personalMessage?: string,
  ): Promise<boolean> {
    const from = this.configService.get<string>('EMAIL_FROM') || 'tresoramizero1@gmail.com';
    const fromName = this.configService.get<string>('EMAIL_FROM_NAME') || 'CELIA';

    const msg = {
      to,
      from: {
        email: from,
        name: fromName,
      },
      subject: `${inviterName} invited you to ${eventName}`,
      html: this.getInvitationEmailTemplate(
        inviterName,
        eventName,
        eventDate,
        locationName,
        personalMessage,
      ),
    };

    try {
      await sgMail.send(msg);
      this.logger.log(`✅ Invitation email sent to ${to}`);
      return true;
    } catch (error: any) {
      this.logger.error(`❌ Failed to send email to ${to}:`, error.message);
      if (error.response) {
        this.logger.error('SendGrid error details:', error.response.body);
      }
      return false;
    }
  }

  private getInvitationEmailTemplate(
    inviterName: string,
    eventName: string,
    eventDate: string,
    locationName?: string,
    personalMessage?: string,
  ): string {
    const formattedDate = new Date(eventDate).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; 
              line-height: 1.6; 
              color: #333; 
              margin: 0; 
              padding: 0; 
              background-color: #f4f4f4;
            }
            .container { 
              max-width: 600px; 
              margin: 0 auto; 
              background: #ffffff;
            }
            .header { 
              background: linear-gradient(135deg, #3AFF6E 0%, #2ECC71 100%); 
              color: white; 
              padding: 40px 20px; 
              text-align: center; 
            }
            .header h1 {
              margin: 0;
              font-size: 28px;
              font-weight: 700;
            }
            .content { 
              padding: 40px 30px; 
            }
            .greeting {
              font-size: 18px;
              margin-bottom: 20px;
            }
            .event-card {
              background: #f9f9f9;
              border-left: 4px solid #3AFF6E;
              padding: 20px;
              margin: 20px 0;
              border-radius: 4px;
            }
            .event-name {
              font-size: 24px;
              font-weight: 700;
              color: #1a1a1a;
              margin-bottom: 15px;
            }
            .event-detail {
              margin: 10px 0;
              color: #666;
              font-size: 16px;
            }
            .event-detail strong {
              color: #333;
            }
            .message-box {
              background: #fff3cd;
              border-left: 4px solid #ffc107;
              padding: 15px;
              margin: 20px 0;
              border-radius: 4px;
              font-style: italic;
              color: #856404;
            }
            .button-container {
              text-align: center;
              margin: 30px 0;
            }
            .button { 
              display: inline-block; 
              padding: 14px 32px; 
              background: #3AFF6E; 
              color: white; 
              text-decoration: none; 
              border-radius: 8px; 
              font-weight: 600;
              font-size: 16px;
            }
            .footer {
              background: #f9f9f9;
              padding: 20px;
              text-align: center;
              color: #666;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 You're Invited!</h1>
            </div>
            <div class="content">
              <p class="greeting">Hi there!</p>
              <p><strong>${inviterName}</strong> has invited you to join them at an event!</p>
              
              <div class="event-card">
                <div class="event-name">${eventName}</div>
                <div class="event-detail">
                  <strong>📅 Date:</strong> ${formattedDate}
                </div>
                ${locationName ? `<div class="event-detail"><strong>📍 Location:</strong> ${locationName}</div>` : ''}
              </div>

              ${personalMessage ? `
                <div class="message-box">
                  <strong>${inviterName} says:</strong><br>
                  "${personalMessage}"
                </div>
              ` : ''}

              <div class="button-container">
                <a href="#" class="button">View Event Details</a>
              </div>

              <p style="margin-top: 30px; color: #666; font-size: 14px;">
                Open the CELIA app to RSVP and see more details about this event.
              </p>
            </div>
            <div class="footer">
              <p>This invitation was sent through CELIA - Your college event platform</p>
              <p style="margin-top: 10px; font-size: 12px; color: #999;">
                If you don't want to receive these emails, you can update your preferences in the app.
              </p>
            </div>
          </div>
        </body>
      </html>
    `;
  }
}

