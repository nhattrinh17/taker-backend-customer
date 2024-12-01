import { FindAllResponse } from 'src/types/common.type';
import { BaseRepositoryInterface } from './base.interface.repository';
import { Repository, EntityTarget, DeepPartial, SelectQueryBuilder } from 'typeorm';

import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

export abstract class BaseRepositoryAbstract<T> implements BaseRepositoryInterface<T> {
  protected constructor(protected readonly repository: Repository<T>) {}

  async create(dto: DeepPartial<T>): Promise<T> {
    const createdData = this.repository.create(dto);
    return await this.repository.save(createdData);
  }

  async findOneById(id: string, projection?: (keyof T)[], options?: any): Promise<T | null> {
    const item = await this.repository.findOne({
      where: { id } as any,
      select: projection as any,
      ...options,
    });
    return item ? item : null;
  }

  async findOneByCondition(condition?: object | any[], projection?: (keyof T)[], options?: any): Promise<T> {
    return await this.repository.findOne({
      where: condition,
      select: projection as any,
      ...options,
    });
  }

  async findAll(
    condition: object | any[],
    options?: {
      projection: (keyof T)[];
      sort: string;
      typeSort: 'ASC' | 'DESC';
      page: number;
      offset: number;
      limit: number;
    },
  ): Promise<FindAllResponse<T>> {
    const [items, count] = await this.repository.findAndCount({
      where: condition,
      select: options?.projection as any,
      order: { [options?.sort || 'createdAt']: options?.typeSort || 'DESC' } as any,
      skip: options?.offset,
      take: options?.limit,
    });

    return {
      pagination: {
        total: count,
        limit: options?.limit,
        page: options?.page,
      },
      data: items,
    };
  }

  async findOneAndUpdate(condition: object, dto: QueryDeepPartialEntity<T>): Promise<T | null> {
    const item = await this.findOneByCondition(condition);
    if (!item) {
      return null;
    }

    await this.repository.update(condition, dto);
    return item;
  }

  async findByIdAndUpdate(id: string, dto: QueryDeepPartialEntity<T>): Promise<T | null> {
    const item = await this.findOneById(id);
    if (!item) {
      return null;
    }
    await this.repository.update({ id } as any, dto); // Ép kiểu thành any hoặc _QueryDeepPartialEntity<T>
    return item;
  }

  async softDelete(id: string): Promise<boolean> {
    const deleteItem = await this.findOneById(id);
    if (!deleteItem) {
      return false;
    }
    await this.repository.softDelete(id);
    return true;
  }

  async permanentlyDelete(id: string): Promise<boolean> {
    const deleteItem = await this.findOneById(id);
    if (!deleteItem) {
      return false;
    }
    await this.repository.delete(id);
    return true;
  }

  async permanentlyDeleteByCondition(condition: object): Promise<boolean> {
    const deleteItem = await this.count(condition as any);
    if (!deleteItem) {
      return false;
    }
    await this.repository.delete(condition);
    return true;
  }

  async count(condition?: object | any[]): Promise<number> {
    return await this.repository.count({ where: condition });
  }
}
