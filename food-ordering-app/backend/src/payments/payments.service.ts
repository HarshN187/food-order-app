import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentMethod } from '../database';
import { CreatePaymentDto, UpdatePaymentDto } from './dto';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(PaymentMethod)
    private readonly paymentRepo: Repository<PaymentMethod>,
  ) {}

  // Admin: get ALL active payment methods across all users
  async findAll() {
    return this.paymentRepo
      .createQueryBuilder('pm')
      .leftJoinAndSelect('pm.user', 'user')
      .select([
        'pm.id',
        'pm.userId',
        'pm.type',
        'pm.provider',
        'pm.lastFour',
        'pm.isDefault',
        'pm.isActive',
        'user.id',
        'user.name',
        'user.email',
      ])
      .where('pm.isActive = :isActive', { isActive: true })
      .orderBy('pm.userId', 'ASC')
      .addOrderBy('pm.isDefault', 'DESC')
      .getMany();
  }

  // Regular user: get their own payment methods
  async findAllForUser(userId: string) {
    return this.paymentRepo.find({
      where: { userId, isActive: true },
      order: { isDefault: 'DESC' },
    });
  }

  async create(createPaymentDto: CreatePaymentDto) {
    const { userId } = createPaymentDto;

    if (createPaymentDto.isDefault) {
      await this.paymentRepo.update(
        { userId, isActive: true },
        { isDefault: false },
      );
    }

    const payment = this.paymentRepo.create({
      ...createPaymentDto,
      userId,
    });

    return this.paymentRepo.save(payment);
  }

  async update(id: string, updatePaymentDto: UpdatePaymentDto) {
    const payment = await this.paymentRepo.findOne({ where: { id, isActive: true } });

    if (!payment) {
      throw new NotFoundException('Payment method not found');
    }

    if (updatePaymentDto.isDefault) {
      // clear other defaults for the same user
      await this.paymentRepo.update(
        { userId: payment.userId, isActive: true },
        { isDefault: false },
      );
    }

    Object.assign(payment, updatePaymentDto);
    return this.paymentRepo.save(payment);
  }

  async remove(id: string) {
    const payment = await this.paymentRepo.findOne({ where: { id, isActive: true } });

    if (!payment) {
      throw new NotFoundException('Payment method not found');
    }

    payment.isActive = false;
    return this.paymentRepo.save(payment);
  }
}
