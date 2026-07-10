import { Controller, Get, Post, Patch, Param, Body } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CoursesService } from './courses.service';
import { CurrentUser } from '../common/decorators/user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@forum/database';

@ApiTags('Courses')
@ApiBearerAuth()
@Controller('courses')
export class CoursesController {
  constructor(private readonly courses: CoursesService) {}

  @Get()
  @ApiOperation({ summary: 'List approved course listings' })
  list() {
    return this.courses.list(true);
  }

  @Get('pending')
  @Roles(Role.MODERATOR, Role.ADMINISTRATOR)
  listPending() {
    return this.courses.listPending();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.courses.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Submit a course listing' })
  create(@CurrentUser() user: any, @Body() body: any) {
    return this.courses.create(user.id, {
      title: body.title,
      providerName: body.providerName,
      description: body.description,
      isExternalProvider: body.isExternalProvider ?? false,
      externalUrl: body.externalUrl,
      price: body.price,
      deliveryMode: body.deliveryMode,
      startDate: body.startDate,
      sectors: body.sectors ?? [],
    });
  }

  @Patch(':id/moderate')
  @Roles(Role.MODERATOR, Role.ADMINISTRATOR)
  moderate(
    @Param('id') id: string,
    @Body() body: { action: 'APPROVED' | 'REJECTED'; commissionUrl?: string },
  ) {
    return this.courses.moderate(id, body.action, body.commissionUrl);
  }
}
