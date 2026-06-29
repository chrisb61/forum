import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { PostsService } from './posts.service';
import { CreatePostDto, UpdatePostDto } from './dto/create-post.dto';
import { Public } from '../auth/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/user.decorator';

@ApiTags('Posts')
@Controller('posts')
export class PostsController {
  constructor(private posts: PostsService) {}

  @Public()
  @Get('thread/:threadId')
  @ApiOperation({ summary: 'Get posts in a thread' })
  findByThread(
    @Param('threadId') threadId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.posts.findByThread(threadId, +page, +limit);
  }

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a post' })
  create(@CurrentUser() user: any, @Body() dto: CreatePostDto) {
    return this.posts.create(user.id, dto);
  }

  @Put(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Edit a post' })
  update(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() dto: UpdatePostDto,
  ) {
    return this.posts.update(id, user.id, user.role, dto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a post' })
  delete(@Param('id') id: string, @CurrentUser() user: any) {
    return this.posts.delete(id, user.id, user.role);
  }

  @Get(':id/versions')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get edit history for a post' })
  getVersions(@Param('id') id: string) {
    return this.posts.getVersions(id);
  }
}
