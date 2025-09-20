// src/orders/dto/open-order-item.dto.ts
import { IsInt, IsUUID, Min } from 'class-validator';

export class OrderItemDto {
  @IsUUID('4')
  productId!: string;

  @IsInt()
  @Min(1)
  quantity!: number;
}
