import { FindAllResponse } from 'src/types/common.type';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

export interface BaseRepositoryInterface<T> {
  create(dto: T | any): Promise<T>;

  findOneById(id: string, projection?: (keyof T)[], option?: object): Promise<T | null>;

  findOneByCondition(condition?: object | any[], projection?: (keyof T)[], option?: object): Promise<T>;

  findAll(
    condition: object | any[],
    options?: {
      page: number;
      offset: number;
      limit: number;
      projection?: (keyof T)[];
      sort?: string;
      typeSort?: 'DESC' | 'ASC';
    },
  ): Promise<FindAllResponse<T>>;

  findOneAndUpdate(condition: object | any[], dto: QueryDeepPartialEntity<T>): Promise<T>;

  findByIdAndUpdate(id: string, dto: QueryDeepPartialEntity<T>): Promise<T>;

  // update(id: string, dto: QueryDeepPartialEntity<T>): Promise<T>;

  softDelete(id: string): Promise<boolean>;

  permanentlyDelete(id: string): Promise<boolean>;

  permanentlyDeleteByCondition(condition: object | any[]): Promise<boolean>;

  // insertMany(items: T[]): Promise<T[]>;

  count(condition?: object | any[]): Promise<number>;
}
