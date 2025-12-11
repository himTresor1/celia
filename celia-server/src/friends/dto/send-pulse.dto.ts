import { IsNotEmpty, IsString } from 'class-validator';

export class SendPulseDto {
  @IsNotEmpty()
  @IsString()
  toUserId: string;
}
