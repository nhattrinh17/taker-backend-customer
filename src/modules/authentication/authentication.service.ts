import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
/**
 * Import entities
 */
import { Customer, Option } from '@entities/index';
/**
 * Import dto
 */
import { CreateCustomerDto, DeviceInfoDto, ForgotCustomerDto, LoginCustomerDto, NewPasswordDto, VerifyOtpDto, VerifyPhoneNumberDto } from './dto';

import { AppType, DEFAULT_MESSAGES, OPTIONS, SmsService, StringeeService, generateHashedPassword, generateOTP, makePhoneNumber, otpToText, validPassword } from '@common/index';

import { DeviceRepositoryInterface } from 'src/database/interface/device.interface';
import { BonusPointService } from '@modules/bonus_point/bonus_point.service';

@Injectable()
export class AuthenticationService {
  constructor(
    @InjectRepository(Customer) private userRepository: Repository<Customer>,
    private readonly stringeeService: StringeeService,
    private readonly jwtService: JwtService,
    private readonly smsService: SmsService,
    @InjectRepository(Option) private optionRepository: Repository<Option>,
    private readonly bonusPointService: BonusPointService,
    @Inject('DeviceRepositoryInterface')
    private readonly deviceRepository: DeviceRepositoryInterface,
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

  async checkAndCreateDeviceInfo(userId: string, dto: DeviceInfoDto) {
    try {
      const user = await this.loadUser(userId);
      if (!user.deviceId && dto.deviceId && dto.deviceId2) {
        let deviceInfo = await this.deviceRepository.findOneByCondition([{ deviceId: dto.deviceId }, { deviceId2: dto.deviceId2 }]);
        if (!deviceInfo) {
          deviceInfo = await this.deviceRepository.create({ ...dto });
        }
        await this.userRepository.update(user.id, { deviceId: deviceInfo.id });
      }
    } catch (e) {
      return;
    }
  }

  async checkDeviceCreateMultiAcc(dto: DeviceInfoDto): Promise<string> {
    let deviceInfo = await this.deviceRepository.findOneByCondition([{ deviceId: dto.deviceId }, { deviceId2: dto.deviceId2 }]);
    if (deviceInfo) {
      const totalUserDevice = await this.userRepository.count({
        where: {
          deviceId: deviceInfo.id,
        },
      });
      if (totalUserDevice >= 2) {
        throw new Error('device_has_already_created_multi_account');
      }
    } else {
      deviceInfo = await this.deviceRepository.create(dto);
    }
    return deviceInfo.id;
  }

  /**
   * Function to load option
   * @returns option
   */
  private async loadOption() {
    try {
      const option = await this.optionRepository.findOneBy({
        key: OPTIONS.STRINGEE_NUMBER,
      });
      return option;
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  /**
   * Function to verify phone number
   * @param phone
   * @returns boolean
   */
  async verifyPhoneNumber({ phone }: VerifyPhoneNumberDto) {
    try {
      const user = await this.userRepository.findOneBy({ phone });
      return !!user;
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  /**
   * Function to verify phone number v2
   * @param phone
   * @returns boolean
   */
  async verifyPhoneNumberV2({ phone }: VerifyPhoneNumberDto) {
    try {
      const user = await this.userRepository.findOneBy({ phone });
      return {
        isExisted: !!user,
        fullName: user?.fullName,
        isVerified: user?.isVerified,
      };
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }
  /**
   * Function to create account
   * @param phone
   * @returns success
   */
  async createAccount(dto: CreateCustomerDto) {
    try {
      const foundUser = await this.userRepository.findOneBy({ phone: dto.phone });
      if (foundUser) throw new BadRequestException('Phone number is existed');
      // Get DeviceId
      const deviceId = await this.checkDeviceCreateMultiAcc(dto);
      // Create account with phone and otp
      const user = await this.userRepository.save({
        phone: dto.phone,
        registrationDate: new Date(),
        wallet: { balance: 0 },
        ...dto,
        password: generateHashedPassword(dto.password),
        deviceId,
      });
      if (dto.referralCode) {
        const referralUser = await this.userRepository.findOneBy({ phone: dto.referralCode });
        if (referralUser) {
          await this.bonusPointService.checkAndAddPointToReferralUser(referralUser.id);
        }
      }

      return { userId: user.id };
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  /**
   * Function to verify otp
   * @param userId, otp
   * @returns boolean
   */
  async verifyOtp({ userId, otp, isForgetPass }: VerifyOtpDto) {
    try {
      const user = await this.userRepository.findOneBy({ id: userId, otp });
      if (!user) throw new BadRequestException('Invalid OTP');
      const updateData = isForgetPass ? { isVerified: true } : { isVerified: true, otp: null };

      await this.userRepository.update(user.id, updateData);

      return !!user;
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  /**
   * Function to update user
   * @param userId
   * @param dto
   * @returns string
   */
  async newPassword(userId: string, dto: NewPasswordDto) {
    try {
      const user = await this.loadUser(userId);
      const { password, referralCode, otp } = dto;

      if (user.otp !== otp) throw new BadRequestException('Invalid OTP');

      const updateData = {};

      if (password) {
        updateData['password'] = generateHashedPassword(password);
        updateData['isVerified'] = true;
        updateData['otp'] = null;
      }
      if (referralCode) updateData['referralCode'] = referralCode;

      // Check email is existed and not belong to user
      if (dto.email && dto.email !== user.email) {
        const foundUser = await this.userRepository.findOneBy({
          email: dto.email,
        });
        if (foundUser) throw new BadRequestException('Email is existed');
        updateData['email'] = dto.email;
      }
      // if (dto.fullName) updateData['fullName'] = dto.fullName;

      await this.userRepository.update(user.id, updateData);

      return DEFAULT_MESSAGES.SUCCESS;
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  /**
   * Function to login
   * @param phone
   * @param password
   * @returns user and token
   */
  async login({ phone, password, ...dtoDevice }: LoginCustomerDto) {
    try {
      const user = await this.userRepository.findOneBy({ phone });
      if (!user) throw new BadRequestException('Invalid phone or password');
      // if (!user.isVerified) throw new BadRequestException('User is not verified');

      if (!validPassword(password, user.password)) {
        throw new BadRequestException('Invalid phone or password');
      }
      // Update status isLogin when user login
      await Promise.all([
        //
        this.userRepository.update(user.id, { isLogin: true, lastLoginDate: new Date() }),
        this.checkAndCreateDeviceInfo(user.id, dtoDevice),
      ]);

      const token = this.jwtService.sign({
        sub: user.id,
        type: AppType.customers,
      });
      return {
        token,
        user: { fullName: user.fullName, id: user.id, avatar: user.avatar, isVerified: user.isVerified },
      };
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  /**
   * Function to forgot password
   */
  async forgotPassword({ phone }: ForgotCustomerDto) {
    try {
      // Generate OTP
      const otp = generateOTP();
      const otpText = otpToText(otp);
      const phoneNumber = makePhoneNumber(phone);
      // Check if phone number is existed
      const foundUser = await this.userRepository.findOneBy({ phone });
      if (!foundUser) throw new BadRequestException('Account not found');
      // Update account with phone and otp
      const user = await this.userRepository.update(foundUser.id, {
        otp: otp.toString(),
      });
      // Get option
      const option = await this.loadOption();
      // Make call to phone number with otp
      const res = await this.stringeeService.makeCall({
        toNumber: phoneNumber,
        otp: otpText,
        fromNumber: option?.value || null,
      });
      console.log('[STRINGEE][RES]', res?.data);
      return { userId: foundUser.id };
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  /**
   * Function to logout
   * @param userId
   * @returns success
   */
  async logout(userId: string) {
    try {
      const user = await this.loadUser(userId);
      await this.userRepository.update(user.id, { fcmToken: null, isLogin: false });
      return DEFAULT_MESSAGES.SUCCESS;
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  /**
   * Function to destroy
   * @param userId
   * @returns success
   */
  async destroy(userId: string) {
    try {
      const user = await this.loadUser(userId);
      await this.userRepository.softDelete(user.id);
      return DEFAULT_MESSAGES.SUCCESS;
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  /**
   * Function to destroy
   * @param phone
   * @returns success
   */
  async makeCallUser(phone: string) {
    try {
      const user = await this.userRepository.findOneBy({ phone });
      if (!user) throw new BadRequestException('Account not found');
      //  Generate OTP and save
      const otp = generateOTP();
      const otpText = otpToText(otp);
      const phoneNumber = makePhoneNumber(phone);
      await this.userRepository.update(
        {
          id: user.id,
        },
        {
          otp: otp.toString(),
        },
      );
      // Get option
      const option = await this.loadOption();
      // Make call to phone number with otp
      const res = await this.stringeeService.makeCall({
        toNumber: phoneNumber,
        otp: otpText,
        fromNumber: option?.value || null,
      });
      console.log('[STRINGEE][RES]', res?.data);
      return { userId: user.id };
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  /**
   * Function to send sms
   * @param toNumber
   */
  async sendSms(phone: string) {
    try {
      const foundUser = await this.userRepository.findOneBy({ phone });
      if (!foundUser) throw new BadRequestException('Account not found');
      // Check have OTP
      if (!foundUser.otp) {
        const otp = generateOTP();
        foundUser.otp = otp.toString();
      }
      const today = new Date();
      const todayDateString = today.toISOString().split('T')[0];

      if (foundUser.lastOtpRequestDate?.toString() === todayDateString) {
        if (foundUser.otpRequestCount >= 5) {
          throw new BadRequestException('OTP request limit reached for today');
        }
        foundUser.otpRequestCount += 1;
      } else {
        foundUser.otpRequestCount = 1;
        foundUser.lastOtpRequestDate = today;
      }

      await this.userRepository.save(foundUser);
      const phoneNumber = makePhoneNumber(phone);

      const res = await this.smsService.send({
        toNumber: phoneNumber,
        otp: foundUser.otp,
      });

      return res;
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }
}
