import { Module } from '@nestjs/common';
import { RoomsController } from './rooms.controller';
import { RoomsService } from './rooms.service';
import { EventsGateway } from '../gateways/events.gateway';

@Module({
  controllers: [RoomsController],
  providers: [RoomsService, EventsGateway],
  exports: [RoomsService],
})
export class RoomsModule {}
