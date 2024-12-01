import { Type } from 'class-transformer';
import { IsInt, IsNumber, Min } from 'class-validator';

export class ListWalletDto {
  @IsInt()
  @Type(() => Number)
  skip: number;

  @IsInt()
  @Type(() => Number)
  take: number;
}

export class DepositDto {
  @Min(5000)
  @IsNumber()
  @Type(() => Number)
  amount: number;
}

export class WithdrawDto {
  @Min(50000)
  @IsNumber()
  @Type(() => Number)
  amount: number;
}
