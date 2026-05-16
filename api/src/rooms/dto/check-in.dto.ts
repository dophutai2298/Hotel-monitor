import { IsString, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CheckInDto {
  @ApiProperty({ description: 'Guest name' })
  @IsString()
  guestName: string;

  @ApiPropertyOptional({ description: 'Guest phone number' })
  @IsString()
  @IsOptional()
  guestPhone?: string;

  @ApiProperty({ description: 'Check-in date (ISO format)' })
  @IsDateString()
  checkInDate: string;

  @ApiProperty({ description: 'Expected check-out date (ISO format)' })
  @IsDateString()
  checkOutDate: string;
}
