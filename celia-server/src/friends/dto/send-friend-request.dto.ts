import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, MaxLength } from 'class-validator';

export class SendFriendRequestDto {
  @ApiProperty({
    example: 'user_123e4567-e89b-12d3-a456-426614174000',
    description: 'The ID of the user to send a friend request to.',
  })
  @IsNotEmpty()
  @IsString()
  toUserId: string;

  @ApiPropertyOptional({
    example: 'Hey! I saw we have mutual friends. Want to connect?',
    description: 'An optional personal message to include with the friend request (max 255 characters).',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  message?: string;
}

