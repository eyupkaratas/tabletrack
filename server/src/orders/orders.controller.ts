import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
} from '@nestjs/common';
import { OpenOrderDto } from './dto/open-order.dto';
import { UpdateOrderItemStatusDto } from './dto/update-order-item-status.dto';
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
  @Put('/order-items/:id/status')
  async updateOrderItemStatus(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateOrderItemStatusDto,
  ) {
    return this.svc.updateOrderItemStatus(id, dto.status);
  }
}
