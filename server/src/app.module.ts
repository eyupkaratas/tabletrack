import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';

import { NotificationsGateway } from './notifications/notifications.gateway';
import { OrdersModule } from './orders/orders.module';
import { ProductsModule } from './products/products.module';
import { TablesModule } from './tables/tables.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    UsersModule,
    ProductsModule,
    TablesModule,
    OrdersModule,
  ],
  providers: [NotificationsGateway],
})
export class AppModule {}
