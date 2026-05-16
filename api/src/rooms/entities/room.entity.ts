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

export class Room {
  id: string;
  roomNumber: string;
  floor: number;
  type: RoomType;
  status: RoomStatus;
  guestName?: string;
  guestPhone?: string;
  checkInDate?: Date;
  checkOutDate?: Date;
  pricePerNight: number;
  notes?: string;
  amenities: string[];
  lastCleaned?: Date;
  createdAt: Date;
  updatedAt: Date;
}
