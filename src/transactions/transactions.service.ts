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

  private async syncTransactionCompletion(transaction: Transaction): Promise<void> {
    if (!transaction || (transaction.status !== 'C' && String(transaction.status).toUpperCase() !== 'COMPLETED')) return;

    try {
      let subscription = await this.subscriptionRepository.findOne({
        where: { txnId: transaction.txn_id },
      });

      if (!subscription && transaction.user_id) {
        subscription = await this.subscriptionRepository.findOne({
          where: { userId: transaction.user_id },
          order: { subscriptionId: 'DESC' },
        });
      }

      if (subscription) {
        await this.subscriptionsService.update(subscription.subscriptionId, {
          payment_status: 2, // Success
          paid_amount: transaction.amount,
          price_amount: transaction.amount,
          txnId: transaction.txn_id,
          payment_method: 'RAZORPAY',
        });
      }
    } catch (subErr: any) {
      console.error('[TRANSACTION SYNC ERROR]', subErr.message);
    }
  }

  async update(id: number, dto: UpdateTransactionDto): Promise<Transaction> {
    try {
      const transaction = await this.findOne(id);
      Object.assign(transaction, dto);
      const savedTxn = await this.repository.save(transaction);
      if (savedTxn.status === 'C' || String(savedTxn.status).toUpperCase() === 'COMPLETED') {
        await this.syncTransactionCompletion(savedTxn);
      }
      return savedTxn;
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
        const savedTxn = await this.repository.save(transaction);
        await this.syncTransactionCompletion(savedTxn);

        return { success: true, message: 'Payment verified successfully' };
      } else {
        throw new NotFoundException('Transaction record not found');
      }
    } else {
      throw new BadRequestException('Invalid signature');
    }
  }

  async processWebhook(payload: any, signature: string) {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET;
    const bodyStr = typeof payload === 'string' ? payload : JSON.stringify(payload);
    
    if (signature && webhookSecret) {
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(bodyStr)
        .digest('hex');

      if (expectedSignature !== signature) {
        console.error('[WEBHOOK ERROR] Invalid Razorpay webhook signature');
        throw new BadRequestException('Invalid webhook signature');
      }
    }

    const data = typeof payload === 'string' ? JSON.parse(payload) : payload;
    console.log('[DEBUG] Razorpay Webhook Event Received:', data.event);

    if (data.event === 'payment.captured' || data.event === 'order.paid') {
      const paymentEntity = data.payload?.payment?.entity;
      const orderId = paymentEntity?.order_id || data.payload?.order?.entity?.id;

      if (orderId) {
        const transaction = await this.repository.findOne({ where: { txn_id: orderId } });
        if (transaction && transaction.status !== 'C') {
          transaction.status = 'C'; // Complete
          if (!transaction.created_at || isNaN(new Date(transaction.created_at).getTime())) {
            transaction.created_at = new Date();
          }
          const savedTxn = await this.repository.save(transaction);
          await this.syncTransactionCompletion(savedTxn);
          console.log('[DEBUG] Webhook reconciled transaction successfully:', orderId);
          return { success: true, message: 'Transaction reconciled via webhook', orderId };
        }
      }
    }

    return { success: true, message: 'Webhook processed' };
  }

  async checkPendingUserTransactions(userId: number) {
    const pendingTxns = await this.repository.find({
      where: { user_id: userId, status: 'P' },
      order: { created_at: 'DESC' },
      take: 5,
    });

    if (!pendingTxns || pendingTxns.length === 0) {
      return { success: false, message: 'No pending transactions found for this user', verifiedCount: 0 };
    }

    let verifiedCount = 0;

    for (const txn of pendingTxns) {
      if (!txn.txn_id) continue;
      try {
        const orderPayments = await this.razorpay.orders.fetchPayments(txn.txn_id);
        const payments = orderPayments?.items || orderPayments;

        if (Array.isArray(payments)) {
          const capturedPayment = payments.find((p: any) => p.status === 'captured');
          if (capturedPayment) {
            txn.status = 'C';
            if (!txn.created_at || isNaN(new Date(txn.created_at).getTime())) {
              txn.created_at = new Date();
            }
            const savedTxn = await this.repository.save(txn);
            await this.syncTransactionCompletion(savedTxn);
            verifiedCount++;
          }
        }
      } catch (err: any) {
        console.error(`[CHECK PENDING ERROR] Failed to check order ${txn.txn_id}:`, err.message);
      }
    }

    if (verifiedCount > 0) {
      return { success: true, message: `Successfully verified and activated ${verifiedCount} payment(s)!`, verifiedCount };
    } else {
      return { success: false, message: 'Payment not yet confirmed by Razorpay. Please wait a few minutes if money was debited.', verifiedCount: 0 };
    }
  }
}
