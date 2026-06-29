import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { TagsService } from './tags.service';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('Tags')
@Controller('tags')
export class TagsController {
  constructor(private tags: TagsService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get all tags' })
  getAll() {
    return this.tags.getAll();
  }

  @Public()
  @Get('popular')
  @ApiOperation({ summary: 'Get popular tags' })
  getPopular(@Query('limit') limit = 20) {
    return this.tags.getPopular(+limit);
  }
}
