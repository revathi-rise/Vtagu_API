import { Controller, Get, Param } from '@nestjs/common';
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
}
