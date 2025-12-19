import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { FriendsService } from './friends.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { SendFriendRequestDto } from './dto/send-friend-request.dto';

@ApiTags('Friends')
@ApiBearerAuth()
@Controller('friends')
@UseGuards(JwtAuthGuard)
export class FriendsController {
  constructor(private readonly friendsService: FriendsService) {}

  @Post('request')
  @ApiOperation({ summary: 'Send a friend request' })
  @ApiBody({ type: SendFriendRequestDto })
  @ApiResponse({
    status: 201,
    description: 'Friend request sent successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request (already friends, request exists, etc.)',
  })
  async sendFriendRequest(
    @CurrentUser() user: any,
    @Body() dto: SendFriendRequestDto,
  ) {
    return this.friendsService.sendFriendRequest(user.sub, dto.toUserId, dto.message);
  }

  @Post('request/:requestId/accept')
  @ApiOperation({ summary: 'Accept a friend request' })
  @ApiParam({
    name: 'requestId',
    description: 'ID of the friend request to accept',
  })
  @ApiResponse({
    status: 200,
    description: 'Friend request accepted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Friend request not found',
  })
  async acceptFriendRequest(
    @CurrentUser() user: any,
    @Param('requestId') requestId: string,
  ) {
    return this.friendsService.acceptFriendRequest(user.sub, requestId);
  }

  @Post('request/:requestId/decline')
  @ApiOperation({ summary: 'Decline a friend request' })
  @ApiParam({
    name: 'requestId',
    description: 'ID of the friend request to decline',
  })
  @ApiResponse({
    status: 200,
    description: 'Friend request declined successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Friend request not found',
  })
  async declineFriendRequest(
    @CurrentUser() user: any,
    @Param('requestId') requestId: string,
  ) {
    await this.friendsService.declineFriendRequest(user.sub, requestId);
    return { message: 'Friend request declined' };
  }

  @Get('requests')
  @ApiOperation({ summary: 'Get friend requests (sent or received)' })
  @ApiQuery({
    name: 'type',
    required: false,
    enum: ['sent', 'received'],
    description: 'Type of requests to retrieve (default: received)',
  })
  @ApiResponse({
    status: 200,
    description: 'List of friend requests',
  })
  async getFriendRequests(
    @CurrentUser() user: any,
    @Query('type') type?: 'sent' | 'received',
  ) {
    return this.friendsService.getFriendRequests(user.sub, type || 'received');
  }

  @Get()
  async getFriends(
    @CurrentUser() user: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.friendsService.getFriends(
      user.sub,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 50,
    );
  }

  @Get('pending')
  async getPendingRequests(@CurrentUser() user: any) {
    return this.friendsService.getPendingRequests(user.sub);
  }

  @Get('mutual/:userId')
  async getMutualFriends(
    @CurrentUser() user: any,
    @Param('userId') userId: string,
  ) {
    const mutualFriends = await this.friendsService.getMutualFriends(
      user.sub,
      userId,
    );
    return { count: mutualFriends.length, userIds: mutualFriends };
  }

  @Delete(':friendId')
  async removeFriend(
    @CurrentUser() user: any,
    @Param('friendId') friendId: string,
  ) {
    await this.friendsService.removeFriend(user.sub, friendId);
    return { message: 'Friend removed successfully' };
  }

  @Get('check/:userId')
  async checkFriendship(
    @CurrentUser() user: any,
    @Param('userId') userId: string,
  ) {
    const areFriends = await this.friendsService.areFriends(user.sub, userId);
    return { areFriends };
  }
}
