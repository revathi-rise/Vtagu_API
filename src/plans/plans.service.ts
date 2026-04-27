import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Plan } from './entities/plan.entity';
import { CreatePlanDto, UpdatePlanDto, PlanResponseDto } from './dto/plan.dto';

@Injectable()
export class PlansService {
  constructor(
    @InjectRepository(Plan)
    private readonly planRepository: Repository<Plan>,
  ) {}

  /**
   * Get all active plans
   */
  async findAll(): Promise<{ status: boolean; message: string; data: PlanResponseDto[] }> {
    try {
      const plans = await this.planRepository.find({
        where: { status: 1 },
        order: { planId: 'ASC' },
      });

      return {
        status: true,
        message: 'Plans fetched successfully',
        data: plans.map(p => this.mapToResponse(p)),
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  /**
   * Get a single plan by ID
   */
  async findOne(id: number): Promise<{ status: boolean; message: string; data: PlanResponseDto }> {
    try {
      const plan = await this.planRepository.findOne({
        where: { planId: id },
      });

      if (!plan) {
        throw new NotFoundException(`Plan with ID ${id} not found`);
      }

      return {
        status: true,
        message: 'Plan fetched successfully',
        data: this.mapToResponse(plan),
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  /**
   * Create a new plan
   */
  async create(createPlanDto: CreatePlanDto): Promise<{ status: boolean; message: string; data: PlanResponseDto }> {
    try {
      const plan = this.planRepository.create(createPlanDto);
      const savedPlan = await this.planRepository.save(plan);

      return {
        status: true,
        message: 'Plan created successfully',
        data: this.mapToResponse(savedPlan),
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  /**
   * Update an existing plan
   */
  async update(id: number, updatePlanDto: UpdatePlanDto): Promise<{ status: boolean; message: string; data: PlanResponseDto }> {
    try {
      const plan = await this.planRepository.findOne({
        where: { planId: id },
      });

      if (!plan) {
        throw new NotFoundException(`Plan with ID ${id} not found`);
      }

      Object.assign(plan, updatePlanDto);
      const updatedPlan = await this.planRepository.save(plan);

      return {
        status: true,
        message: 'Plan updated successfully',
        data: this.mapToResponse(updatedPlan),
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  /**
   * Deactivate a plan (Soft delete)
   */
  async remove(id: number): Promise<{ status: boolean; message: string }> {
    try {
      const plan = await this.planRepository.findOne({
        where: { planId: id },
      });

      if (!plan) {
        throw new NotFoundException(`Plan with ID ${id} not found`);
      }

      plan.status = 0; // Deactivate
      await this.planRepository.save(plan);

      return {
        status: true,
        message: 'Plan deactivated successfully',
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  /**
   * Helper: Map entity to response DTO
   */
  private mapToResponse(plan: Plan): PlanResponseDto {
    return {
      planId: plan.planId,
      name: plan.name,
      screens: plan.screens,
      quality: plan.quality,
      compatibility: plan.compatibility,
      unlimited: plan.unlimited,
      cancellation: plan.cancellation,
      price: plan.price,
      discount: plan.discount,
      validity: plan.validity,
      status: plan.status,
    };
  }
}
