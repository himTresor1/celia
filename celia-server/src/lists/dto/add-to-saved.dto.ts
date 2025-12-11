import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class AddToSavedDto {
  @IsNotEmpty()
  @IsString()
  savedUserId: string;

  @IsOptional()
  @IsString()
  context?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
