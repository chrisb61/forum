import { Controller, Get, Post, Delete, Body, Param, Query, Req, ParseIntPipe, DefaultValuePipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { OpportunitiesService } from './opportunities.service';
import { CreateOpportunityDto } from './dto/create-opportunity.dto';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('Opportunities')
@ApiBearerAuth()
@Controller('opportunities')
export class OpportunitiesController {
  constructor(private readonly svc: OpportunitiesService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'List open board opportunities' })
  findAll(
    @Query('type') type?: string,
    @Query('sector') sector?: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit = 20,
  ) {
    return this.svc.findAll(type, sector, page, limit);
  }

  @Get('mine')
  @ApiOperation({ summary: 'Get my posted opportunities' })
  mine(@Req() req: any) {
    return this.svc.getMyOpportunities(req.user.id);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get a single opportunity' })
  findOne(@Param('id') id: string, @Req() req: any) {
    return this.svc.findOne(id, req.user?.id);
  }

  @Post()
  @ApiOperation({ summary: 'Post a new board opportunity' })
  create(@Req() req: any, @Body() dto: CreateOpportunityDto) {
    return this.svc.create(req.user.id, dto);
  }

  @Post(':id/express-interest')
  @ApiOperation({ summary: 'Express interest in an opportunity' })
  expressInterest(@Param('id') id: string, @Req() req: any, @Body('message') message?: string) {
    return this.svc.expressInterest(id, req.user.id, message);
  }

  @Delete(':id/express-interest')
  @ApiOperation({ summary: 'Withdraw interest from an opportunity' })
  withdrawInterest(@Param('id') id: string, @Req() req: any) {
    return this.svc.withdrawInterest(id, req.user.id);
  }

  @Post(':id/close')
  @ApiOperation({ summary: 'Close an opportunity (poster only)' })
  close(@Param('id') id: string, @Req() req: any) {
    return this.svc.close(id, req.user.id);
  }

  @Get(':id/expressions')
  @ApiOperation({ summary: 'Get expressions of interest (poster only)' })
  expressions(@Param('id') id: string, @Req() req: any) {
    return this.svc.getExpressions(id, req.user.id);
  }
}
