import { IsOptional, IsString } from 'class-validator';

export class SearchDto {
  @IsOptional()
  @IsString()
  keyword: string;

  // @IsLatitude({ message: 'Latitude is invalid' })
  @IsString()
  latitude: string;

  // @IsLongitude({ message: 'Longitude is invalid' })
  @IsString()
  longitude: string;
}

export class SearchDetailDto {
  // @IsLatitude({ message: 'Latitude is invalid' })
  @IsString()
  latitude: string;

  // @IsLongitude({ message: 'Longitude is invalid' })
  @IsString()
  longitude: string;
}

export class SearchNearByDto {
  // @IsLatitude({ message: 'Latitude is invalid' })
  @IsString()
  latitude: string;

  // @IsLongitude({ message: 'Longitude is invalid' })
  @IsString()
  longitude: string;
}