// src/orders/dto/open-order.dto.ts
import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsUUID, ValidateNested } from 'class-validator';
import { OrderItemDto } from './order-item.dto';

export class OpenOrderDto {
  @IsUUID('4')
  tableId!: string;

  @IsUUID('4')
  openedByUserId!: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items!: OrderItemDto[];
}
