import { PartialType, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';
import { CreateEventDto } from './create-event.dto';

export class UpdateEventDto extends PartialType(CreateEventDto) {
  @ApiPropertyOptional({
    example: 'Event cancelled due to bad weather',
    description: 'Cancellation reason (required if status is cancelled)',
  })
  @IsOptional()
  @IsString()
  cancellationReason?: string;
}
