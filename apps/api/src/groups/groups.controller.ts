import { Controller, Get, Post, Patch, Delete, Param, Body, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { GroupsService } from './groups.service';
import { CurrentUser } from '../common/decorators/user.decorator';

@ApiTags('Groups')
@ApiBearerAuth()
@Controller('groups')
export class GroupsController {
  constructor(private readonly groups: GroupsService) {}

  @Get()
  @ApiOperation({ summary: 'List discoverable groups' })
  listDiscoverable() {
    return this.groups.listDiscoverable();
  }

  @Get('mine')
  @ApiOperation({ summary: 'My groups' })
  myGroups(@CurrentUser() user: any) {
    return this.groups.myGroups(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get group detail' })
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.groups.findOne(id, user.id);
  }

  @Get(':id/pending')
  @ApiOperation({ summary: 'Pending join requests (owner only)' })
  pendingRequests(@Param('id') id: string, @CurrentUser() user: any) {
    return this.groups.pendingRequests(id, user.id);
  }

  @Get(':id/resources')
  @ApiOperation({ summary: 'Resources shared in this group (members only)' })
  groupResources(@Param('id') id: string, @CurrentUser() user: any) {
    return this.groups.groupResources(id, user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a group' })
  create(@CurrentUser() user: any, @Body() body: { name: string; description?: string; isDiscoverable?: boolean }) {
    return this.groups.create(user.id, user.memberType, body);
  }

  @Post(':id/join')
  @ApiOperation({ summary: 'Request to join a group' })
  requestJoin(@Param('id') id: string, @CurrentUser() user: any) {
    return this.groups.requestJoin(id, user.id);
  }

  @Post(':id/invite')
  @ApiOperation({ summary: 'Invite a member by username (owner only)' })
  invite(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() body: { username: string },
  ) {
    return this.groups.invite(id, user.id, body.username);
  }

  @Patch(':id/members/:userId')
  @ApiOperation({ summary: 'Approve or reject a join request (owner only)' })
  approveOrReject(
    @Param('id') id: string,
    @Param('userId') memberId: string,
    @CurrentUser() user: any,
    @Body() body: { action: 'ACTIVE' | 'REJECTED' },
  ) {
    return this.groups.approveOrReject(id, user.id, memberId, body.action);
  }

  @Delete(':id/members/:userId')
  @ApiOperation({ summary: 'Remove a member or leave a group' })
  removeMember(
    @Param('id') id: string,
    @Param('userId') memberId: string,
    @CurrentUser() user: any,
  ) {
    return this.groups.removeMember(id, user.id, memberId);
  }
}
