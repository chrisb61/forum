import { Controller, Get, Post, Put, Param, Body, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { TalentService } from './talent.service';
import { CurrentUser } from '../common/decorators/user.decorator';

@ApiTags('Talent Corridor')
@ApiBearerAuth()
@Controller('talent')
export class TalentController {
  constructor(private readonly talent: TalentService) {}

  @Get()
  @ApiOperation({ summary: 'Browse student talent profiles' })
  list(
    @Query('graduationYear') graduationYear?: string,
    @Query('placement') placement?: string,
    @Query('interest') interest?: string,
    @Query('location') location?: string,
    @Query('search') search?: string,
  ) {
    return this.talent.listProfiles({
      graduationYear: graduationYear ? Number(graduationYear) : undefined,
      placementAvailable: placement === 'true' ? true : placement === 'false' ? false : undefined,
      esgInterest: interest,
      location,
      search,
    });
  }

  @Get('my-profile')
  @ApiOperation({ summary: 'Get my student talent profile' })
  myProfile(@CurrentUser() user: any) {
    return this.talent.getMyProfile(user.id);
  }

  @Get('interest-received')
  @ApiOperation({ summary: 'Interest expressed in me (student view)' })
  interestReceived(@CurrentUser() user: any) {
    return this.talent.myInterestReceived(user.id);
  }

  @Get('interest-given')
  @ApiOperation({ summary: 'Interest I have expressed in candidates (corporate view)' })
  interestGiven(@CurrentUser() user: any) {
    return this.talent.myInterestGiven(user.id);
  }

  @Get(':username')
  @ApiOperation({ summary: 'View a student talent profile by username' })
  getProfile(@Param('username') username: string) {
    return this.talent.getProfile(username);
  }

  @Post(':username/interest')
  @ApiOperation({ summary: 'Express interest in a candidate' })
  expressInterest(
    @Param('username') username: string,
    @CurrentUser() user: any,
    @Body() body: { message?: string },
  ) {
    return this.talent.expressInterest(username, user.id, body.message);
  }

  @Put('my-profile')
  @ApiOperation({ summary: 'Create or update my talent profile' })
  upsertProfile(@CurrentUser() user: any, @Body() body: any) {
    return this.talent.upsertMyProfile(user.id, body);
  }
}
