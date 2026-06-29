import { Controller, Post, Get, Body, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ModerationService, ModerationActionDto } from './moderation.service';
import { CurrentUser } from '../common/decorators/user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@forum/database';

@ApiTags('Moderation')
@Controller('moderation')
@ApiBearerAuth()
@Roles(Role.MODERATOR)
export class ModerationController {
  constructor(private moderation: ModerationService) {}

  @Post('actions')
  @ApiOperation({ summary: 'Take moderation action' })
  takeAction(@CurrentUser() user: any, @Body() dto: ModerationActionDto) {
    return this.moderation.takeAction(user.id, dto);
  }

  @Get('audit-log')
  @ApiOperation({ summary: 'Get moderation audit log' })
  getAuditLog(@Query('page') page = 1, @Query('limit') limit = 20) {
    return this.moderation.getAuditLog(+page, +limit);
  }
}
