import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsInt,
  IsArray,
  IsDateString,
  Min,
  MinLength,
  MaxLength,
  IsNumber,
} from 'class-validator';

export class CreateEventDto {
  @ApiProperty({
    example: 'Weekend Hiking Trip',
    description: 'Event name (3-50 characters)',
  })
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  name: string;

  @ApiPropertyOptional({
    example:
      'Join us for an amazing hiking adventure in the mountains! We will explore beautiful trails and enjoy nature together.',
    description: 'Event description (50-500 characters)',
  })
  @IsOptional()
  @IsString()
  @MinLength(50)
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({
    example: 'uuid-of-category',
    description: 'Event category ID',
  })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiPropertyOptional({
    example: 'Stanford Campus, Memorial Auditorium',
    description: 'Location name',
  })
  @IsOptional()
  @IsString()
  locationName?: string;

  @ApiPropertyOptional({
    example: 37.4275,
    description: 'Location latitude',
  })
  @IsOptional()
  @IsNumber()
  locationLat?: number;

  @ApiPropertyOptional({
    example: -122.1697,
    description: 'Location longitude',
  })
  @IsOptional()
  @IsNumber()
  locationLng?: number;

  @ApiPropertyOptional({
    example: '2024-12-25',
    description: 'Event date (YYYY-MM-DD)',
  })
  @IsOptional()
  @IsDateString()
  eventDate?: string;

  @ApiPropertyOptional({
    example: '2024-12-25T14:00:00Z',
    description: 'Event start time (ISO 8601)',
  })
  @IsOptional()
  @IsDateString()
  startTime?: string;

  @ApiPropertyOptional({
    example: '2024-12-25T18:00:00Z',
    description: 'Event end time (ISO 8601)',
  })
  @IsOptional()
  @IsDateString()
  endTime?: string;

  @ApiPropertyOptional({
    example: ['https://example.com/photo1.jpg'],
    description: 'Event photo URLs (1-10 photos)',
  })
  @IsOptional()
  @IsArray()
  photoUrls?: string[];

  @ApiPropertyOptional({
    example: ['Outdoor Activities', 'Sports & Fitness'],
    description: 'Interest tags for the event',
  })
  @IsOptional()
  @IsArray()
  interestTags?: string[];

  @ApiPropertyOptional({
    example: 50,
    description: 'Maximum number of attendees',
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  capacityLimit?: number;

  @ApiPropertyOptional({
    example: true,
    description: 'Whether the event is public or private',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @ApiPropertyOptional({
    example: 'draft',
    description: 'Event status (draft, active, cancelled, completed)',
    default: 'draft',
  })
  @IsOptional()
  @IsString()
  status?: string;
}
