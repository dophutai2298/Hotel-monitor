import { Module } from '@nestjs/common';
import { RoomsModule } from './rooms/rooms.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { EventsGateway } from './gateways/events.gateway';

@Module({
  imports: [RoomsModule, UsersModule, AuthModule],
  controllers: [],
  providers: [EventsGateway],
})
export class AppModule {}