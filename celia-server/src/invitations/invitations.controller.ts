import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { InvitationsService } from './invitations.service';
import {
  CreateInvitationDto,
  BulkInviteDto,
} from './dto/create-invitation.dto';
import { UpdateInvitationDto } from './dto/update-invitation.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Invitations')
@Controller('invitations')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class InvitationsController {
  constructor(private invitationsService: InvitationsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a single invitation' })
  @ApiResponse({
    status: 201,
    description: 'Invitation created successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Only host can send invitations',
  })
  @ApiResponse({
    status: 404,
    description: 'Event or invitee not found',
  })
  @ApiResponse({
    status: 409,
    description: 'User already invited',
  })
  create(@CurrentUser() user: any, @Body() dto: CreateInvitationDto) {
    return this.invitationsService.create(user.id, dto);
  }

  @Post('bulk')
  @ApiOperation({ summary: 'Send bulk invitations' })
  @ApiResponse({
    status: 201,
    description: 'Invitations sent successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Only host can send invitations',
  })
  @ApiResponse({
    status: 404,
    description: 'Event not found',
  })
  bulkCreate(@CurrentUser() user: any, @Body() dto: BulkInviteDto) {
    return this.invitationsService.bulkCreate(user.id, dto);
  }

  @Get('my')
  @ApiOperation({ summary: 'Get my invitations' })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filter by status (pending, going, declined)',
  })
  @ApiResponse({
    status: 200,
    description: 'List of user invitations',
  })
  findMyInvitations(
    @CurrentUser() user: any,
    @Query('status') status?: string,
  ) {
    return this.invitationsService.findMyInvitations(user.id, status);
  }

  @Get('event/:eventId')
  @ApiOperation({ summary: 'Get all invitations for an event' })
  @ApiResponse({
    status: 200,
    description: 'List of event invitations',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Only host can view',
  })
  @ApiResponse({
    status: 404,
    description: 'Event not found',
  })
  findEventInvitations(
    @Param('eventId') eventId: string,
    @CurrentUser() user: any,
  ) {
    return this.invitationsService.findEventInvitations(eventId, user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update invitation status' })
  @ApiResponse({
    status: 200,
    description: 'Invitation status updated',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Can only update own invitations',
  })
  @ApiResponse({
    status: 404,
    description: 'Invitation not found',
  })
  updateStatus(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() dto: UpdateInvitationDto,
  ) {
    return this.invitationsService.updateStatus(id, user.id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete invitation' })
  @ApiResponse({
    status: 200,
    description: 'Invitation deleted successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Only inviter or host can delete',
  })
  @ApiResponse({
    status: 404,
    description: 'Invitation not found',
  })
  delete(@Param('id') id: string, @CurrentUser() user: any) {
    return this.invitationsService.delete(id, user.id);
  }
}
