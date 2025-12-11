import { IsNotEmpty, IsString, IsArray, IsOptional, ArrayMinSize } from 'class-validator';

export class BulkInviteDto {
  @IsNotEmpty()
  @IsString()
  eventId: string;

  @IsNotEmpty()
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  userIds: string[];

  @IsOptional()
  @IsString()
  personalMessage?: string;
}
