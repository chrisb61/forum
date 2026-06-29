import { Controller, Get, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { CurrentUser } from '../common/decorators/user.decorator';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private users: UsersService) {}

  @Public()
  @Get(':username')
  @ApiOperation({ summary: 'Get user profile' })
  getProfile(@Param('username') username: string) {
    return this.users.findOne(username);
  }

  @Put('profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update own profile' })
  updateProfile(@CurrentUser() user: any, @Body() dto: UpdateProfileDto) {
    return this.users.updateProfile(user.id, dto);
  }

  @Public()
  @Get(':username/threads')
  @ApiOperation({ summary: "Get user's threads" })
  getUserThreads(
    @Param('username') username: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.users.getUserThreads(username, +page, +limit);
  }

  @Public()
  @Get(':username/posts')
  @ApiOperation({ summary: "Get user's posts" })
  getUserPosts(
    @Param('username') username: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.users.getUserPosts(username, +page, +limit);
  }
}
