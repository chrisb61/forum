import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ThreadsService } from './threads.service';
import { CreateThreadDto, UpdateThreadDto } from './dto/create-thread.dto';
import { Public } from '../auth/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@forum/database';

@ApiTags('Threads')
@Controller('threads')
export class ThreadsController {
  constructor(private threads: ThreadsService) {}

  @Public()
  @Get('forum/:forumId')
  @ApiOperation({ summary: 'Get threads in a forum' })
  findByForum(
    @Param('forumId') forumId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.threads.findByForum(forumId, +page, +limit);
  }

  @Public()
  @Get(':slug')
  @ApiOperation({ summary: 'Get thread by slug' })
  findOne(@Param('slug') slug: string, @CurrentUser() user: any) {
    return this.threads.findOne(slug, user?.id);
  }

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a thread' })
  create(@CurrentUser() user: any, @Body() dto: CreateThreadDto) {
    return this.threads.create(user.id, dto);
  }

  @Put(':slug')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update thread title' })
  update(
    @Param('slug') slug: string,
    @CurrentUser() user: any,
    @Body() dto: UpdateThreadDto,
  ) {
    return this.threads.update(slug, user.id, user.role, dto);
  }

  @Put(':slug/lock')
  @Roles(Role.MODERATOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lock/unlock a thread (moderator)' })
  lock(@Param('slug') slug: string, @Body('lock') lock: boolean) {
    return this.threads.lock(slug, lock);
  }

  @Put(':slug/pin')
  @Roles(Role.MODERATOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Pin/unpin a thread (moderator)' })
  pin(@Param('slug') slug: string, @Body('pin') pin: boolean) {
    return this.threads.pin(slug, pin);
  }

  @Delete(':slug')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a thread' })
  delete(@Param('slug') slug: string, @CurrentUser() user: any) {
    return this.threads.delete(slug, user.id, user.role);
  }

  @Post(':id/subscribe')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Subscribe to thread' })
  subscribe(@Param('id') id: string, @CurrentUser() user: any) {
    return this.threads.subscribe(id, user.id);
  }

  @Delete(':id/subscribe')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Unsubscribe from thread' })
  unsubscribe(@Param('id') id: string, @CurrentUser() user: any) {
    return this.threads.unsubscribe(id, user.id);
  }

  @Post(':id/bookmark')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Bookmark thread' })
  bookmark(@Param('id') id: string, @CurrentUser() user: any) {
    return this.threads.bookmark(id, user.id);
  }

  @Delete(':id/bookmark')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove bookmark' })
  unbookmark(@Param('id') id: string, @CurrentUser() user: any) {
    return this.threads.unbookmark(id, user.id);
  }
}
