import { Controller, Get, Post, Put, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ReportsService, CreateReportDto } from './reports.service';
import { CurrentUser } from '../common/decorators/user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Role, ReportStatus } from '@forum/database';

@ApiTags('Reports')
@Controller('reports')
@ApiBearerAuth()
export class ReportsController {
  constructor(private reports: ReportsService) {}

  @Post()
  @ApiOperation({ summary: 'Submit a report' })
  create(@CurrentUser() user: any, @Body() dto: CreateReportDto) {
    return this.reports.create(user.id, dto);
  }

  @Get()
  @Roles(Role.MODERATOR)
  @ApiOperation({ summary: 'Get all reports (moderator)' })
  getAll(
    @Query('status') status?: ReportStatus,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.reports.getAll(status, +page, +limit);
  }

  @Put(':id/resolve')
  @Roles(Role.MODERATOR)
  @ApiOperation({ summary: 'Resolve a report (moderator)' })
  resolve(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body('status') status: ReportStatus,
  ) {
    return this.reports.resolve(id, user.id, status);
  }
}
