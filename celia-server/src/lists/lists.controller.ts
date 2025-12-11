import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ListsService } from './lists.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AddToSavedDto } from './dto/add-to-saved.dto';
import { BulkInviteDto } from './dto/bulk-invite.dto';

@Controller('lists')
@UseGuards(JwtAuthGuard)
export class ListsController {
  constructor(private readonly listsService: ListsService) {}

  @Get('saved')
  async getSavedUsers(
    @CurrentUser() user: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.listsService.getSavedUsers(
      user.sub,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 50,
    );
  }

  @Post('saved')
  async addToSaved(@CurrentUser() user: any, @Body() dto: AddToSavedDto) {
    return this.listsService.addToSaved(
      user.sub,
      dto.savedUserId,
      dto.context,
      dto.notes,
    );
  }

  @Delete('saved/:userId')
  async removeFromSaved(
    @CurrentUser() user: any,
    @Param('userId') userId: string,
  ) {
    await this.listsService.removeFromSaved(user.sub, userId);
    return { message: 'User removed from saved list' };
  }

  @Get('saved/check/:userId')
  async checkIfSaved(
    @CurrentUser() user: any,
    @Param('userId') userId: string,
  ) {
    const isSaved = await this.listsService.isUserSaved(user.sub, userId);
    return { isSaved };
  }

  @Get('invitees')
  async getInvitees(
    @CurrentUser() user: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.listsService.getInvitees(
      user.sub,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 50,
    );
  }

  @Post('bulk-invite')
  async bulkInvite(@CurrentUser() user: any, @Body() dto: BulkInviteDto) {
    return this.listsService.bulkInvite(
      user.sub,
      dto.eventId,
      dto.userIds,
      dto.personalMessage,
    );
  }

  @Get('saved/search')
  async searchSavedUsers(
    @CurrentUser() user: any,
    @Query('q') query: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.listsService.searchSavedUsers(
      user.sub,
      query,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 50,
    );
  }
}
