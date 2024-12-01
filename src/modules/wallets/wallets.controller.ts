import { ClientIp as Ip } from '@common/decorators/client-ip.decorator';
import { CurrentUser, CustomersAuthGuard, ICustomer, ValidationPipe } from '@common/index';
import { Body, Controller, Get, HttpCode, HttpStatus, Post, Query, UseGuards, Version } from '@nestjs/common';

import { TransactionListDto } from './dto/transaction-list.dto';
import { DepositDto, ListWalletDto, WithdrawDto } from './dto/wallet.dto';
import { WalletsService } from './wallets.service';

@UseGuards(CustomersAuthGuard)
@Controller('wallets')
export class WalletsController {
  constructor(private readonly service: WalletsService) {}

  @Post('deposit')
  @HttpCode(HttpStatus.OK)
  @Version('1')
  async deposit(@CurrentUser() user: ICustomer, @Body(ValidationPipe) dto: DepositDto, @Ip() ip: string) {
    return this.service.deposit(user, dto, ip);
  }

  @Version('1')
  @Get()
  index(@CurrentUser() { sub }: ICustomer, @Query(ValidationPipe) query: ListWalletDto) {
    return this.service.list(sub, query);
  }

  @Get('balance')
  @Version('1')
  async balance(@CurrentUser() { sub }: ICustomer) {
    return this.service.getBalance(sub);
  }

  @Get('transactions')
  @Version('1')
  async transactions(@CurrentUser() { sub }: ICustomer, @Query(ValidationPipe) dto: TransactionListDto) {
    return this.service.getTransactions(sub, dto);
  }

  @Post('withdraw')
  @HttpCode(HttpStatus.CREATED)
  @Version('1')
  async withdraw(@CurrentUser() user: ICustomer, @Body(ValidationPipe) dto: WithdrawDto) {
    return this.service.requestWithdrawal(user, dto);
  }
}
