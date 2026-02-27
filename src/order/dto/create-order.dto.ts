import { OrderStatus } from '@prisma/client';
import { IsEnum } from 'class-validator';

export class CreateOrderDto {
  @IsEnum(OrderStatus)
  status: OrderStatus;
}
