import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ForumsService } from './forums.service';
import { CreateForumDto } from './dto/create-forum.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@forum/database';

@ApiTags('Forums')
@Controller('forums')
export class ForumsController {
  constructor(private forums: ForumsService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get all categories and forums' })
  getAll() {
    return this.forums.getAll();
  }

  @Public()
  @Get(':slug')
  @ApiOperation({ summary: 'Get forum by slug' })
  findOne(@Param('slug') slug: string) {
    return this.forums.findOne(slug);
  }

  @Post('categories')
  @Roles(Role.ADMINISTRATOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a category (admin)' })
  createCategory(@Body() dto: CreateCategoryDto) {
    return this.forums.createCategory(dto);
  }

  @Post()
  @Roles(Role.ADMINISTRATOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a forum (admin)' })
  createForum(@Body() dto: CreateForumDto) {
    return this.forums.createForum(dto);
  }

  @Put(':id')
  @Roles(Role.ADMINISTRATOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a forum (admin)' })
  updateForum(@Param('id') id: string, @Body() dto: Partial<CreateForumDto>) {
    return this.forums.updateForum(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMINISTRATOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a forum (admin)' })
  deleteForum(@Param('id') id: string) {
    return this.forums.deleteForum(id);
  }
}
