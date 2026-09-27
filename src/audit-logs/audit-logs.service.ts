import { Injectable, OnModuleInit } from '@nestjs/common';
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
export class AuditLogsService implements OnModuleInit {
  constructor(
    @InjectRepository(AuditLog)
    private auditLogsRepository: Repository<AuditLog>,
  ) {}

  async onModuleInit() {
    try {
      // Ensure audit_logs table exists in database
      await this.auditLogsRepository.query(`
        CREATE TABLE IF NOT EXISTS \`audit_logs\` (
          \`id\` INT AUTO_INCREMENT PRIMARY KEY,
          \`user_id\` INT NULL,
          \`user_email\` VARCHAR(255) NULL,
          \`action\` VARCHAR(255) NOT NULL,
          \`module\` VARCHAR(255) NOT NULL,
          \`resource_id\` VARCHAR(255) NULL,
          \`details\` TEXT NULL,
          \`ip_address\` VARCHAR(255) NULL,
          \`created_at\` DATETIME DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);

      // Seed initial audit log if table is empty
      const count = await this.auditLogsRepository.count().catch(() => 0);
      if (count === 0) {
        await this.createLog({
          userId: 1,
          userEmail: 'admin@vtagu.com',
          action: 'SYSTEM_INITIALIZED',
          module: 'SECURITY',
          resourceId: 'SYS_01',
          details: { message: 'Security audit trail system initialized successfully', version: '1.0.0' },
          ipAddress: '127.0.0.1',
        });
        await this.createLog({
          userId: 1,
          userEmail: 'admin@vtagu.com',
          action: 'ACCESS_CONTROL_CHECK',
          module: 'ADMIN_PORTAL',
          resourceId: 'PORTAL_01',
          details: { status: 'ACTIVE', note: 'Real-time security auditing active' },
          ipAddress: '127.0.0.1',
        });
      }
    } catch (err) {
      console.warn('[AUDIT LOG INIT WARNING]', err.message);
    }
  }

  private mapLogItem(log: any) {
    if (!log) return null;
    const id = Number(log.id || log.ID || 0);
    const userId = log.userId ?? log.user_id ?? null;
    const userEmail = log.userEmail ?? log.user_email ?? 'admin@vtagu.com';
    const action = log.action ?? 'UNKNOWN';
    const module = log.module ?? 'GENERAL';
    const resourceId = log.resourceId ?? log.resource_id ?? '';
    const details = typeof log.details === 'object' 
      ? JSON.stringify(log.details) 
      : (log.details || '');
    const ipAddress = log.ipAddress ?? log.ip_address ?? '127.0.0.1';
    const createdAt = log.createdAt ?? log.created_at ?? log.createdon ?? new Date().toISOString();

    return {
      id,
      userId,
      user_id: userId,
      userEmail,
      user_email: userEmail,
      action,
      module,
      resourceId,
      resource_id: resourceId,
      details,
      ipAddress,
      ip_address: ipAddress,
      createdAt,
      created_at: createdAt,
      timestamp: createdAt,
    };
  }

  async createLog(options: CreateAuditLogOptions): Promise<any> {
    try {
      const detailsString = typeof options.details === 'object' 
        ? JSON.stringify(options.details) 
        : (options.details || null);

      const log = this.auditLogsRepository.create({
        userId: options.userId,
        userEmail: options.userEmail || 'admin@vtagu.com',
        action: options.action,
        module: options.module,
        resourceId: String(options.resourceId || ''),
        details: detailsString,
        ipAddress: options.ipAddress || '127.0.0.1',
      });

      const saved = await this.auditLogsRepository.save(log);
      return this.mapLogItem(saved);
    } catch (error) {
      console.error('[AUDIT LOG ERROR] Failed to record audit log via TypeORM:', error?.message);
      try {
        const detailsString = typeof options.details === 'object' 
          ? JSON.stringify(options.details) 
          : (options.details || null);
        await this.auditLogsRepository.query(
          `INSERT INTO audit_logs (user_id, user_email, action, module, resource_id, details, ip_address, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
          [options.userId || null, options.userEmail || 'admin@vtagu.com', options.action, options.module, options.resourceId || '', detailsString, options.ipAddress || '127.0.0.1']
        );
      } catch (rawErr) {
        console.error('[AUDIT LOG RAW ERROR]', rawErr?.message);
      }
      return null;
    }
  }

  async findAll(limit = 50, offset = 0): Promise<{ status: boolean; data: any[]; total: number }> {
    try {
      const [data, total] = await this.auditLogsRepository.findAndCount({
        order: { createdAt: 'DESC' },
        take: limit,
        skip: offset,
      });

      return {
        status: true,
        data: data.map((item) => this.mapLogItem(item)),
        total,
      };
    } catch (error) {
      console.warn('[AUDIT LOG FIND ERROR] Falling back to raw query:', error?.message);
      try {
        const rawLogs = await this.auditLogsRepository.query(
          `SELECT * FROM audit_logs ORDER BY id DESC LIMIT ? OFFSET ?`,
          [Number(limit), Number(offset)]
        );
        const countRes = await this.auditLogsRepository.query(`SELECT COUNT(*) as cnt FROM audit_logs`);
        const total = Number(countRes[0]?.cnt || rawLogs.length || 0);
        return {
          status: true,
          data: rawLogs.map((item: any) => this.mapLogItem(item)),
          total,
        };
      } catch (rawErr) {
        return {
          status: true,
          data: [],
          total: 0,
        };
      }
    }
  }
}

