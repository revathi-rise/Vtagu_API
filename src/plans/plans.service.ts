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
      const planData: import('typeorm').DeepPartial<Plan> = { ...createPlanDto };
      if (createPlanDto.plan_name) planData.name = createPlanDto.plan_name;
      if (createPlanDto.plan_price) planData.price = createPlanDto.plan_price;
      if (createPlanDto.plan_duration) planData.validity = createPlanDto.plan_duration;
      if (createPlanDto.plan_description) planData.description = createPlanDto.plan_description;
      if (createPlanDto.is_interactive_included !== undefined) {
        planData.isInteractiveIncluded = Number(createPlanDto.is_interactive_included);
      } else if (createPlanDto.isInteractiveIncluded !== undefined) {
        planData.isInteractiveIncluded = Number(createPlanDto.isInteractiveIncluded);
      }

      if (createPlanDto.is_shorts_included !== undefined) {
        planData.isShortsIncluded = Number(createPlanDto.is_shorts_included);
      } else if (createPlanDto.isShortsIncluded !== undefined) {
        planData.isShortsIncluded = Number(createPlanDto.isShortsIncluded);
      }
      
      const plan = this.planRepository.create(planData);
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

      const updateData: import('typeorm').DeepPartial<Plan> = { ...updatePlanDto };
      if (updatePlanDto.plan_name) updateData.name = updatePlanDto.plan_name;
      if (updatePlanDto.plan_price) updateData.price = updatePlanDto.plan_price;
      if (updatePlanDto.plan_duration) updateData.validity = updatePlanDto.plan_duration;
      if (updatePlanDto.plan_description) updateData.description = updatePlanDto.plan_description;
      if (updatePlanDto.is_interactive_included !== undefined) {
        updateData.isInteractiveIncluded = Number(updatePlanDto.is_interactive_included);
      } else if (updatePlanDto.isInteractiveIncluded !== undefined) {
        updateData.isInteractiveIncluded = Number(updatePlanDto.isInteractiveIncluded);
      }
      if (updatePlanDto.is_shorts_included !== undefined) {
        updateData.isShortsIncluded = Number(updatePlanDto.is_shorts_included);
      } else if (updatePlanDto.isShortsIncluded !== undefined) {
        updateData.isShortsIncluded = Number(updatePlanDto.isShortsIncluded);
      }

      Object.assign(plan, updateData);
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
  private mapToResponse(plan: Plan | null): PlanResponseDto | null {
    if (!plan) return null;
    const hasQuality = plan.quality && plan.quality.trim() !== '' && plan.quality.trim().toLowerCase() !== 'none';
    const isStandard = hasQuality ? 1 : 0;
    return {
      planId: plan.planId,
      id: plan.planId,
      name: plan.name,
      plan_name: plan.name,
      screens: plan.screens,
      quality: plan.quality,
      compatibility: plan.compatibility,
      unlimited: plan.unlimited,
      cancellation: plan.cancellation,
      price: plan.price,
      plan_price: plan.price,
      discount: plan.discount,
      validity: plan.validity,
      plan_duration: plan.validity,
      plan_description: plan.description,
      status: plan.status,
      currency: plan.currency || 'INR',
      is_interactive_included: plan.isInteractiveIncluded || 0,
      isInteractiveIncluded: plan.isInteractiveIncluded || 0,
      is_shorts_included: plan.isShortsIncluded !== undefined ? Number(plan.isShortsIncluded) : 1,
      isShortsIncluded: plan.isShortsIncluded !== undefined ? Number(plan.isShortsIncluded) : 1,
      is_standard_included: isStandard,
      isStandardIncluded: isStandard,
    };
  }
}
