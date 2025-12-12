import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsInt,
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  Min,
  Max,
  MinLength,
  MaxLength,
} from 'class-validator';

export class UpdateUserDto {
  @ApiPropertyOptional({
    example: 'John Doe',
    description: 'User full name',
  })
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiPropertyOptional({
    example: 'Stanford University',
    description: 'College or university name',
  })
  @IsOptional()
  @IsString()
  collegeName?: string;

  @ApiPropertyOptional({
    example: 'Computer Science',
    description: 'Major or field of study',
  })
  @IsOptional()
  @IsString()
  major?: string;

  @ApiPropertyOptional({
    example: 2025,
    description: 'Expected graduation year',
  })
  @IsOptional()
  @IsInt()
  @Min(2020)
  @Max(2035)
  graduationYear?: number;

  @ApiPropertyOptional({
    example:
      'Hey there! I love hiking and meeting new people. Always down for a coffee chat!',
    description: 'User bio (optional, up to 500 characters)',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  bio?: string;

  @ApiPropertyOptional({
    example: 'https://example.com/avatar.jpg',
    description: 'Avatar URL',
  })
  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @ApiPropertyOptional({
    example: ['https://example.com/photo1.jpg'],
    description: 'Profile photo URLs (1-5 photos)',
  })
  @IsOptional()
  @IsArray()
  photoUrls?: string[];

  @ApiPropertyOptional({
    example: ['Sports & Fitness', 'Technology & Gaming', 'Food & Cooking'],
    description: 'User interests (3-10 items)',
  })
  @IsOptional()
  @IsArray()
  interests?: string[];

  @ApiPropertyOptional({
    example: ['Stanford, CA', 'San Francisco, CA'],
    description: 'Preferred locations (up to 3)',
  })
  @IsOptional()
  @IsArray()
  preferredLocations?: string[];

  @ApiPropertyOptional({
    example: true,
    description: 'College verification status',
  })
  @IsOptional()
  @IsBoolean()
  collegeVerified?: boolean;

  @ApiPropertyOptional({
    example: true,
    description: 'Profile completion status',
  })
  @IsOptional()
  @IsBoolean()
  profileCompleted?: boolean;

  @ApiPropertyOptional({
    example: '2000-01-15',
    description: 'Date of birth (YYYY-MM-DD)',
  })
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @ApiPropertyOptional({
    example: 'male',
    description: 'Gender (male, female, non-binary, prefer-not-to-say)',
  })
  @IsOptional()
  @IsEnum(['male', 'female', 'non-binary', 'prefer-not-to-say'])
  gender?: string;

  @ApiPropertyOptional({
    example: 'uuid-of-college',
    description: 'College ID',
  })
  @IsOptional()
  @IsString()
  collegeId?: string;
}
