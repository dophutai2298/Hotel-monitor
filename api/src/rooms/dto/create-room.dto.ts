import {
  IsString,
  IsNumber,
  IsEnum,
  IsOptional,
  IsArray,
  IsDateString,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RoomStatus, RoomType } from '../entities/room.entity';

export class CreateRoomDto {
  @ApiProperty({ description: 'Room number', example: '101' })
  @IsString()
  roomNumber: string;

  @ApiProperty({ description: 'Floor number', example: 1 })
  @IsNumber()
  @Min(1)
  floor: number;

  @ApiProperty({ description: 'Room type', enum: RoomType, example: RoomType.DOUBLE })
  @IsEnum(RoomType)
  type: RoomType;

  @ApiPropertyOptional({ description: 'Price per night', example: 100 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  pricePerNight?: number;

  @ApiPropertyOptional({ description: 'Room amenities', example: ['WiFi', 'TV', 'AC'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  amenities?: string[];
}
