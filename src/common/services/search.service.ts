import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import { ISearchNearBy, ISearchDetail } from '@common/index';

@Injectable()
export class SearchService {
  private readonly logger = new Logger(SearchService.name);
  constructor(private readonly configService: ConfigService) {}

  /**
   * Function to search nearby places
   * @param latitude
   * @param longitude
   * @returns List of places
   */
  suggestionByText({ latitude, longitude, keyword }: ISearchNearBy) {
    const apiKey = this.configService.get('HERE_API_KEY');
    const baseUrl = this.configService.get('HERE_API_BASE_URL');
    const params = {
      at: `${latitude},${longitude}`,
      apiKey: apiKey,
      language: 'vi',
      limit: 20,
    };
    if (keyword) params['q'] = keyword;
    return axios.get(`${baseUrl}/autosuggest`, {
      params,
    });
  }

  /**
   * Function to get detail of the place
   * @param latitude
   * @param longitude
   * @returns List of places
   */
  async revGeoCode({ latitude, longitude }: ISearchDetail) {
    const apiKey = this.configService.get('HERE_API_KEY');
    const baseUrl = this.configService.get('HERE_API_GEOCODE_BASE_URL');
    return axios.get(
      `${baseUrl}/revgeocode?at=${latitude},${longitude}&limit=${20}&apiKey=${apiKey}`,
    );
  }
}
