import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  MinLength,
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
}
