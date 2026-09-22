import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuditLogsService } from './audit-logs.service';
import { AuthGuard } from '../guards/auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';

@Controller('audit-logs')
@UseGuards(AuthGuard, RolesGuard)
export class AuditLogsController {
  constructor(private readonly auditLogsService: AuditLogsService) {}

  /**
   * Get audit logs (Super Admin '1' & Finance Admin '2')
   * GET /audit-logs?limit=50&offset=0
   */
  @Roles('1', '2')
  @Get()
  async findAll(@Query('limit') limit?: string, @Query('offset') offset?: string) {
    const parsedLimit = limit ? Math.min(Number(limit), 100) : 50;
    const parsedOffset = offset ? Number(offset) : 0;
    return this.auditLogsService.findAll(parsedLimit, parsedOffset);
  }
}
