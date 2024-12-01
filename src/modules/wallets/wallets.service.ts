import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { DEFAULT_MESSAGES, ICustomer } from '@common/constants';
import {
  CUSTOMERS,
  NOTIFICATIONS_SCREEN,
} from '@common/constants/notifications.constant';
import { TransactionType } from '@common/enums';
import { orderId as generateOrderId } from '@common/helpers';
import { createPaymentUrl } from '@common/helpers/payment.helper';
import { FirebaseService } from '@common/services/firebase.service';
import {
  Customer,
  Notification,
  Transaction,
  Wallet,
  WalletLog,
} from '@entities/index';
import { TransactionListDto } from './dto/transaction-list.dto';
import { DepositDto, ListWalletDto, WithdrawDto } from './dto/wallet.dto';

@Injectable()
export class WalletsService {
  constructor(
    @InjectRepository(Wallet) private readonly walletRep: Repository<Wallet>,
    @InjectRepository(Customer)
    private readonly customerRep: Repository<Customer>,
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    private readonly dataSource: DataSource,
    private readonly firebaseService: FirebaseService,
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
  ) {}

  /**
   * Function to list wallets
   * @param userId String
   * @param take Number
   * @param skip Number
   * @returns List of Wallets
   */
  async list(userId: string, { take, skip }: ListWalletDto) {
    try {
      const wallets = await this.walletRep.find({
        select: {
          id: true,
          balance: true,
          transactions: {
            amount: true,
            description: true,
            transactionDate: true,
            transactionType: true,
          },
        },
        where: {
          customerId: userId,
        },
        relations: ['transactions'],
        take,
        skip,
      });

      return wallets;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  /**
   * Function to get balance
   * @param userId string
   * @returns balance
   */
  async getBalance(userId: string) {
    try {
      const wallet = await this.walletRep.findOne({
        where: { customerId: userId },
      });
      if (!wallet) {
        throw new NotFoundException('Wallet not found');
      }

      return wallet.balance;
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  /**
   * Function to get url for deposit
   * @param userId string
   * @param dto DepositDto
   * @param ip string
   * @returns paymentUrl
   */
  async deposit({ sub }: ICustomer, dto: DepositDto, ip: string) {
    try {
      const customer = await this.customerRep.findOne({
        where: { id: sub },
        relations: ['wallet'],
      });
      if (!customer) {
        throw new NotFoundException('Shoemaker not found');
      }
      let orderId = generateOrderId();

      let foundTransaction = await this.transactionRepository.findOneBy({
        orderId,
      });

      while (foundTransaction) {
        orderId = generateOrderId();
        foundTransaction = await this.transactionRepository.findOneBy({
          orderId,
        });
      }

      const transaction = await this.transactionRepository.save({
        amount: dto.amount,
        transactionType: TransactionType.DEPOSIT,
        walletId: customer.wallet.id,
        transactionDate: new Date(),
        description: 'Nap tien vao vi taker',
        orderId,
        ipRequest: ip,
      });

      return createPaymentUrl({
        amount: dto.amount,
        ip,
        orderId,
        orderInfo: transaction.description,
      });
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  /**
   * Function to get list of transactions
   * @param userId string
   * @param param1 transactionListDto
   * @returns Return list of transactions
   */
  async getTransactions(userId: string, { take, skip }: TransactionListDto) {
    try {
      const customer = await this.customerRep.findOne({
        where: { id: userId },
        relations: ['wallet'],
      });
      if (!customer) {
        throw new NotFoundException('Shoemaker not found');
      }

      const transactions = await this.transactionRepository.find({
        select: [
          'amount',
          'transactionType',
          'transactionDate',
          'description',
          'status',
          'transactionSource',
          'createdAt',
        ],
        where: { walletId: customer.wallet.id },
        take,
        skip,
        order: { createdAt: 'DESC' },
      });

      return transactions;
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  /**
   * Function to request withdrawal money
   * @param userId string
   * @returns Message
   */
  async requestWithdrawal({ sub }: ICustomer, dto: WithdrawDto) {
    try {
      const customer = await this.customerRep.findOne({
        where: { id: sub },
        relations: ['wallet'],
      });
      if (!customer) {
        throw new NotFoundException('Customer not found');
      }
      if (customer.wallet.balance < dto.amount) {
        throw new BadRequestException('Not enough balance');
      }

      let orderId = generateOrderId();

      let foundTransaction = await this.transactionRepository.findOneBy({
        orderId,
      });

      while (foundTransaction) {
        orderId = generateOrderId();
        foundTransaction = await this.transactionRepository.findOneBy({
          orderId,
        });
      }

      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();
      try {
        // execute some operations on this transaction:
        const newBalance = customer.wallet.balance - dto.amount;
        await queryRunner.manager.update(
          Wallet,
          { id: customer.wallet.id },
          { balance: newBalance },
        );
        await queryRunner.manager.save(Transaction, {
          amount: dto.amount,
          transactionType: TransactionType.WITHDRAW,
          walletId: customer.wallet.id,
          transactionDate: new Date(),
          description: 'Yêu cầu rút tiền',
          orderId,
          isManual: true,
        });
        await queryRunner.manager.save(WalletLog, {
          amount: dto.amount,
          walletId: customer.wallet.id,
          previousBalance: customer.wallet.balance,
          currentBalance: newBalance,
          description: `Yêu cầu rút tiền transactionId=${orderId}`,
        });
        // Create a notification
        await queryRunner.manager.save(Notification, [
          {
            customerId: customer.id,
            title: 'TAKER',
            content: CUSTOMERS.generateWalletMessage(dto.amount, '+').mes04,
            data: JSON.stringify({
              screen: NOTIFICATIONS_SCREEN.WALLET,
            }),
          },
          {
            customerId: customer.id,
            title: 'TAKER',
            content: CUSTOMERS.generateWalletMessage(dto.amount, '-').mes05,
            data: JSON.stringify({
              screen: NOTIFICATIONS_SCREEN.WALLET,
            }),
          },
        ]);
        if (customer.fcmToken) {
          this.firebaseService
            .sends([
              {
                token: customer.fcmToken,
                title: 'TAKER',
                body: CUSTOMERS.generateWalletMessage(dto.amount, '+').mes04,
                data: { screen: NOTIFICATIONS_SCREEN.WALLET },
              },
              {
                token: customer.fcmToken,
                title: 'TAKER',
                body: CUSTOMERS.generateWalletMessage(dto.amount, '-').mes05,
                data: { screen: NOTIFICATIONS_SCREEN.WALLET },
              },
            ])
            .catch((e) => {
              console.log('Error while sending notification', e);
            });
        }
        // commit transaction now:
        await queryRunner.commitTransaction();
      } catch (err) {
        // since we have errors let's rollback changes we made
        await queryRunner.rollbackTransaction();
      } finally {
        // you need to release query runner which is manually created:
        await queryRunner.release();
      }

      return DEFAULT_MESSAGES.SUCCESS;
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }
}
