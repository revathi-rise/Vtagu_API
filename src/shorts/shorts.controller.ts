import { Controller, Get, Post, Body, Put, Param, Delete, Query, ParseIntPipe } from '@nestjs/common';
import { ShortsService } from './shorts.service';
import { CreateShortDto, UpdateShortDto, ShortResponseDto } from './shorts.dto';

@Controller('shorts')
export class ShortsController {
  constructor(private readonly shortsService: ShortsService) {}

  /**
   * GET /shorts/active
   * Public endpoint — returns all active shorts (for home page & player page)
   * Optional ?limit=6 for home page teaser
   */
  @Get('active')
  async findActive(
    @Query('limit') limit?: string,
  ): Promise<{ status: boolean; message: string; data: ShortResponseDto[] }> {
    try {
      const l = limit ? parseInt(limit, 10) : undefined;
      const data = await this.shortsService.findActive(l);
      return { status: true, message: 'Active shorts fetched successfully', data };
    } catch (error) {
      return { status: false, message: error.message || 'An error occurred', data: [] };
    }
  }

  /**
   * GET /shorts
   * Admin endpoint — returns all shorts (active + inactive)
   */
  @Get()
  async findAll(): Promise<{ status: boolean; message: string; data: ShortResponseDto[] }> {
    try {
      const data = await this.shortsService.findAll();
      return { status: true, message: 'Shorts fetched successfully', data };
    } catch (error) {
      return { status: false, message: error.message || 'An error occurred', data: [] };
    }
  }

  /**
   * GET /shorts/:id
   * Single short by ID
   */
  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ status: boolean; message: string; data: ShortResponseDto }> {
    try {
      const data = await this.shortsService.findOne(id);
      return { status: true, message: 'Short fetched successfully', data };
    } catch (error) {
      return { status: false, message: error.message || 'An error occurred', data: null };
    }
  }

  /**
   * POST /shorts
   * Create a new short (Admin)
   */
  @Post()
  async create(
    @Body() createShortDto: CreateShortDto,
  ): Promise<{ status: boolean; message: string; data: ShortResponseDto }> {
    try {
      const data = await this.shortsService.create(createShortDto);
      return { status: true, message: 'Short created successfully', data };
    } catch (error) {
      return { status: false, message: error.message || 'An error occurred', data: null };
    }
  }

  /**
   * PUT /shorts/:id
   * Update a short (Admin)
   */
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateShortDto: UpdateShortDto,
  ): Promise<{ status: boolean; message: string; data: ShortResponseDto }> {
    try {
      const data = await this.shortsService.update(id, updateShortDto);
      return { status: true, message: 'Short updated successfully', data };
    } catch (error) {
      return { status: false, message: error.message || 'An error occurred', data: null };
    }
  }

  /**
   * DELETE /shorts/:id
   * Delete a short (Admin)
   */
  @Delete(':id')
  async remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ status: boolean; message: string; data: null }> {
    try {
      await this.shortsService.remove(id);
      return { status: true, message: 'Short deleted successfully', data: null };
    } catch (error) {
      return { status: false, message: error.message || 'An error occurred', data: null };
    }
  }

  /**
   * POST /shorts/:id/view
   * Increment view count — called by player when a short is watched
   */
  @Post(':id/view')
  async incrementView(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ status: boolean; message: string }> {
    try {
      await this.shortsService.incrementView(id);
      return { status: true, message: 'View count incremented' };
    } catch (error) {
      return { status: false, message: error.message || 'An error occurred' };
    }
  }
}
