import { io, Socket } from 'socket.io-client';
import { Room, RoomStats } from '../types/room';

const SOCKET_URL = 'http://localhost:3001';

class SocketService {
  private socket: Socket | null = null;

  connect() {
    if (!this.socket) {
      this.socket = io(SOCKET_URL, {
        transports: ['websocket', 'polling'],
      });

      this.socket.on('connect', () => {
        console.log('Socket connected:', this.socket?.id);
      });

      this.socket.on('disconnect', () => {
        console.log('Socket disconnected');
      });
    }
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  onRoomUpdated(callback: (data: { roomId: string; room: Room }) => void) {
    this.socket?.on('room:updated', callback);
  }

  onRoomCreated(callback: (room: Room) => void) {
    this.socket?.on('room:created', callback);
  }

  onRoomDeleted(callback: (data: { roomId: string }) => void) {
    this.socket?.on('room:deleted', callback);
  }

  onStatsUpdated(callback: (stats: RoomStats) => void) {
    this.socket?.on('stats:updated', callback);
  }

  offRoomUpdated() {
    this.socket?.off('room:updated');
  }

  offRoomCreated() {
    this.socket?.off('room:created');
  }

  offRoomDeleted() {
    this.socket?.off('room:deleted');
  }

  offStatsUpdated() {
    this.socket?.off('stats:updated');
  }
}

export const socketService = new SocketService();
export default socketService;
