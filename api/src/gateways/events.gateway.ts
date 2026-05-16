import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
  },
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private connectedClients: Set<string> = new Set();

  handleConnection(client: Socket) {
    this.connectedClients.add(client.id);
    console.log(`Client connected: ${client.id}. Total: ${this.connectedClients.size}`);
  }

  handleDisconnect(client: Socket) {
    this.connectedClients.delete(client.id);
    console.log(`Client disconnected: ${client.id}. Total: ${this.connectedClients.size}`);
  }

  @SubscribeMessage('ping')
  handlePing(client: Socket): { event: string; data: string } {
    return { event: 'pong', data: 'pong' };
  }

  emitRoomUpdate(roomId: string, room: any) {
    this.server.emit('room:updated', { roomId, room });
  }

  emitRoomCreated(room: any) {
    this.server.emit('room:created', room);
  }

  emitRoomDeleted(roomId: string) {
    this.server.emit('room:deleted', { roomId });
  }

  emitStatsUpdate(stats: any) {
    this.server.emit('stats:updated', stats);
  }
}
