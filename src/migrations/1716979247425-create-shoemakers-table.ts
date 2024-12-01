import { ShoemakerStatusEnum } from '@common/enums/status.enum';
import { StepEnum } from '@common/enums/step.enum';
import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateShoemakersTable1716979247425 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'shoemakers',
        columns: [
          {
            name: 'id',
            type: 'varchar(36)',
            isPrimary: true,
          },
          {
            name: 'phone',
            type: 'varchar',
            isUnique: true,
          },
          {
            name: 'status',
            type: 'enum',
            enum: [...Object.values(ShoemakerStatusEnum)],
            default: `'${ShoemakerStatusEnum.PENDING}'`,
          },
          {
            name: 'password',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'otp',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'step',
            type: 'enum',
            enum: [...Object.values(StepEnum)],
            default: `'${StepEnum.OTP}'`,
          },
          {
            name: 'fcmToken',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'referralCode',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'registrationDate',
            type: 'datetime',
            isNullable: true,
          },
          {
            name: 'lastLoginDate',
            type: 'datetime',
            isNullable: true,
          },
          {
            name: 'isOnline',
            type: 'boolean',
            default: false,
          },
          {
            name: 'isOn',
            type: 'boolean',
            default: true,
          },
          {
            name: 'isTrip',
            type: 'boolean',
            default: false,
          },
          {
            name: 'isVerified',
            type: 'boolean',
            default: false,
          },
          {
            name: 'latitude',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'longitude',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'latLongToCell',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'fullName',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'identityCard',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'email',
            type: 'varchar',
            isUnique: true,
            isNullable: true,
          },
          {
            name: 'bankName',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'accountNumber',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'accountName',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'avatar',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'dateOfBirth',
            type: 'datetime',
            isNullable: true,
          },
          {
            name: 'placeOfOrigin',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'placeOfResidence',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'maritalStatus',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'workRegistrationArea',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'frontOfCardImage',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'backOfCardImage',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'deletedAt',
            type: 'datetime',
            isNullable: true,
          },
          {
            name: 'createdAt',
            type: 'datetime(6)',
            default: 'CURRENT_TIMESTAMP(6)',
          },
          {
            name: 'updatedAt',
            type: 'datetime(6)',
            default: 'CURRENT_TIMESTAMP(6)',
            onUpdate: 'CURRENT_TIMESTAMP(6)',
          },
        ],
      }),
    );

    await queryRunner.createIndex(
      'shoemakers',
      new TableIndex({
        name: 'IDX_SHOEMAKERS_REFERRAL_CODE',
        columnNames: ['referralCode'],
      }),
    );

    await queryRunner.createIndex(
      'shoemakers',
      new TableIndex({
        name: 'IDX_SHOEMAKERS_LAT_LONG_TO_CELL',
        columnNames: ['latLongToCell'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('shoemakers');
    const index1 = table.indices.find(
      (index) => index.columnNames.indexOf('referralCode') !== -1,
    );
    const index2 = table.indices.find(
      (index) => index.columnNames.indexOf('latLongToCell') !== -1,
    );
    await queryRunner.dropIndex('shoemakers', index1);
    await queryRunner.dropIndex('shoemakers', index2);
    await queryRunner.dropTable('shoemakers');
  }
}
