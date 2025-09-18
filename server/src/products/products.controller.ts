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

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.svc.findOne(id);
  }

  @Get(':name')
  findbyName(@Param('name') name: string) {
    return this.svc.findByName(name);
  }

  @Get(':category')
  findbyCategory(@Param('category') name: string) {
    return this.svc.findByCategory(name);
  }

  @Post()
  create(@Body() dto: CreateProductDto) {
    return this.svc.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.svc.update.apply(id, dto);
  }

  @Delete('id')
  remove(@Param('id') id: string) {
    return this.svc.remove(id);
  }
}
