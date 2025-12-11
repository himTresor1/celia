import { IsOptional, IsString, IsInt, Min, Max, IsArray, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class RecommendationFiltersDto {
  @IsOptional()
  @IsString()
  gender?: string;

  @IsOptional()
  @IsString()
  collegeId?: string;

  @IsOptional()
  @IsInt()
  @Min(18)
  @Type(() => Number)
  minAge?: number;

  @IsOptional()
  @IsInt()
  @Max(100)
  @Type(() => Number)
  maxAge?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  @Type(() => Number)
  minScore?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  @Type(() => Number)
  maxScore?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  interests?: string[];

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  hasMutualFriends?: boolean;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number;
}
