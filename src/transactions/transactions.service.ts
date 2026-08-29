import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from './entities/transaction.entity';
import { CreateTransactionDto, UpdateTransactionDto } from './dto/transaction.dto';
import * as crypto from 'crypto';
const Razorpay = require('razorpay');

import { Subscription } from '../subscriptions/entities/subscription.entity';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';

@Injectable()
export class TransactionsService {
  private razorpay: any;

  constructor(
    @InjectRepository(Transaction)
    private repository: Repository<Transaction>,
    @InjectRepository(Subscription)
    private subscriptionRepository: Repository<Subscription>,
    private subscriptionsService: SubscriptionsService,
  ) {
    this.razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID || 'YOUR_RAZORPAY_KEY_ID',
      key_secret: process.env.RAZORPAY_KEY_SECRET || 'YOUR_RAZORPAY_KEY_SECRET',
    });
    console.log('[DEBUG] Razorpay initialized with Key ID:', process.env.RAZORPAY_KEY_ID ? 'LOADED' : 'MISSING');
  }

  async findAll(): Promise<Transaction[]> {
    return this.repository.find({ order: { created_at: 'DESC' } });
  }

  async findByUserId(userId: number): Promise<Transaction[]> {
    return this.repository.find({ where: { user_id: userId }, order: { created_at: 'DESC' } });
  }

  async findOne(id: number): Promise<Transaction> {
    const transaction = await this.repository.findOne({ where: { id } });
    if (!transaction) {
      throw new NotFoundException(`Transaction with ID ${id} not found`);
    }
    return transaction;
  }

  async create(dto: CreateTransactionDto): Promise<Transaction> {
    try {
      const transaction = this.repository.create({
        ...dto,
        created_at: new Date(),
      });
      return await this.repository.save(transaction);
    } catch (error: any) {
      throw new BadRequestException(error.message);
    }
  }

  async update(id: number, dto: UpdateTransactionDto): Promise<Transaction> {
    try {
      const transaction = await this.findOne(id);
      Object.assign(transaction, dto);
      return await this.repository.save(transaction);
    } catch (error: any) {
      throw new BadRequestException(error.message);
    }
  }

  async remove(id: number): Promise<{ status: boolean; message: string }> {
    try {
      const transaction = await this.findOne(id);
      await this.repository.remove(transaction);
      return { status: true, message: 'Transaction deleted successfully' };
    } catch (error: any) {
      throw new BadRequestException(error.message);
    }
  }

  async createOrder(userId: number, amount: number) {
    const options = {
      amount: Math.round(amount * 100), // amount in the smallest currency unit (paisa)
      currency: 'INR',
    };

    try {
      const order = await this.razorpay.orders.create(options);
      console.log('[DEBUG] Razorpay order created:', order);

      const newTransaction = this.repository.create({
        txn_id: order.id,
        user_id: userId,
        amount: amount,
        status: 'P', // Pending
        created_at: new Date(),
      });
      await this.repository.save(newTransaction);

      return order;
    } catch (error: any) {
      console.error('[RAZORPAY ERROR]', error);
      throw new BadRequestException(`Could not create Razorpay order: ${error.description || error.message || 'Unknown error'}`);
    }
  }

  async verifyPayment(razorpayOrderId: string, razorpayPaymentId: string, signature: string) {
    const body = razorpayOrderId + '|' + razorpayPaymentId;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'YOUR_RAZORPAY_KEY_SECRET')
      .update(body.toString())
      .digest('hex');

    if (expectedSignature === signature) {
      const transaction = await this.repository.findOne({ where: { txn_id: razorpayOrderId } });
      if (transaction) {
        transaction.status = 'C'; // Complete
        if (!transaction.created_at || isNaN(new Date(transaction.created_at).getTime()) || new Date(transaction.created_at).getFullYear() < 2000) {
          transaction.created_at = new Date();
        }
        await this.repository.save(transaction);

        // Also update any matching subscription to payment_status = 2 (Success) and send Subscription Success SMS
        try {
          const subscription = await this.subscriptionRepository.findOne({
            where: { txnId: razorpayOrderId },
            relations: ['user', 'plan'],
          });
          if (subscription) {
            subscription.payment_status = 2; // Success
            subscription.payment_timestamp = Math.floor(Date.now() / 1000);
            const savedSub = await this.subscriptionRepository.save(subscription);
            await this.subscriptionsService.sendSubscriptionSuccessNotification(savedSub);
          }
        } catch (subErr) {
          console.error('[VERIFY PAYMENT] Error updating subscription:', subErr.message);
        }

        return { success: true, message: 'Payment verified successfully' };
      } else {
        throw new NotFoundException('Transaction record not found');
      }
    } else {
      throw new BadRequestException('Invalid signature');
    }
  }
}
