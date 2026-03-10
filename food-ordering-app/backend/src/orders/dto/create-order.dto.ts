import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateOrderDto {
  @IsString()
  @IsNotEmpty()
  restaurantId!: string;

  @IsString()
  @IsOptional()
  paymentMethodId?: string;
}
