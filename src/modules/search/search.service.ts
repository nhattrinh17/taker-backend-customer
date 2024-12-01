import { BadRequestException, Injectable } from '@nestjs/common';
import * as h3 from 'h3-js';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SearchService as GoogleSearchService } from '@common/index';

import { IPlaceDetail, IPlaceGeoDetail } from '@common/index';
import { SearchDto, SearchDetailDto } from './dto/search.dto';

@Injectable()
export class SearchService {
  constructor(
    private readonly search: GoogleSearchService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Function to search nearby places
   * @param searchDto
   * @returns List of places
   */
  async suggestionByText(searchDto: SearchDto) {
    try {
      const res = await this.search.suggestionByText(searchDto);

      if (res?.status === 200) {
        return res.data.items
          .sort((a: IPlaceDetail, b: IPlaceDetail) => a.distance - b.distance)
          .map(({ title, address, position, distance }: IPlaceDetail) => ({
            title,
            address,
            position,
            distance,
          }));
      }
      return [];
    } catch (error) {
      throw new BadRequestException(error?.message);
    }
  }

  /**
   * Function to get place detail
   * @param searchDetailDto
   * @returns Detail of the place
   */
  async getPlaceDetailV2(searchDetailDto: SearchDetailDto) {
    try {
      const res = await this.search.revGeoCode(searchDetailDto);
      if (res.status === 200) {
        return res.data.items
          .sort(
            (a: IPlaceGeoDetail, b: IPlaceGeoDetail) => a.distance - b.distance,
          )
          .map(({ title, address, distance }: IPlaceGeoDetail) => ({
            title,
            address,
            distance,
          }));
      }
      return [];
    } catch (error) {
      throw new BadRequestException(error?.message);
    }
  }

  /**
   * Function to get close shoemakers
   * @param searchDto
   * @returns List of shoemakers
   */
  async getCloseShoemakers({ latitude, longitude }: SearchDetailDto) {
    try {
      const res = 9;
      const h = h3.latLngToCell(Number(latitude), Number(longitude), res);

      const boundary = h3
        .cellToBoundary(h)
        .map((boundary) => ({ latitude: boundary[0], longitude: boundary[1] }));

      //TODO: In the future, probably we need to query the database to get the shoemakers
      // this.eventEmitter.emit('shoemaker.update.location', boundary);

      return boundary;
    } catch (error) {
      throw new BadRequestException(error?.message);
    }
  }
}
