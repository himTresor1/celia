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
import { FriendsService } from './friends.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { SendPulseDto } from './dto/send-pulse.dto';

@Controller('friends')
@UseGuards(JwtAuthGuard)
export class FriendsController {
  constructor(private readonly friendsService: FriendsService) {}

  @Post('pulse')
  async sendEnergyPulse(
    @CurrentUser() user: any,
    @Body() dto: SendPulseDto,
  ) {
    return this.friendsService.sendEnergyPulse(user.sub, dto.toUserId);
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
