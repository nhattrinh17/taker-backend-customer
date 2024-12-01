import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Customer } from '@entities/index';
import { DEFAULT_MESSAGES, S3Service, generateHashedPassword } from '@common/index';

import { UpdateProfileDto, FcmTokenDto, ReferralDto } from './dto/profile.dto';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(Customer)
    private readonly userRepository: Repository<Customer>,
    private readonly s3: S3Service,
  ) {}

  /**
   * Function to load user
   * @param userId
   * @returns user
   */
  private async loadUser(userId: string) {
    try {
      const user = await this.userRepository.findOneBy({ id: userId });
      if (!user) throw new NotFoundException('User not found');
      return user;
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  /**
   * Function to set fcm token
   * @param userId
   * @param fcmToken
   * @returns success
   */
  async setFcmToken(userId: string, { fcmToken }: FcmTokenDto) {
    try {
      const user = await this.loadUser(userId);

      await this.userRepository.update(user.id, { fcmToken });

      return DEFAULT_MESSAGES.SUCCESS;
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  /**
   * Function to update user
   * @param userId
   * @param dto
   * @returns success
   */
  async update(userId: string, dto: UpdateProfileDto) {
    try {
      const user = await this.loadUser(userId);
      const newEntity = { ...dto };
      // Check email is existed and not belong to user
      if (dto.email && dto.email !== user.email) {
        const foundUser = await this.userRepository.findOneBy({
          email: dto.email,
        });
        if (foundUser) throw new BadRequestException('Email is existed');
        newEntity.email = dto.email;
      }
      // Check password is existed and generate hashed password
      if (dto.password) {
        newEntity.password = generateHashedPassword(dto.password);
      }

      await this.userRepository.update(user.id, newEntity);

      return DEFAULT_MESSAGES.SUCCESS;
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  /**
   * Function to get signed file url
   * @param fileName
   * @returns signed file url
   */
  async getSignedFileUrl(fileName: string) {
    try {
      if (!fileName) throw new BadRequestException('File name is required');
      const res = this.s3.getSignedFileUrl(fileName);
      return res;
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  /**
   * Function to get referral
   * @param userId string
   * @returns List of referral
   */
  async getReferral(userId: string, { take, skip }: ReferralDto) {
    try {
      const user = await this.loadUser(userId);

      const referral = await this.userRepository.find({
        select: ['phone', 'createdAt'],
        where: { referralCode: user.phone },
        take,
        skip,
      });

      return referral;
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  /**
   * Function to get profile
   * @param userId string
   * @returns profile
   */
  async getProfile(userId: string) {
    try {
      const user = await this.loadUser(userId);

      return {
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
        bankName: user.bankName,
        accountNumber: user.bankAccountNumber,
        accountName: user.bankAccountName,
        newUser: user.newUser,
        isVerified: user.isVerified,
        address: user.address,
      };
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }
}
