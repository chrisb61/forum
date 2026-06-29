import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ReactionsService } from './reactions.service';
import { ReactionType } from '@forum/database';
import { CurrentUser } from '../common/decorators/user.decorator';
import { Public } from '../auth/decorators/public.decorator';

class ReactDto {
  @ApiProperty({ enum: ReactionType })
  @IsEnum(ReactionType)
  type: ReactionType;
}

@ApiTags('Reactions')
@Controller('reactions')
export class ReactionsController {
  constructor(private reactions: ReactionsService) {}

  @Post('posts/:postId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Toggle reaction on a post' })
  toggle(
    @Param('postId') postId: string,
    @CurrentUser() user: any,
    @Body() dto: ReactDto,
  ) {
    return this.reactions.toggle(user.id, postId, dto.type);
  }

  @Public()
  @Get('posts/:postId')
  @ApiOperation({ summary: 'Get reactions for a post' })
  getForPost(@Param('postId') postId: string) {
    return this.reactions.getForPost(postId);
  }
}
