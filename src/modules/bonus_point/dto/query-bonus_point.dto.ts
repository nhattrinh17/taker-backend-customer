import { PaginationDto } from '@common/decorators';
import { IsString } from 'class-validator';

export class QueryGetProductDto extends PaginationDto {
  @IsString()
  type: string;
}
