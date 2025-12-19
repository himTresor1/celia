import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import * as crypto from 'crypto';
import * as sgMail from '@sendgrid/mail';

@Injectable()
export class OtpService {
  private readonly logger = new Logger(OtpService.name);

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    const apiKey = this.configService.get<string>('SENDGRID_API_KEY');
    if (apiKey) {
      // Validate API key format (SendGrid keys start with "SG.")
      if (apiKey === 'your-sendgrid-api-key-here' || !apiKey.startsWith('SG.')) {
        this.logger.error(
          '⚠️  Invalid SendGrid API key detected. Please set a valid SENDGRID_API_KEY in your .env file.\n' +
          '   Get your API key from: https://app.sendgrid.com/settings/api_keys\n' +
          '   API keys should start with "SG."'
        );
      } else {
        sgMail.setApiKey(apiKey);
        this.logger.log('✅ SendGrid API key configured for OTP service');
      }
    } else {
      this.logger.warn(
        '⚠️  SendGrid API key not found. OTP emails will fail to send.\n' +
        '   Add SENDGRID_API_KEY to your .env file.'
      );
    }
  }

  /**
   * Generate a 6-digit OTP code
   */
  private generateOtpCode(): string {
    return crypto.randomInt(100000, 999999).toString();
  }

  /**
   * Send OTP to email
   */
  async sendOtp(email: string, type: 'signup' | 'college_verification'): Promise<{ code: string; expiresAt: Date }> {
    // Delete any existing unverified OTPs for this email and type
    await this.prisma.otp.deleteMany({
      where: {
        email,
        type,
        verified: false,
      },
    });

    // Generate new OTP
    const code = this.generateOtpCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save OTP to database
    await this.prisma.otp.create({
      data: {
        email,
        code,
        type,
        expiresAt,
      },
    });

    // Send email with OTP
    const subject = type === 'signup' 
      ? 'CELIA - Verify your email address'
      : 'CELIA - Verify your college email';
    
    const html = this.getOtpEmailTemplate(code, type);

    try {
      // Check if API key is configured before attempting to send
      const apiKey = this.configService.get<string>('SENDGRID_API_KEY');
      if (!apiKey || apiKey === 'your-sendgrid-api-key-here' || !apiKey.startsWith('SG.')) {
        this.logger.error(
          `❌ Cannot send OTP email to ${email}: Invalid or missing SendGrid API key.\n` +
          '   Please configure SENDGRID_API_KEY in your .env file with a valid key from https://app.sendgrid.com/settings/api_keys'
        );
        // Don't throw - OTP is still saved, user can request resend
        return { code, expiresAt };
      }

      const from = this.configService.get<string>('EMAIL_FROM') || 'tresoramizero1@gmail.com';
      await sgMail.send({
        to: email,
        from,
        subject,
        html,
      });
      this.logger.log(`✅ OTP email sent to ${email}`);
    } catch (error: any) {
      this.logger.error(`❌ Failed to send OTP email to ${email}: ${error.message}`);
      
      if (error.response?.body) {
        const errorBody = error.response.body;
        this.logger.error('SendGrid error details:', JSON.stringify(errorBody, null, 2));
        
        // Provide helpful error messages
        if (errorBody.errors && Array.isArray(errorBody.errors)) {
          const errorMessages = errorBody.errors.map((e: any) => e.message).join(', ');
          if (errorMessages.includes('invalid') || errorMessages.includes('expired') || errorMessages.includes('revoked')) {
            this.logger.error(
              '💡 Solution: Your SendGrid API key is invalid, expired, or revoked.\n' +
              '   1. Go to https://app.sendgrid.com/settings/api_keys\n' +
              '   2. Create a new API key with "Mail Send" permissions\n' +
              '   3. Update SENDGRID_API_KEY in your .env file\n' +
              '   4. Restart your server'
            );
          }
        }
      }
      // Don't throw - OTP is still saved, user can request resend
    }

    return { code, expiresAt };
  }

  /**
   * Verify OTP code
   */
  async verifyOtp(email: string, code: string, type: 'signup' | 'college_verification'): Promise<boolean> {
    const otp = await this.prisma.otp.findFirst({
      where: {
        email,
        code,
        type,
        verified: false,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!otp) {
      throw new NotFoundException('Invalid or expired OTP code');
    }

    if (otp.expiresAt < new Date()) {
      throw new BadRequestException('OTP code has expired');
    }

    // Mark OTP as verified
    await this.prisma.otp.update({
      where: { id: otp.id },
      data: {
        verified: true,
        verifiedAt: new Date(),
      },
    });

    return true;
  }

  /**
   * Get OTP email template
   */
  private getOtpEmailTemplate(code: string, type: 'signup' | 'college_verification'): string {
    const purpose = type === 'signup' 
      ? 'verify your email address and complete your registration'
      : 'verify your college email address';
    
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
            .code-box {
              background: #f9f9f9;
              border: 2px dashed #3AFF6E;
              border-radius: 8px;
              padding: 20px;
              text-align: center;
              margin: 30px 0;
            }
            .code {
              font-size: 36px;
              font-weight: 700;
              color: #2ECC71;
              letter-spacing: 8px;
              font-family: 'Courier New', monospace;
            }
            .footer {
              background: #f9f9f9;
              padding: 20px;
              text-align: center;
              color: #666;
              font-size: 14px;
            }
            .warning {
              background: #fff3cd;
              border-left: 4px solid #ffc107;
              padding: 15px;
              margin: 20px 0;
              border-radius: 4px;
              color: #856404;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Verify Your Email</h1>
            </div>
            <div class="content">
              <p>Hi there!</p>
              <p>Use this code to ${purpose}:</p>
              
              <div class="code-box">
                <div class="code">${code}</div>
              </div>

              <div class="warning">
                <strong>⚠️ Important:</strong> This code will expire in 10 minutes. Do not share this code with anyone.
              </div>

              <p style="margin-top: 30px; color: #666; font-size: 14px;">
                If you didn't request this code, you can safely ignore this email.
              </p>
            </div>
            <div class="footer">
              <p>This verification code was sent by CELIA</p>
              <p style="margin-top: 10px; font-size: 12px; color: #999;">
                © ${new Date().getFullYear()} CELIA - Your college event platform
              </p>
            </div>
          </div>
        </body>
      </html>
    `;
  }
}

