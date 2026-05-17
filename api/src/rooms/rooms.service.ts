                                   import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { Room, RoomStatus, RoomType } from './entities/room.entity';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { CheckInDto } from './dto/check-in.dto';
import { EventsGateway } from '../gateways/events.gateway';

@Injectable()
export class RoomsService {
  private rooms: Map<string, Room> = new Map();

  constructor(private readonly eventsGateway: EventsGateway) {
    this.seedData();
  }

  private seedData() {
    const sampleRooms: CreateRoomDto[] = [
      { roomNumber: '101', floor: 1, type: RoomType.SINGLE, pricePerNight: 80, amenities: ['WiFi', 'TV'] },
      { roomNumber: '102', floor: 1, type: RoomType.DOUBLE, pricePerNight: 120, amenities: ['WiFi', 'TV', 'AC', 'Mini Bar'] },
      { roomNumber: '201', floor: 2, type: RoomType.DOUBLE, pricePerNight: 130, amenities: ['WiFi', 'TV', 'AC', 'Balcony'] },
      { roomNumber: '202', floor: 2, type: RoomType.SUITE, pricePerNight: 250, amenities: ['WiFi', 'TV', 'AC', 'Jacuzzi', 'Mini Bar'] },
      { roomNumber: '301', floor: 3, type: RoomType.DELUXE, pricePerNight: 350, amenities: ['WiFi', 'TV', 'AC', 'Jacuzzi', 'Mini Bar', 'Ocean View'] },
      { roomNumber: '302', floor: 3, type: RoomType.PRESIDENTIAL, pricePerNight: 500, amenities: ['WiFi', 'TV', 'AC', 'Jacuzzi', 'Mini Bar', 'Butler Service', 'Private Pool'] },
    ];

    sampleRooms.forEach((dto) => {
      const room = this.createRoomEntity(dto);
      this.rooms.set(room.id, room);
    });

    // Set initial room statuses without emitting events (these are just seed data)
    const roomsArray = [...this.rooms.values()];
    
    // Make room 102 occupied
    const room102 = roomsArray[1];
    room102.status = RoomStatus.OCCUPIED;
    room102.guestName = 'John Smith';
    room102.guestPhone = '+1-555-0123';
    room102.checkInDate = new Date();
    room102.checkOutDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
    
    // Make room 201 cleaning
    const room201 = roomsArray[2];
    room201.status = RoomStatus.CLEANING;
    room201.lastCleaned = new Date(Date.now() - 2 * 60 * 60 * 1000);
    
    // Make room 202 maintenance
    const room202 = roomsArray[3];
    room202.status = RoomStatus.MAINTENANCE;
    room202.notes = 'AC unit needs repair';
  }

  private createRoomEntity(dto: CreateRoomDto): Room {
    const now = new Date();
    return {
      id: uuidv4(),
      roomNumber: dto.roomNumber,
      floor: dto.floor,
      type: dto.type,
      status: RoomStatus.VACANT,
      pricePerNight: dto.pricePerNight || 100,
      amenities: dto.amenities || [],
      createdAt: now,
      updatedAt: now,
    };
  }

  findAll(filters?: { floor?: number; status?: RoomStatus; type?: RoomType }): Room[] {
    let rooms = [...this.rooms.values()];

    if (filters?.floor !== undefined) {
      rooms = rooms.filter((r) => r.floor === filters.floor);
    }
    if (filters?.status) {
      rooms = rooms.filter((r) => r.status === filters.status);
    }
    if (filters?.type) {
      rooms = rooms.filter((r) => r.type === filters.type);
    }

    return rooms.sort((a, b) => a.roomNumber.localeCompare(b.roomNumber));
  }

  findOne(id: string): Room {
    const room = this.rooms.get(id);
    if (!room) {
      throw new NotFoundException(`Room with ID ${id} not found`);
    }
    return room;
  }

  create(dto: CreateRoomDto): Room {
    const existingRoom = [...this.rooms.values()].find(
      (r) => r.roomNumber === dto.roomNumber,
    );
    if (existingRoom) {
      throw new BadRequestException(`Room number ${dto.roomNumber} already exists`);
    }

    const room = this.createRoomEntity(dto);
    this.rooms.set(room.id, room);
    this.eventsGateway.emitRoomCreated(room);
    this.eventsGateway.emitStatsUpdate(this.getStats());
    return room;
  }

  update(id: string, dto: UpdateRoomDto): Room {
    const room = this.findOne(id);
    const updatedRoom = {
      ...room,
      ...dto,
      checkInDate: dto.checkInDate ? new Date(dto.checkInDate) : room.checkInDate,
      checkOutDate: dto.checkOutDate ? new Date(dto.checkOutDate) : room.checkOutDate,
      updatedAt: new Date(),
    };
    this.rooms.set(id, updatedRoom);
    this.eventsGateway.emitRoomUpdate(id, updatedRoom);
    this.eventsGateway.emitStatsUpdate(this.getStats());
    return updatedRoom;
  }

  remove(id: string): void {
    const room = this.findOne(id);
    if (room.status === RoomStatus.OCCUPIED) {
      throw new BadRequestException('Cannot delete an occupied room');
    }
    this.eventsGateway.emitRoomDeleted(id);
    this.eventsGateway.emitStatsUpdate(this.getStats());
    this.rooms.delete(id);
  }

  checkInRoom(id: string, dto: CheckInDto): Room {
    const room = this.findOne(id);

    if (room.status !== RoomStatus.VACANT) {
      throw new BadRequestException(`Room is not available. Current status: ${room.status}`);
    }

    const updatedRoom = {
      ...room,
      status: RoomStatus.OCCUPIED,
      guestName: dto.guestName,
      guestPhone: dto.guestPhone,
      checkInDate: new Date(dto.checkInDate),
      checkOutDate: new Date(dto.checkOutDate),
      updatedAt: new Date(),
    };
    this.rooms.set(id, updatedRoom);
    this.eventsGateway.emitRoomUpdate(id, updatedRoom);
    this.eventsGateway.emitStatsUpdate(this.getStats());
    return updatedRoom;
  }

  checkOutRoom(id: string): Room {
    const room = this.findOne(id);

    if (room.status !== RoomStatus.OCCUPIED) {
      throw new BadRequestException(`Room is not occupied. Current status: ${room.status}`);
    }

    const updatedRoom = {
      ...room,
      status: RoomStatus.CLEANING,
      guestName: undefined,
      guestPhone: undefined,
      checkInDate: undefined,
      checkOutDate: undefined,
      updatedAt: new Date(),
    };
    this.rooms.set(id, updatedRoom);
    this.eventsGateway.emitRoomUpdate(id, updatedRoom);
    this.eventsGateway.emitStatsUpdate(this.getStats());
    return updatedRoom;
  }

  setCleaningComplete(id: string): Room {
    const room = this.findOne(id);

    if (room.status !== RoomStatus.CLEANING) {
      throw new BadRequestException(`Room is not in cleaning status. Current status: ${room.status}`);
    }

    const updatedRoom = {
      ...room,
      status: RoomStatus.VACANT,
      lastCleaned: new Date(),
      updatedAt: new Date(),
    };
    this.rooms.set(id, updatedRoom);
    this.eventsGateway.emitRoomUpdate(id, updatedRoom);
    this.eventsGateway.emitStatsUpdate(this.getStats());
    return updatedRoom;
  }

  getStats() {
    const rooms = [...this.rooms.values()];
    return {
      total: rooms.length,
      vacant: rooms.filter((r) => r.status === RoomStatus.VACANT).length,
      occupied: rooms.filter((r) => r.status === RoomStatus.OCCUPIED).length,
      cleaning: rooms.filter((r) => r.status === RoomStatus.CLEANING).length,
      maintenance: rooms.filter((r) => r.status === RoomStatus.MAINTENANCE).length,
      reserved: rooms.filter((r) => r.status === RoomStatus.RESERVED).length,
      occupancyRate: Math.round(
        (rooms.filter((r) => r.status === RoomStatus.OCCUPIED).length / rooms.length) * 100,
      ),
    };
  }
}
