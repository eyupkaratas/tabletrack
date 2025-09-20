import {
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { TablesService } from './tables.service';

@Controller('tables')
export class TablesController {
  constructor(private readonly svc: TablesService) {}

  @Get()
  findAll() {
    return this.svc.findAll();
  }

  @Get(':number')
  findByNumber(@Param('number', ParseIntPipe) number: number) {
    return this.svc.findByNumber(number);
  }

  @Get(':number/details')
  getTableWithOrders(@Param('number', ParseIntPipe) number: number) {
    return this.svc.getTableWithOrders(number);
  }

  @Post()
  createNext() {
    return this.svc.createNext();
  }

  @Patch(':number/status')
  toggle(@Param('number', ParseIntPipe) number: number) {
    return this.svc.toggleStatusByNumber(number);
  }

  @Delete('last')
  removeLast() {
    return this.svc.removeLast();
  }
}
