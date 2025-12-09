import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsIn } from 'class-validator';

export class UpdateInvitationDto {
  @ApiProperty({
    example: 'going',
    description: 'Invitation status',
    enum: ['pending', 'going', 'declined'],
  })
  @IsString()
  @IsIn(['pending', 'going', 'declined'])
  status: string;
}
