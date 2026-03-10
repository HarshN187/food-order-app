import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class AddItemDto {
  @IsString()
  @IsNotEmpty()
  menuItemId!: string;

  @IsNumber()
  @IsNotEmpty()
  quantity!: number;
}
