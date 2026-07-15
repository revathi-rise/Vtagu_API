import { Controller, Get, Post, Put, Delete, Body, Param, Query, ParseIntPipe } from '@nestjs/common';
import { InteractiveMoviesService } from './interactive-movies.service';
import { CreateInteractiveMovieDto, UpdateInteractiveMovieDto } from './dto/interactive-movie.dto';

@Controller('interactive-movies')
export class InteractiveMoviesController {
  constructor(private readonly moviesService: InteractiveMoviesService) {}

  @Get()
  async findAll() {
    try {
      const movies = await this.moviesService.findAll();
      return {
        status: 'success',
        total_count: movies.length,
        data: movies,
      };
    } catch (error) {
      return {
        status: 'error',
        message: error.message,
      };
    }
  }

  @Get(':id/check-access')
  async checkAccess(
    @Param('id', ParseIntPipe) id: number,
    @Query('userId') userId?: string,
  ) {
    try {
      const parsedUserId = userId ? Number(userId) : undefined;
      const access = await this.moviesService.checkMovieAccess(id, parsedUserId);
      return {
        status: 'success',
        data: access,
      };
    } catch (error) {
      return {
        status: 'error',
        message: error.message,
      };
    }
  }

  @Post(':id/purchase')
  async purchase(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { userId: number; txnId: string; paidAmount: number; currency: string },
  ) {
    try {
      const purchase = await this.moviesService.purchaseMovie(
        id,
        body.userId,
        body.txnId,
        body.paidAmount,
        body.currency,
      );
      return {
        status: 'success',
        data: purchase,
      };
    } catch (error) {
      return {
        status: 'error',
        message: error.message,
      };
    }
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {

    try {
      const movie = await this.moviesService.findOne(id);
      return {
        status: 'success',
        data: movie,
      };
    } catch (error) {
      return {
        status: 'error',
        message: error.message,
      };
    }
  }

  @Post()
  async create(@Body() createDto: CreateInteractiveMovieDto) {
    try {
      const movie = await this.moviesService.create(createDto);
      return {
        status: 'success',
        data: movie,
      };
    } catch (error) {
      return {
        status: 'error',
        message: error.message,
      };
    }
  }

  @Put(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() updateDto: UpdateInteractiveMovieDto) {
    try {
      const movie = await this.moviesService.update(id, updateDto);
      return {
        status: 'success',
        data: movie,
      };
    } catch (error) {
      return {
        status: 'error',
        message: error.message,
      };
    }
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    try {
      await this.moviesService.remove(id);
      return {
        status: 'success',
        message: 'Interactive movie deleted successfully',
      };
    } catch (error) {
      return {
        status: 'error',
        message: error.message,
      };
    }
  }
}
