import { Controller, Post, Get, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { MessagesService } from './messages.service';
import { CurrentUser } from '../common/decorators/user.decorator';

class SendMessageDto {
  @ApiProperty()
  @IsString()
  recipientId: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  content: string;
}

@ApiTags('Messages')
@Controller('messages')
@ApiBearerAuth()
export class MessagesController {
  constructor(private messages: MessagesService) {}

  @Post()
  @ApiOperation({ summary: 'Send a direct message' })
  send(@CurrentUser() user: any, @Body() dto: SendMessageDto) {
    return this.messages.send(user.id, dto.recipientId, dto.content);
  }

  @Get('conversations')
  @ApiOperation({ summary: 'Get all conversations' })
  getConversations(@CurrentUser() user: any) {
    return this.messages.getConversations(user.id);
  }

  @Get('conversations/:userId')
  @ApiOperation({ summary: 'Get conversation with a user' })
  getConversation(
    @CurrentUser() user: any,
    @Param('userId') otherId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 50,
  ) {
    return this.messages.getConversation(user.id, otherId, +page, +limit);
  }

  @Post('block/:userId')
  @ApiOperation({ summary: 'Block a user' })
  block(@CurrentUser() user: any, @Param('userId') userId: string) {
    return this.messages.block(user.id, userId);
  }

  @Delete('block/:userId')
  @ApiOperation({ summary: 'Unblock a user' })
  unblock(@CurrentUser() user: any, @Param('userId') userId: string) {
    return this.messages.unblock(user.id, userId);
  }
}
