import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { AuditLogsService, CreateAuditLogOptions } from './audit-logs.service';
import { AuthGuard } from '../guards/auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';

@Controller('audit-logs')
@UseGuards(AuthGuard, RolesGuard)
export class AuditLogsController {
  constructor(private readonly auditLogsService: AuditLogsService) {}

  /**
   * Get audit logs
   * GET /audit-logs?limit=50&offset=0
   */
  @Roles('1', '2', '3', 'admin', 'superadmin', 'super_admin')
  @Get()
  async findAll(@Query('limit') limit?: string, @Query('offset') offset?: string) {
    try {
      const parsedLimit = limit ? Math.min(Number(limit), 500) : 50;
      const parsedOffset = offset ? Number(offset) : 0;
      return await this.auditLogsService.findAll(parsedLimit, parsedOffset);
    } catch (error) {
      return {
        status: false,
        message: error.message || 'Failed to fetch audit logs',
        data: [],
        total: 0,
      };
    }
  }

  /**
   * Create an audit log entry manually
   * POST /audit-logs
   */
  @Roles('1', '2', '3', 'admin', 'superadmin', 'super_admin')
  @Post()
  async create(@Body() body: CreateAuditLogOptions) {
    try {
      const log = await this.auditLogsService.createLog(body);
      return {
        status: true,
        message: 'Audit log recorded successfully',
        data: log,
      };
    } catch (error) {
      return {
        status: false,
        message: error.message || 'Failed to record audit log',
        data: null,
      };
    }
  }
}

