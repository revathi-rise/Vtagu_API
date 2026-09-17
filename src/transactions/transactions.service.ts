import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from './entities/transaction.entity';
import { CreateTransactionDto, UpdateTransactionDto } from './dto/transaction.dto';
import * as crypto from 'crypto';
const Razorpay = require('razorpay');

import { Subscription } from '../subscriptions/entities/subscription.entity';
import { Plan } from '../plans/entities/plan.entity';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';

@Injectable()
export class TransactionsService {
  private razorpay: any;

  constructor(
    @InjectRepository(Transaction)
    private repository: Repository<Transaction>,
    @InjectRepository(Subscription)
    private subscriptionRepository: Repository<Subscription>,
    @InjectRepository(Plan)
    private planRepository: Repository<Plan>,
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

  private calculateDurationSec(validityStr: string): number {
    if (!validityStr) return 30 * 86400;
    const lower = validityStr.toLowerCase();
    if (lower.includes('year')) {
      const m = lower.match(/(\d+)/);
      return (m ? parseInt(m[1]) : 1) * 365 * 86400;
    } else if (lower.includes('month')) {
      const m = lower.match(/(\d+)/);
      return (m ? parseInt(m[1]) : 1) * 30 * 86400;
    } else if (lower.includes('week')) {
      const m = lower.match(/(\d+)/);
      return (m ? parseInt(m[1]) : 1) * 7 * 86400;
    } else if (lower.includes('day')) {
      const m = lower.match(/(\d+)/);
      return (m ? parseInt(m[1]) : 1) * 86400;
    }
    return 30 * 86400;
  }

  private async syncTransactionCompletion(transaction: Transaction): Promise<void> {
    if (!transaction || (transaction.status !== 'C' && String(transaction.status).toUpperCase() !== 'COMPLETED')) return;

    try {
      let subscription = await this.subscriptionRepository.findOne({
        where: { txnId: transaction.txn_id },
      });

      if (!subscription && transaction.user_id) {
        subscription = await this.subscriptionRepository.findOne({
          where: { userId: transaction.user_id, payment_status: 1 },
          order: { subscriptionId: 'DESC' },
        });
      }

      if (subscription && Number(subscription.payment_status) !== 2) {
        const plan = await this.planRepository.findOne({ where: { planId: subscription.planId } });
        const now = Math.floor(Date.now() / 1000);
        const durationSec = this.calculateDurationSec(plan?.validity || '1 Month');

        await this.subscriptionsService.update(subscription.subscriptionId, {
          payment_status: 2, // Success
          paid_amount: transaction.amount,
          price_amount: transaction.amount,
          txnId: transaction.txn_id,
          payment_method: 'RAZORPAY',
          timestamp_from: now,
          timestamp_to: now + durationSec,
        });
        console.log('[DEBUG] Subscription marked as SUCCESS (2) for subId:', subscription.subscriptionId, 'Plan:', subscription.planId);
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

  async createOrder(userId: number, amount: number, planId?: number) {
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

      if (planId) {
        try {
          const plan = await this.planRepository.findOne({ where: { planId } });
          const now = Math.floor(Date.now() / 1000);
          const durationSec = this.calculateDurationSec(plan?.validity || '1 Month');

          await this.subscriptionsService.create({
            planId: planId,
            userId: userId,
            payment_method: 'RAZORPAY',
            payment_details: order.id,
            txnId: order.id,
            price_amount: amount,
            paid_amount: amount,
            payment_status: 1, // Pending
            timestamp_from: now,
            timestamp_to: now + durationSec,
          });
          console.log('[DEBUG] Created pending subscription for order:', order.id, 'Plan:', planId);
        } catch (subErr: any) {
          console.error('[CREATE PENDING SUB ERROR]', subErr.message);
        }
      }

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

  async checkPendingUserTransactions(userId: number, txnRef?: string) {
    const cleanRef = txnRef ? txnRef.trim() : '';

    const pendingTxns = await this.repository.find({
      where: { user_id: userId, status: 'P' },
      order: { created_at: 'DESC' },
      take: 10,
    });

    let verifiedCount = 0;

    // 1. Check pending transactions for this user
    for (const txn of pendingTxns) {
      if (!txn.txn_id) continue;
      try {
        const orderPayments = await this.razorpay.orders.fetchPayments(txn.txn_id);
        const payments = Array.isArray(orderPayments) ? orderPayments : (orderPayments?.items || []);

        for (const p of payments) {
          const isCaptured = p.status === 'captured';
          const isAuthorized = p.status === 'authorized';
          const rrnMatch = Boolean(cleanRef) && (
            p.acquirer_data?.rrn === cleanRef || 
            p.acquirer_data?.upi_transaction_id === cleanRef || 
            p.id === cleanRef
          );

          if (isCaptured || isAuthorized || rrnMatch) {
            if (isAuthorized) {
              try {
                await this.razorpay.payments.capture(p.id, p.amount, p.currency || 'INR');
              } catch (capErr: any) {
                console.log('[DEBUG] Payment capture error or already captured:', capErr.message);
              }
            }
            txn.status = 'C';
            if (!txn.created_at || isNaN(new Date(txn.created_at).getTime())) {
              txn.created_at = new Date();
            }
            const savedTxn = await this.repository.save(txn);
            await this.syncTransactionCompletion(savedTxn);
            verifiedCount++;
            break;
          }
        }
      } catch (err: any) {
        console.error(`[CHECK PENDING ERROR] Failed to check order ${txn.txn_id}:`, err.message);
      }
    }

    // 2. If cleanRef was passed (e.g. UPI RRN or Payment ID) and no pending order matched yet, search Razorpay directly
    if (verifiedCount === 0 && cleanRef) {
      try {
        let matchedPayment: any = null;

        if (cleanRef.startsWith('pay_')) {
          matchedPayment = await this.razorpay.payments.fetch(cleanRef);
        } else {
          const recentPayments = await this.razorpay.payments.all({ count: 20 });
          const items = Array.isArray(recentPayments) ? recentPayments : (recentPayments?.items || []);
          matchedPayment = items.find((p: any) => 
            p.acquirer_data?.rrn === cleanRef || 
            p.acquirer_data?.upi_transaction_id === cleanRef ||
            p.id === cleanRef
          );
        }

        if (matchedPayment && (matchedPayment.status === 'captured' || matchedPayment.status === 'authorized')) {
          if (matchedPayment.status === 'authorized') {
            try {
              await this.razorpay.payments.capture(matchedPayment.id, matchedPayment.amount, matchedPayment.currency || 'INR');
            } catch (e: any) {}
          }

          let txn = await this.repository.findOne({ where: { txn_id: matchedPayment.order_id } });
          if (!txn) {
            txn = this.repository.create({
              user_id: userId,
              txn_id: matchedPayment.order_id || matchedPayment.id,
              amount: matchedPayment.amount ? matchedPayment.amount / 100 : 0,
              status: 'C',
              created_at: new Date(),
            });
          } else {
            txn.status = 'C';
          }

          const savedTxn = await this.repository.save(txn);
          await this.syncTransactionCompletion(savedTxn);
          verifiedCount++;
        }
      } catch (refErr: any) {
        console.error('[REF CHECK ERROR]', refErr.message);
      }
    }

    if (verifiedCount > 0) {
      return { success: true, message: `Successfully verified and activated payment!`, verifiedCount };
    } else {
      return { 
        success: false, 
        message: cleanRef 
          ? `Could not find payment for UPI Ref / Payment ID: ${cleanRef}. Please verify the 12-digit number.`
          : 'Payment not yet confirmed by Razorpay. If debited via UPI, enter your 12-digit UPI Reference / RRN below.', 
        verifiedCount: 0 
      };
    }
  }

  async reconcileAllCapturedSubscriptions() {
    const pendingSubs = await this.subscriptionRepository.find({
      where: { payment_status: 1 },
      order: { subscriptionId: 'DESC' },
      take: 100,
    });

    let countReconciled = 0;
    const reconciledList: any[] = [];

    for (const sub of pendingSubs) {
      let isCaptured = false;
      let paymentObj: any = null;

      try {
        if (sub.payment_details && sub.payment_details.startsWith('pay_')) {
          paymentObj = await this.razorpay.payments.fetch(sub.payment_details);
          if (paymentObj && (paymentObj.status === 'captured' || paymentObj.status === 'authorized')) {
            isCaptured = true;
          }
        }

        if (!isCaptured && sub.txnId && sub.txnId.startsWith('order_')) {
          const orderPayments = await this.razorpay.orders.fetchPayments(sub.txnId);
          const payments = Array.isArray(orderPayments) ? orderPayments : (orderPayments?.items || []);
          paymentObj = payments.find((p: any) => p.status === 'captured' || p.status === 'authorized');
          if (paymentObj) {
            isCaptured = true;
          }
        }

        if (isCaptured && paymentObj) {
          if (paymentObj.status === 'authorized') {
            try {
              await this.razorpay.payments.capture(paymentObj.id, paymentObj.amount, paymentObj.currency || 'INR');
            } catch (capErr: any) {}
          }

          await this.subscriptionsService.update(sub.subscriptionId, {
            payment_status: 2,
            payment_timestamp: Math.floor(Date.now() / 1000),
            payment_details: paymentObj.id || sub.payment_details,
            paid_amount: paymentObj.amount ? paymentObj.amount / 100 : sub.paid_amount,
          });

          if (sub.txnId) {
            const txn = await this.repository.findOne({ where: { txn_id: sub.txnId } });
            if (txn && txn.status !== 'C') {
              txn.status = 'C';
              await this.repository.save(txn);
            }
          }

          countReconciled++;
          reconciledList.push({
            subscriptionId: sub.subscriptionId,
            userId: sub.userId,
            planId: sub.planId,
            paymentId: paymentObj.id,
            amount: paymentObj.amount ? paymentObj.amount / 100 : sub.paid_amount,
          });
        }
      } catch (err: any) {
        console.error(`[RECONCILE ERROR] Sub ID ${sub.subscriptionId}:`, err.message);
      }
    }

    return {
      success: true,
      message: `Reconciled ${countReconciled} subscription(s) successfully!`,
      countReconciled,
      reconciledList,
    };
  }
}
