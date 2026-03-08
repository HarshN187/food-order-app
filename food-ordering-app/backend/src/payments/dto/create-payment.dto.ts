import { IsString, IsOptional, IsBoolean, Length } from 'class-validator';

export class CreatePaymentDto {
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
