import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';

import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/jwt.guard';
import { RolesGuard } from './auth/roles.guard';

import { ContactModule } from './contact/contact.module';
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
    ContactModule,
  ],
  providers: [
    NotificationsGateway,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard, // global
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard, // global
    },
  ],
})
export class AppModule {}
