import { Module } from '@nestjs/common';
import { OptionsService } from './options.service';
import { OptionsController } from './options.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Option } from '@entities/index';
import { OptionRepository } from 'src/database/repository/option.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Option])],
  controllers: [OptionsController],
  providers: [
    OptionsService,
    {
      provide: 'OptionRepositoryInterface',
      useClass: OptionRepository,
    },
  ],
})
export class OptionsModule {}
