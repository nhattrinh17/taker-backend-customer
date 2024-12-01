import { IsInt } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class ListServicesDto {
  @IsInt()
  @Transform(({ value }) => Number(value))
  take: number;

  @IsInt()
  @Type(() => Number)
  skip: number;
}
