import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  MinLength,
  IsOptional,
  IsInt,
  IsArray,
  Min,
  Max,
} from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    example: 'john.doe@stanford.edu',
    description: 'User email address',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'SecurePassword123',
    description: 'User password (min 8 characters)',
    minLength: 8,
  })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({
    example: 'John Doe',
    description: 'User full name',
  })
  @IsString()
  fullName: string;

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
    description: 'User bio (50-500 characters)',
  })
  @IsOptional()
  @IsString()
  bio?: string;

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
}
