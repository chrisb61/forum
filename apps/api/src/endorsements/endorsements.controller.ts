import { Controller, Get, Post, Delete, Body, Param, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { EndorsementsService } from './endorsements.service';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('Endorsements')
@ApiBearerAuth()
@Controller('endorsements')
export class EndorsementsController {
  constructor(private readonly svc: EndorsementsService) {}

  @Public()
  @Get('users/:userId')
  @ApiOperation({ summary: 'Get endorsements for a user' })
  getForUser(@Param('userId') userId: string, @Req() req: any) {
    return this.svc.getForUser(userId, req.user?.id);
  }

  @Get('given')
  @ApiOperation({ summary: 'Get endorsements I have given' })
  getGiven(@Req() req: any) {
    return this.svc.getGiven(req.user.id);
  }

  @Post('users/:userId')
  @ApiOperation({ summary: 'Endorse a user for a skill' })
  endorse(
    @Param('userId') userId: string,
    @Req() req: any,
    @Body('skill') skill: string,
    @Body('comment') comment?: string,
  ) {
    return this.svc.endorse(req.user.id, userId, skill, comment);
  }

  @Delete('users/:userId/:skill')
  @ApiOperation({ summary: 'Remove an endorsement' })
  remove(@Param('userId') userId: string, @Param('skill') skill: string, @Req() req: any) {
    return this.svc.removeEndorsement(req.user.id, userId, skill);
  }
}
