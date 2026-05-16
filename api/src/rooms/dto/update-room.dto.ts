import {
  IsString,
  IsNumber,
  IsEnum,
  IsOptional,
  IsArray,
  IsDateString,
  Min,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { RoomStatus, RoomType } from '../entities/room.entity';

export class UpdateRoomDto {
  @ApiPropertyOptional({ description: 'Room number', example: '101' })
  @IsString()
  @IsOptional()
  roomNumber?: string;

  @ApiPropertyOptional({ description: 'Floor number', example: 1 })
  @IsNumber()
  @IsOptional()
  @Min(1)
  floor?: number;

  @ApiPropertyOptional({ description: 'Room type', enum: RoomType })
  @IsEnum(RoomType)
  @IsOptional()
  type?: RoomType;

  @ApiPropertyOptional({ description: 'Room status', enum: RoomStatus })
  @IsEnum(RoomStatus)
  @IsOptional()
  status?: RoomStatus;

  @ApiPropertyOptional({ description: 'Guest name' })
  @IsString()
  @IsOptional()
  guestName?: string;

  @ApiPropertyOptional({ description: 'Guest phone number' })
  @IsString()
  @IsOptional()
  guestPhone?: string;

  @ApiPropertyOptional({ description: 'Check-in date' })
  @IsDateString()
  @IsOptional()
  checkInDate?: string;

  @ApiPropertyOptional({ description: 'Check-out date' })
  @IsDateString()
  @IsOptional()
  checkOutDate?: string;

  @ApiPropertyOptional({ description: 'Price per night', example: 100 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  pricePerNight?: number;

  @ApiPropertyOptional({ description: 'Room notes' })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({ description: 'Room amenities' })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  amenities?: string[];
}
