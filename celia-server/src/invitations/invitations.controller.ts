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
  Logger,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiBody,
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
  private readonly logger = new Logger(InvitationsController.name);

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
  @ApiBody({
    description: 'Bulk invitation payload',
    type: BulkInviteDto,
    examples: {
      default: {
        summary: 'Invite multiple users to an event',
        description:
          'Host invites three users to an event with a shared personal message',
        value: {
          eventId: 'event_123e4567-e89b-12d3-a456-426614174000',
          inviteeIds: [
            'user_11111111-1111-1111-1111-111111111111',
            'user_22222222-2222-2222-2222-222222222222',
            'user_33333333-3333-3333-3333-333333333333',
          ],
          personalMessage:
            "Hey! I'd love for you to join us for this event tonight 🎉",
        },
      },
    },
  })
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
  async bulkCreate(@CurrentUser() user: any, @Body() dto: BulkInviteDto) {
    this.logger.log(
      `[BULK_INVITE_CONTROLLER] Received bulk invite request - UserId: ${user?.id}, EventId: ${dto?.eventId}, InviteeCount: ${dto?.inviteeIds?.length || 0}`,
    );

    try {
      // Validate request data
      if (!dto.eventId) {
        this.logger.error(
          `[BULK_INVITE_CONTROLLER] Missing eventId in request - UserId: ${user?.id}`,
        );
        throw new BadRequestException('Event ID is required');
      }

      if (!dto.inviteeIds || dto.inviteeIds.length === 0) {
        this.logger.error(
          `[BULK_INVITE_CONTROLLER] Missing or empty inviteeIds in request - UserId: ${user?.id}, EventId: ${dto.eventId}`,
        );
        throw new BadRequestException('At least one invitee ID is required');
      }

      if (!user?.id) {
        this.logger.error(
          `[BULK_INVITE_CONTROLLER] Missing user ID in request context`,
        );
        throw new BadRequestException('User ID is required');
      }

      this.logger.debug(
        `[BULK_INVITE_CONTROLLER] Request validated - Proceeding to service layer`,
      );

      const result = await this.invitationsService.bulkCreate(user.id, dto);

      this.logger.log(
        `[BULK_INVITE_CONTROLLER] Bulk invite completed successfully - UserId: ${user.id}, EventId: ${dto.eventId}, Created: ${result.invitations?.length || 0}, Skipped: ${result.skipped || 0}`,
      );

      return result;
    } catch (error: any) {
      this.logger.error(
        `[BULK_INVITE_CONTROLLER] Error in bulk invite endpoint - UserId: ${user?.id}, EventId: ${dto?.eventId}, ErrorType: ${error.constructor?.name || 'Unknown'}, ErrorMessage: ${error.message || 'Unknown error'}`,
      );
      this.logger.error(
        `[BULK_INVITE_CONTROLLER] Error stack: ${error.stack || 'No stack trace'}`,
      );
      this.logger.error(
        `[BULK_INVITE_CONTROLLER] Request body: ${JSON.stringify(dto, null, 2)}`,
      );

      // Re-throw the error so NestJS exception filters can handle it properly
      throw error;
    }
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
