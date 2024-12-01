import { TripCancellation } from '@entities/trip-cancellation.entity';
import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateDateToTripCancellations1719907962920
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    const repository = queryRunner.connection.getRepository(TripCancellation);
    const items = await repository.find();

    for (const item of items) {
      await repository.update(item.id, { date: item.createdAt });
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
