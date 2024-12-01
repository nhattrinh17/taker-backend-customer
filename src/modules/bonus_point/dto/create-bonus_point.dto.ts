import { Transform } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateTransferBonusPointDto {
  @IsString()
  idProduct: string;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => Number(value))
  points: number;
}
