import { IsString, IsOptional, IsBoolean, Length, IsUUID } from 'class-validator';

export class CreatePaymentDto {
  @IsUUID()
  userId!: string;

  @IsString()
  type!: string;

  @IsString()
  @IsOptional()
  provider?: string;

  @IsString()
  @Length(4, 4)
  @IsOptional()
  lastFour?: string;

  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;
}
