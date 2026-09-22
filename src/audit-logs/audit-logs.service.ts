import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './entities/audit-log.entity';

export interface CreateAuditLogOptions {
  userId?: number;
  userEmail?: string;
  action: string;
  module: string;
  resourceId?: string;
  details?: any;
  ipAddress?: string;
}

@Injectable()
export class AuditLogsService {
  constructor(
    @InjectRepository(AuditLog)
    private auditLogsRepository: Repository<AuditLog>,
  ) {}

  async createLog(options: CreateAuditLogOptions): Promise<AuditLog> {
    try {
      const detailsString = typeof options.details === 'object' 
        ? JSON.stringify(options.details) 
        : (options.details || null);

      const log = this.auditLogsRepository.create({
        userId: options.userId,
        userEmail: options.userEmail,
        action: options.action,
        module: options.module,
        resourceId: options.resourceId,
        details: detailsString,
        ipAddress: options.ipAddress || 'unknown',
      });

      return await this.auditLogsRepository.save(log);
    } catch (error) {
      console.error('[AUDIT LOG ERROR] Failed to record audit log:', error);
      return null;
    }
  }

  async findAll(limit = 50, offset = 0): Promise<{ status: boolean; data: AuditLog[]; total: number }> {
    const [data, total] = await this.auditLogsRepository.findAndCount({
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });

    return {
      status: true,
      data,
      total,
    };
  }
}
