import { IsOptional, IsString } from 'class-validator';

export * from './http-exception.filter';
export class QuerySortDto {
  @IsOptional()
  @IsString()
  sort?: string;

  @IsOptional()
  @IsString()
  typeSort?: 'ASC' | 'DESC';
}
