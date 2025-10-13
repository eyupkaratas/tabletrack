import { IsEnum } from 'class-validator';
import { orderStatus } from 'src/db/schema';

type OrderStatusEnum = (typeof orderStatus.enumValues)[number];

export class UpdateOrderStatusDto {
  @IsEnum(orderStatus.enumValues, {
    message: 'Status must be one of open, completed, closed',
  })
  status: OrderStatusEnum;
}
