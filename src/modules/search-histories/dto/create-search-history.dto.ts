import { IsOptional, IsString } from 'class-validator';

export class CreateSearchHistoryDto {
  @IsOptional()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  address: string;

  @IsString()
  latitude: string;

  @IsString()
  longitude: string;
}
