import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentMethod } from '../database/entities/payment-method.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(PaymentMethod)
    private readonly paymentRepo: Repository<PaymentMethod>,
  ) {}

  async findAllForUser(userId: string) {
    return this.paymentRepo.find({
      where: { userId, isActive: true },
      order: { isDefault: 'DESC' },
    });
  }

  async create(createPaymentDto: CreatePaymentDto, userId: string) {
    if (createPaymentDto.isDefault) {
      await this.paymentRepo.update(
        { userId, isActive: true },
        { isDefault: false }
      );
    }

    const payment = this.paymentRepo.create({
      ...createPaymentDto,
      userId,
    });

    return this.paymentRepo.save(payment);
  }

  async update(id: string, updatePaymentDto: UpdatePaymentDto, userId: string) {
    const payment = await this.paymentRepo.findOne({ where: { id, userId, isActive: true } });
    
    if (!payment) {
      throw new NotFoundException('Payment method not found');
    }

    if (updatePaymentDto.isDefault) {
      // clear other defaults
      await this.paymentRepo.update(
        { userId, isActive: true },
        { isDefault: false }
      );
    }

    Object.assign(payment, updatePaymentDto);
    return this.paymentRepo.save(payment);
  }

  async remove(id: string, userId: string) {
    const payment = await this.paymentRepo.findOne({ where: { id, userId, isActive: true } });
    
    if (!payment) {
      throw new NotFoundException('Payment method not found');
    }

    payment.isActive = false;
    return this.paymentRepo.save(payment);
  }
}
