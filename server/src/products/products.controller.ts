import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(private readonly svc: ProductsService) {}

  @Get()
  findAll() {
    return this.svc.findAll();
  }

  @Get('id/:id')
  findOne(@Param('id') id: string) {
    return this.svc.findOne(id);
  }

  @Get('name/:name')
  findbyName(@Param('name') name: string) {
    return this.svc.findByName(name);
  }

  @Get('category/:category')
  findbyCategory(@Param('category') name: string) {
    return this.svc.findByCategory(name);
  }

  @Post()
  create(@Body() dto: CreateProductDto) {
    return this.svc.create(dto);
  }

  @Patch('id/:id')
  update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.svc.update(id, dto);
  }

  @Delete('id/:id')
  remove(@Param('id') id: string) {
    return this.svc.remove(id);
  }
}
