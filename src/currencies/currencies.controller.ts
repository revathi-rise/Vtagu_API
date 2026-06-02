import { Controller, Get, Post, Body, Put, Delete, Param } from '@nestjs/common';
import { CurrenciesService } from './currencies.service';
import { CreateCurrencyDto, UpdateCurrencyDto } from './dto/currency.dto';

@Controller('currencies')
export class CurrenciesController {
  constructor(private readonly currenciesService: CurrenciesService) {}

  @Get()
  async findAll() {
    const data = await this.currenciesService.findAll();
    return { status: true, message: 'Currencies fetched successfully', data };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.currenciesService.findOne(+id);
    return { status: true, message: 'Currency fetched successfully', data };
  }

  @Post()
  async create(@Body() createCurrencyDto: CreateCurrencyDto) {
    const data = await this.currenciesService.create(createCurrencyDto);
    return { status: true, message: 'Currency created successfully', data };
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateCurrencyDto: UpdateCurrencyDto
  ) {
    const data = await this.currenciesService.update(+id, updateCurrencyDto);
    return { status: true, message: 'Currency updated successfully', data };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.currenciesService.remove(+id);
  }
}
