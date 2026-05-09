import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from './entities/transaction.entity';
import * as crypto from 'crypto';
const Razorpay = require('razorpay');

@Injectable()
export class TransactionsService {
  private razorpay: any;

  constructor(
    @InjectRepository(Transaction)
    private repository: Repository<Transaction>,
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
        await this.repository.save(transaction);
        return { success: true, message: 'Payment verified successfully' };
      } else {
        throw new NotFoundException('Transaction record not found');
      }
    } else {
      throw new BadRequestException('Invalid signature');
    }
  }
}
