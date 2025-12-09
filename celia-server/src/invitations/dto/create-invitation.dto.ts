import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsArray, MaxLength } from 'class-validator';

export class CreateInvitationDto {
  @ApiProperty({
    example: 'event-uuid',
    description: 'Event ID',
  })
  @IsString()
  eventId: string;

  @ApiProperty({
    example: 'user-uuid',
    description: 'Invitee user ID',
  })
  @IsString()
  inviteeId: string;

  @ApiPropertyOptional({
    example: 'Hey! Would love for you to join us for this event!',
    description: 'Personal message to invitee (max 200 characters)',
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  personalMessage?: string;
}

export class BulkInviteDto {
  @ApiProperty({
    example: 'event-uuid',
    description: 'Event ID',
  })
  @IsString()
  eventId: string;

  @ApiProperty({
    example: ['user-uuid-1', 'user-uuid-2', 'user-uuid-3'],
    description: 'Array of invitee user IDs',
  })
  @IsArray()
  inviteeIds: string[];

  @ApiPropertyOptional({
    example: 'Hey! Would love for you to join us for this event!',
    description: 'Personal message to all invitees (max 200 characters)',
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  personalMessage?: string;
}
