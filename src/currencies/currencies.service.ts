import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Currency } from './entities/currency.entity';
import { CreateCurrencyDto, UpdateCurrencyDto } from './dto/currency.dto';

@Injectable()
export class CurrenciesService {
  constructor(
    @InjectRepository(Currency)
    private readonly currencyRepo: Repository<Currency>,
  ) {}

  async findAll() {
    return this.currencyRepo.find({ order: { id: 'ASC' } });
  }

  async findOne(id: number) {
    const currency = await this.currencyRepo.findOne({ where: { id } });
    if (!currency) {
      throw new NotFoundException(`Currency with ID ${id} not found`);
    }
    return currency;
  }

  async create(dto: CreateCurrencyDto) {
    const currency = this.currencyRepo.create(dto);
    return this.currencyRepo.save(currency);
  }

  async update(id: number, dto: UpdateCurrencyDto) {
    const currency = await this.findOne(id);
    Object.assign(currency, dto);
    return this.currencyRepo.save(currency);
  }

  async remove(id: number) {
    const currency = await this.findOne(id);
    await this.currencyRepo.remove(currency);
    return { status: true, message: 'Currency deleted successfully' };
  }
}
