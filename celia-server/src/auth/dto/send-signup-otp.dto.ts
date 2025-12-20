import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class SendSignupOtpDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Email address to send OTP to',
  })
  @IsEmail()
  email: string;
}

