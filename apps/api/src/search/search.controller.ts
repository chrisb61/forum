import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { SearchService } from './search.service';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('Search')
@Controller('search')
export class SearchController {
  constructor(private search: SearchService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Search threads, posts, or users' })
  @ApiQuery({ name: 'q', required: true })
  @ApiQuery({ name: 'type', enum: ['threads', 'posts', 'users'], required: false })
  search(
    @Query('q') q: string,
    @Query('type') type = 'threads',
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.search.search(q, type, +page, +limit);
  }
}
