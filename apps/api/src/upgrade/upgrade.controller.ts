import { Controller, Get, Post, Patch, Param, Body } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { UpgradeService } from './upgrade.service';
import { CurrentUser } from '../common/decorators/user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@forum/database';

@ApiTags('Membership Upgrade')
@ApiBearerAuth()
@Controller('upgrade')
export class UpgradeController {
  constructor(private readonly upgrade: UpgradeService) {}

  @Get('mine')
  @ApiOperation({ summary: 'My upgrade application history' })
  mine(@CurrentUser() user: any) {
    return this.upgrade.myApplications(user.id);
  }

  @Get()
  @Roles(Role.ADMINISTRATOR)
  @ApiOperation({ summary: 'All upgrade applications (admin)' })
  listAll() {
    return this.upgrade.listAll();
  }

  @Post()
  @ApiOperation({ summary: 'Submit a membership upgrade application' })
  apply(@CurrentUser() user: any, @Body() body: any) {
    return this.upgrade.apply(user.id, user.memberType, {
      jobTitle: body.jobTitle,
      employer: body.employer,
      yearsExperience: body.yearsExperience,
      qualifications: body.qualifications,
      linkedIn: body.linkedIn,
      statement: body.statement,
      targetType: body.targetType || 'PROFESSIONAL',
    });
  }

  @Patch(':id/review')
  @Roles(Role.ADMINISTRATOR)
  @ApiOperation({ summary: 'Approve or reject an upgrade application' })
  review(
    @Param('id') id: string,
    @Body() body: { action: 'APPROVED' | 'REJECTED'; reviewerNote?: string },
  ) {
    return this.upgrade.review(id, body.action, body.reviewerNote);
  }
}
