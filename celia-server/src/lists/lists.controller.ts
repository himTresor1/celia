import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
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
      user.id || user.sub,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 50,
    );
  }

  @Post('saved')
  async addToSaved(@CurrentUser() user: any, @Body() dto: AddToSavedDto, @Req() req: any) {
    // Debug: Log the entire request to understand what's happening
    console.log('[ListsController] addToSaved - Request received');
    console.log('[ListsController] addToSaved - User object:', user);
    console.log('[ListsController] addToSaved - User type:', typeof user);
    console.log('[ListsController] addToSaved - User is null?', user === null);
    console.log('[ListsController] addToSaved - User is undefined?', user === undefined);
    
    if (user) {
      console.log('[ListsController] addToSaved - User object keys:', Object.keys(user));
      console.log('[ListsController] addToSaved - user.id:', user.id);
      console.log('[ListsController] addToSaved - user.sub:', user.sub);
    }
    
    // Also check request.user directly
    console.log('[ListsController] addToSaved - req.user:', req.user);
    
    // Extract user ID - try multiple possible locations
    const userId = user?.id || user?.sub || (user as any)?.userId || req?.user?.id || req?.user?.sub;
    
    if (!userId) {
      console.error('[ListsController] addToSaved - No user ID found!');
      console.error('[ListsController] addToSaved - User object:', JSON.stringify(user, null, 2));
      console.error('[ListsController] addToSaved - Request user:', JSON.stringify(req.user, null, 2));
      throw new Error('User ID not found in request. Please ensure you are authenticated.');
    }
    
    console.log('[ListsController] addToSaved - Using userId:', userId);
    
    return this.listsService.addToSaved(
      userId,
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
    await this.listsService.removeFromSaved(user.id || user.sub, userId);
    return { message: 'User removed from saved list' };
  }

  @Get('saved/check/:userId')
  async checkIfSaved(
    @CurrentUser() user: any,
    @Param('userId') userId: string,
  ) {
    const isSaved = await this.listsService.isUserSaved(user.id || user.sub, userId);
    return { isSaved };
  }

  @Get('invitees')
  async getInvitees(
    @CurrentUser() user: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.listsService.getInvitees(
      user.id || user.sub,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 50,
    );
  }

  @Post('bulk-invite')
  async bulkInvite(@CurrentUser() user: any, @Body() dto: BulkInviteDto) {
    return this.listsService.bulkInvite(
      user.id || user.sub,
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
      user.id || user.sub,
      query,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 50,
    );
  }
}
