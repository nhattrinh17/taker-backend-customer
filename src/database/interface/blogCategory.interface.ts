import { BlogCategory } from '@entities/index';
import { BaseRepositoryInterface } from 'src/base';

export interface BlogCategoryRepositoryInterface extends BaseRepositoryInterface<BlogCategory> {
  getAllAndJoinToBlog(): Promise<any>;
}
