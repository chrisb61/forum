import { Controller, Get, Put, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@forum/database';

@ApiTags('Admin')
@Controller('admin')
@ApiBearerAuth()
@Roles(Role.ADMINISTRATOR)
export class AdminController {
  constructor(private admin: AdminService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get dashboard statistics' })
  getDashboard() {
    return this.admin.getDashboardStats();
  }

  @Get('users')
  @ApiOperation({ summary: 'Get all users' })
  getUsers(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('search') search?: string,
  ) {
    return this.admin.getUsers(+page, +limit, search);
  }

  @Put('users/:id/role')
  @ApiOperation({ summary: 'Update user role' })
  updateRole(@Param('id') id: string, @Body('role') role: Role) {
    return this.admin.updateUserRole(id, role);
  }

  @Get('settings')
  @ApiOperation({ summary: 'Get site settings' })
  getSettings() {
    return this.admin.getSiteSettings();
  }

  @Put('settings/:key')
  @ApiOperation({ summary: 'Update a site setting' })
  updateSetting(@Param('key') key: string, @Body('value') value: any) {
    return this.admin.updateSiteSetting(key, value);
  }
}
