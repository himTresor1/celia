import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { OtpService } from './otp.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('OTP')
@Controller('otp')
export class OtpController {
  constructor(private readonly otpService: OtpService) {}

  @Post('send')
  @ApiOperation({ summary: 'Send OTP code to email' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: {
          type: 'string',
          example: 'user@example.com',
          description: 'Email address to send OTP to',
        },
        type: {
          type: 'string',
          enum: ['signup', 'college_verification'],
          example: 'signup',
          description: 'Type of OTP (signup or college_verification)',
        },
      },
      required: ['email', 'type'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'OTP sent successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'OTP sent successfully' },
        expiresAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  async sendOtp(@Body() dto: { email: string; type: 'signup' | 'college_verification' }) {
    await this.otpService.sendOtp(dto.email, dto.type);
    return { message: 'OTP sent successfully' };
  }

  @Post('verify')
  @ApiOperation({ summary: 'Verify OTP code' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: {
          type: 'string',
          example: 'user@example.com',
        },
        code: {
          type: 'string',
          example: '123456',
          description: '6-digit OTP code',
        },
        type: {
          type: 'string',
          enum: ['signup', 'college_verification'],
          example: 'signup',
        },
      },
      required: ['email', 'code', 'type'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'OTP verified successfully',
    schema: {
      type: 'object',
      properties: {
        verified: { type: 'boolean', example: true },
      },
    },
  })
  async verifyOtp(@Body() dto: { email: string; code: string; type: 'signup' | 'college_verification' }) {
    const verified = await this.otpService.verifyOtp(dto.email, dto.code, dto.type);
    return { verified };
  }

  @Post('verify-college')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Verify college email OTP (authenticated)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: {
          type: 'string',
          example: 'user@stanford.edu',
        },
        code: {
          type: 'string',
          example: '123456',
        },
      },
      required: ['email', 'code'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'College email verified successfully',
  })
  async verifyCollegeOtp(
    @CurrentUser() user: any,
    @Body() dto: { email: string; code: string },
  ) {
    await this.otpService.verifyOtp(dto.email, dto.code, 'college_verification');
    return { message: 'College email verified successfully' };
  }
}

