import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService], // AuthModule içinde de kullanılacak
})
export class UsersModule {}
