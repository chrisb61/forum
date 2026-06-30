import { Controller, Get, Param, Query } from '@nestjs/common';
import { ReputationService } from './reputation.service';
import { Public } from '../auth/decorators/public.decorator';

@Controller('reputation')
export class ReputationController {
  constructor(private reputation: ReputationService) {}

  @Public()
  @Get('leaderboard')
  getLeaderboard(@Query('limit') limit?: string) {
    return this.reputation.getLeaderboard(limit ? Math.min(parseInt(limit), 100) : 20);
  }

  @Public()
  @Get('users/:userId')
  getUserReputation(@Param('userId') userId: string) {
    return this.reputation.getUserReputation(userId);
  }
}
