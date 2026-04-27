import { Controller, Get, Post, Body, Param, Patch, Delete } from '@nestjs/common';
import { PlansService } from './plans.service';
import { CreatePlanDto, UpdatePlanDto } from './dto/plan.dto';

@Controller('plans')
export class PlansController {
  constructor(private readonly plansService: PlansService) {}

  /**
   * Get all plans
   * GET /plans
   */
  @Get()
  async findAll() {
    return this.plansService.findAll();
  }

  /**
   * Get plan by ID
   * GET /plans/:id
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.plansService.findOne(Number(id));
  }

  /**
   * Create a new plan
   * POST /plans
   */
  @Post()
  async create(@Body() createPlanDto: CreatePlanDto) {
    return this.plansService.create(createPlanDto);
  }

  /**
   * Update a plan
   * PATCH /plans/:id
   */
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updatePlanDto: UpdatePlanDto) {
    return this.plansService.update(Number(id), updatePlanDto);
  }

  /**
   * Deactivate a plan
   * DELETE /plans/:id
   */
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.plansService.remove(Number(id));
  }
}
