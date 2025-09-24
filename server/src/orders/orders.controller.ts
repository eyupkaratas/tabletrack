// src/orders/orders.controller.ts
import { Body, Controller, Get, Post, Put } from '@nestjs/common';
import { OpenOrderDto } from './dto/open-order.dto';
import { OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController {
  constructor(private readonly svc: OrdersService) {}

  @Post('open')
  open(@Body() body: OpenOrderDto) {
    return this.svc.open(body);
  }
  @Get('count/open')
  getOpenCount() {
    return this.svc.getOpenCount();
  }
  @Put('close')
  async close(@Body('orderId') orderId: string) {
    return this.svc.close(orderId);
  }
}
/* @Get('table/:tableId')
  viewTable(@Param('tableId') tableId: string) {
    return this.svc.viewTable(tableId);
  } */
