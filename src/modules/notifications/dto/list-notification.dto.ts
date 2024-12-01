import { Transform, Type } from 'class-transformer';
import { IsInt, Max, Min } from 'class-validator';

export class ListNotificationDto {
  @Max(100)
  @IsInt()
  @Transform(({ value }) => Number(value))
  take: number;

  @Min(0)
  @IsInt()
  @Type(() => Number)
  skip: number;
}
