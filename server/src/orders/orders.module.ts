import { Module } from '@nestjs/common';
import { NotificationsGateway } from 'src/notifications/notifications.gateway';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';

@Module({
  providers: [OrdersService, NotificationsGateway],
  controllers: [OrdersController],
  exports: [OrdersService],
})
export class OrdersModule {}
