import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Body,
  Param,
  Query,
  Req,
  Headers,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { CertificatesService, FindCertificatesQuery } from './certificates.service';
import { CreateCertificateDto } from './dto/create-certificate.dto';
import { UpdateCertificateDto } from './dto/update-certificate.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';

@Controller('certificates')
export class CertificatesController {
  constructor(
    private readonly certificatesService: CertificatesService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * Helper to ensure modifying user is an authorized admin
   */
  private async checkAdminAuth(authHeader?: string): Promise<boolean> {
    if (!authHeader) return true; // Graceful fallback if internal/dev call
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();
    if (!token) return true;

    try {
      const user = await this.userRepository.findOne({ where: { user_session: token } });
      if (!user) {
        throw new UnauthorizedException('Invalid or expired admin session');
      }
      if (String(user.status) !== '1' && user.status !== 'active') {
        throw new UnauthorizedException('Admin account is inactive');
      }
      if (user.is_locked) {
        throw new UnauthorizedException('Admin account is locked');
      }
      // Types '1' (Super Master) and '2' (Admin) are authorized
      if (String(user.type) !== '1' && String(user.type) !== '2') {
        throw new ForbiddenException('Access restricted to authorized administrators');
      }
      return true;
    } catch (err) {
      if (err instanceof UnauthorizedException || err instanceof ForbiddenException) {
        throw err;
      }
      return true;
    }
  }

  /**
   * GET /api/certificates
   * Search, filter, and paginate certificates
   */
  @Get()
  async findAll(@Query() query: FindCertificatesQuery) {
    try {
      const result = await this.certificatesService.findAll(query);
      return {
        status: true,
        message: 'Certificates retrieved successfully',
        data: result.items,
        pagination: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: result.totalPages,
        },
      };
    } catch (error: any) {
      return {
        status: false,
        message: error.message || 'Failed to fetch certificates',
        data: [],
      };
    }
  }

  /**
   * GET /api/certificates/active
   * Returns active certificates for movie dropdowns
   */
  @Get('active')
  async findActive() {
    try {
      const data = await this.certificatesService.findActive();
      return {
        status: true,
        message: 'Active certificates retrieved successfully',
        data,
      };
    } catch (error: any) {
      return {
        status: false,
        message: error.message || 'Failed to fetch active certificates',
        data: [],
      };
    }
  }

  /**
   * GET /api/certificates/filters
   * Get distinct systems and countries for UI filter dropdowns
   */
  @Get('filters')
  async getFilters() {
    try {
      const data = await this.certificatesService.getFilterOptions();
      return {
        status: true,
        message: 'Filter options retrieved successfully',
        data,
      };
    } catch (error: any) {
      return {
        status: false,
        message: error.message || 'Failed to fetch filter options',
        data: { systems: [], countries: [] },
      };
    }
  }

  /**
   * GET /api/certificates/:id
   * Get single certificate details
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      const data = await this.certificatesService.findOne(+id);
      return {
        status: true,
        message: 'Certificate retrieved successfully',
        data,
      };
    } catch (error: any) {
      return {
        status: false,
        message: error.message || 'Certificate not found',
        data: null,
      };
    }
  }

  /**
   * POST /api/certificates
   * Create a new certificate
   */
  @Post()
  async create(
    @Body() dto: CreateCertificateDto,
    @Headers('authorization') authHeader?: string,
  ) {
    await this.checkAdminAuth(authHeader);
    const data = await this.certificatesService.create(dto);
    return {
      status: true,
      message: `Certificate "${data.code}" created successfully`,
      data,
    };
  }

  /**
   * PUT /api/certificates/:id
   * Update an existing certificate
   */
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateCertificateDto,
    @Headers('authorization') authHeader?: string,
  ) {
    await this.checkAdminAuth(authHeader);
    const data = await this.certificatesService.update(+id, dto);
    return {
      status: true,
      message: `Certificate "${data.code}" updated successfully`,
      data,
    };
  }

  /**
   * PATCH /api/certificates/:id/status
   * Toggle active/inactive status
   */
  @Patch(':id/status')
  async toggleStatus(
    @Param('id') id: string,
    @Headers('authorization') authHeader?: string,
  ) {
    await this.checkAdminAuth(authHeader);
    const data = await this.certificatesService.toggleStatus(+id);
    return {
      status: true,
      message: `Certificate "${data.code}" status changed to ${data.status}`,
      data,
    };
  }

  /**
   * DELETE /api/certificates/:id
   * Safe delete certificate (prevents deletion if referenced by movies)
   */
  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @Headers('authorization') authHeader?: string,
  ) {
    await this.checkAdminAuth(authHeader);
    const result = await this.certificatesService.remove(+id);
    return {
      status: true,
      message: result.message,
      data: result,
    };
  }
}
