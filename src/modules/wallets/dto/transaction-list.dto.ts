import { Transform, Type } from 'class-transformer';
import { IsInt } from 'class-validator';

export class TransactionListDto {
  @IsInt()
  @Transform(({ value }) => Number(value))
  take: number;

  @IsInt()
  @Type(() => Number)
  skip: number;
}
