import { IsEmail, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ description: 'User email', example: 'admin@hotel.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'User password', example: 'admin123' })
  @IsString()
  password: string;
}