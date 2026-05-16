import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { RoomsService } from './rooms.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { CheckInDto } from './dto/check-in.dto';
import { Room, RoomStatus, RoomType } from './entities/room.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('rooms')
@Controller('rooms')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all rooms' })
  @ApiQuery({ name: 'floor', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: RoomStatus })
  @ApiQuery({ name: 'type', required: false, enum: RoomType })
  @ApiResponse({ status: 200, description: 'List of rooms' })
  findAll(
    @Query('floor') floor?: number,
    @Query('status') status?: RoomStatus,
    @Query('type') type?: RoomType,
  ): Room[] {
    return this.roomsService.findAll({
      floor: floor ? Number(floor) : undefined,
      status,
      type,
    });
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get room statistics' })
  @ApiResponse({ status: 200, description: 'Room statistics' })
  getStats() {
    return this.roomsService.getStats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get room by ID' })
  @ApiResponse({ status: 200, description: 'Room details' })
  @ApiResponse({ status: 404, description: 'Room not found' })
  findOne(@Param('id', ParseUUIDPipe) id: string): Room {
    return this.roomsService.findOne(id);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Create a new room (admin only)' })
  @ApiResponse({ status: 201, description: 'Room created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input or room number exists' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  create(@Body() createRoomDto: CreateRoomDto): Room {
    return this.roomsService.create(createRoomDto);
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Update room details (admin only)' })
  @ApiResponse({ status: 200, description: 'Room updated successfully' })
  @ApiResponse({ status: 404, description: 'Room not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateRoomDto: UpdateRoomDto,
  ): Room {
    return this.roomsService.update(id, updateRoomDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Delete a room (admin only)' })
  @ApiResponse({ status: 200, description: 'Room deleted successfully' })
  @ApiResponse({ status: 404, description: 'Room not found' })
  @ApiResponse({ status: 400, description: 'Cannot delete occupied room' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  remove(@Param('id', ParseUUIDPipe) id: string): { message: string } {
    this.roomsService.remove(id);
    return { message: 'Room deleted successfully' };
  }

  @Post(':id/check-in')
  @ApiOperation({ summary: 'Check in a guest (authenticated users)' })
  @ApiResponse({ status: 200, description: 'Guest checked in successfully' })
  @ApiResponse({ status: 400, description: 'Room not available' })
  checkIn(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() checkInDto: CheckInDto,
  ): Room {
    return this.roomsService.checkInRoom(id, checkInDto);
  }

  @Post(':id/check-out')
  @ApiOperation({ summary: 'Check out a guest (authenticated users)' })
  @ApiResponse({ status: 200, description: 'Guest checked out successfully' })
  @ApiResponse({ status: 400, description: 'Room not occupied' })
  checkOut(@Param('id', ParseUUIDPipe) id: string): Room {
    return this.roomsService.checkOutRoom(id);
  }

  @Patch(':id/cleaning-complete')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Mark room cleaning as complete (admin only)' })
  @ApiResponse({ status: 200, description: 'Cleaning marked complete' })
  @ApiResponse({ status: 400, description: 'Room not in cleaning status' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  cleaningComplete(@Param('id', ParseUUIDPipe) id: string): Room {
    return this.roomsService.setCleaningComplete(id);
  }
}