export enum RoomStatus {
  VACANT = 'VACANT',
  OCCUPIED = 'OCCUPIED',
  CLEANING = 'CLEANING',
  MAINTENANCE = 'MAINTENANCE',
  RESERVED = 'RESERVED',
}

export enum RoomType {
  SINGLE = 'SINGLE',
  DOUBLE = 'DOUBLE',
  SUITE = 'SUITE',
  DELUXE = 'DELUXE',
  PRESIDENTIAL = 'PRESIDENTIAL',
}

export interface Room {
  id: string;
  roomNumber: string;
  floor: number;
  type: RoomType;
  status: RoomStatus;
  guestName?: string;
  guestPhone?: string;
  checkInDate?: string;
  checkOutDate?: string;
  pricePerNight: number;
  notes?: string;
  amenities: string[];
  lastCleaned?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RoomStats {
  total: number;
  vacant: number;
  occupied: number;
  cleaning: number;
  maintenance: number;
  reserved: number;
  occupancyRate: number;
}

export interface CreateRoomDto {
  roomNumber: string;
  floor: number;
  type: RoomType;
  pricePerNight?: number;
  amenities?: string[];
}

export interface CheckInDto {
  guestName: string;
  guestPhone?: string;
  checkInDate: string;
  checkOutDate: string;
}
