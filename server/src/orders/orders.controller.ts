// src/orders/orders.controller.ts
import { Body, Controller, Post } from '@nestjs/common';
import { OpenOrderDto } from './dto/open-order.dto';
import { OrdersService } from './orders.service';

type OpenOrderBody = {
  tableId: string;
  openedByUserId: string;
  items: Array<{ productId: string; qty: number }>;
};

@Controller('orders')
export class OrdersController {
  constructor(private readonly svc: OrdersService) {}

  @Post('open')
  open(@Body() body: OpenOrderDto) {
    return this.svc.open(body);
  }

  /* @Get('table/:tableId')
  viewTable(@Param('tableId') tableId: string) {
    return this.svc.viewTable(tableId);
  } */
}
