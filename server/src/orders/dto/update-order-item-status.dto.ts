import { IsString } from 'class-validator';

export class UpdateOrderItemStatusDto {
  @IsString()
  status: 'placed' | 'served' | 'cancelled';
}
