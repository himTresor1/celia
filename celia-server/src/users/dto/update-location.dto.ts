import { IsNumber, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateLocationDto {
  @ApiProperty({ description: 'Latitude', example: 37.7749 })
  @IsNumber()
  @IsNotEmpty()
  lat: number;

  @ApiProperty({ description: 'Longitude', example: -122.4194 })
  @IsNumber()
  @IsNotEmpty()
  lng: number;
}
