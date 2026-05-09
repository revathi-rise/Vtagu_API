import { Controller, Get, Param, Post, Body } from '@nestjs/common';
import { TransactionsService } from './transactions.service';

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly service: TransactionsService) {}

  @Get()
  async findAll() {
    try {
      const data = await this.service.findAll();
      return { status: true, message: 'Transactions fetched successfully', data };
    } catch (error) {
      return { status: false, message: error.message, data: null };
    }
  }

  @Get('user/:userId')
  async findByUserId(@Param('userId') userId: string) {
    try {
      const data = await this.service.findByUserId(+userId);
      return { status: true, message: 'User transactions fetched successfully', data };
    } catch (error) {
      return { status: false, message: error.message, data: null };
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      const data = await this.service.findOne(+id);
      return { status: true, message: 'Transaction fetched successfully', data };
    } catch (error) {
      return { status: false, message: error.message, data: null };
    }
  }

  @Post('create-order')
  async createOrder(@Body() body: { userId: number; amount: number }) {
    try {
      const data = await this.service.createOrder(Number(body.userId), Number(body.amount));
      return { status: true, message: 'Razorpay order created successfully', data };
    } catch (error) {
      return { status: false, message: error.message, data: null };
    }
  }

  @Post('verify-payment')
  async verifyPayment(
    @Body()
    body: {
      razorpayOrderId: string;
      razorpayPaymentId: string;
      signature: string;
    },
  ) {
    try {
      const data = await this.service.verifyPayment(
        body.razorpayOrderId,
        body.razorpayPaymentId,
        body.signature,
      );
      return { status: true, message: data.message, data };
    } catch (error) {
      return { status: false, message: error.message, data: null };
    }
  }
}
