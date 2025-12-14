import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateInvitationDto,
  BulkInviteDto,
} from './dto/create-invitation.dto';
import { UpdateInvitationDto } from './dto/update-invitation.dto';

@Injectable()
export class InvitationsService {
  private readonly logger = new Logger(InvitationsService.name);

  constructor(private prisma: PrismaService) {}

  async create(inviterId: string, dto: CreateInvitationDto) {
    const event = await this.prisma.event.findUnique({
      where: { id: dto.eventId },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    if (event.hostId !== inviterId) {
      throw new ForbiddenException(
        'Only the event host can send invitations',
      );
    }

    if (dto.inviteeId === inviterId) {
      throw new BadRequestException('You cannot invite yourself');
    }

    const invitee = await this.prisma.user.findUnique({
      where: { id: dto.inviteeId },
    });

    if (!invitee) {
      throw new NotFoundException('Invitee not found');
    }

    const existing = await this.prisma.eventInvitation.findUnique({
      where: {
        eventId_inviteeId: {
          eventId: dto.eventId,
          inviteeId: dto.inviteeId,
        },
      },
    });

    if (existing) {
      throw new ConflictException('User already invited to this event');
    }

    const invitation = await this.prisma.$transaction(async (tx) => {
      // Create invitation
      const created = await tx.eventInvitation.create({
        data: {
          eventId: dto.eventId,
          inviterId,
          inviteeId: dto.inviteeId,
          personalMessage: dto.personalMessage,
        },
        include: {
          event: {
            include: {
              host: {
                select: {
                  id: true,
                  fullName: true,
                  avatarUrl: true,
                },
              },
              category: true,
            },
          },
          inviter: {
            select: {
              id: true,
              fullName: true,
              avatarUrl: true,
            },
          },
          invitee: {
            select: {
              id: true,
              fullName: true,
              avatarUrl: true,
            },
          },
        },
      });

      // Update event status from draft to active if this is the first invitation
      if (event.status === 'draft') {
        await tx.event.update({
          where: { id: dto.eventId },
          data: { status: 'active' },
        });
      }

      return created;
    });

    return invitation;
  }

  async bulkCreate(inviterId: string, dto: BulkInviteDto) {
    this.logger.log(
      `[BULK_INVITE] Starting bulk invitation creation - Inviter: ${inviterId}, Event: ${dto.eventId}, InviteeCount: ${dto.inviteeIds?.length || 0}`,
    );

    try {
      // Step 1: Validate event exists
      this.logger.debug(
        `[BULK_INVITE] Step 1: Fetching event ${dto.eventId}`,
      );
      const event = await this.prisma.event.findUnique({
        where: { id: dto.eventId },
      });

      if (!event) {
        this.logger.error(
          `[BULK_INVITE] Event not found - EventId: ${dto.eventId}, InviterId: ${inviterId}`,
        );
        throw new NotFoundException('Event not found');
      }

      this.logger.debug(
        `[BULK_INVITE] Event found - EventId: ${dto.eventId}, Name: ${event.name}, HostId: ${event.hostId}, Status: ${event.status}`,
      );

      // Step 2: Validate inviter is the host
      if (event.hostId !== inviterId) {
        this.logger.warn(
          `[BULK_INVITE] Unauthorized attempt - EventId: ${dto.eventId}, InviterId: ${inviterId}, HostId: ${event.hostId}`,
        );
        throw new ForbiddenException(
          'Only the event host can send invitations',
        );
      }

      // Step 3: Filter out self-invitations
      const validInviteeIds = dto.inviteeIds.filter((id) => id !== inviterId);
      this.logger.debug(
        `[BULK_INVITE] Step 3: Filtered invitees - Original: ${dto.inviteeIds.length}, Valid: ${validInviteeIds.length}, Removed: ${dto.inviteeIds.length - validInviteeIds.length}`,
      );

      if (validInviteeIds.length === 0) {
        this.logger.warn(
          `[BULK_INVITE] No valid invitees after filtering - EventId: ${dto.eventId}, InviterId: ${inviterId}`,
        );
        throw new BadRequestException('No valid invitees provided');
      }

      // Step 4: Validate that all inviteeIds exist in the database
      this.logger.debug(
        `[BULK_INVITE] Step 4: Validating user existence - InviteeIds: ${validInviteeIds.join(', ')}`,
      );
      const existingUsers = await this.prisma.user.findMany({
        where: {
          id: {
            in: validInviteeIds,
          },
        },
        select: {
          id: true,
        },
      });

      const existingUserIds = existingUsers.map((u) => u.id);
      const invalidInviteeIds = validInviteeIds.filter(
        (id) => !existingUserIds.includes(id),
      );

      if (invalidInviteeIds.length > 0) {
        this.logger.error(
          `[BULK_INVITE] Invalid invitee IDs found - EventId: ${dto.eventId}, InvalidIds: ${invalidInviteeIds.join(', ')}, ValidIds: ${validInviteeIds.join(', ')}, ExistingIds: ${existingUserIds.join(', ')}`,
        );
        throw new BadRequestException(
          `Cannot send invitations: ${invalidInviteeIds.length} user${invalidInviteeIds.length > 1 ? 's' : ''} do not exist in the database. Invalid IDs: ${invalidInviteeIds.slice(0, 5).join(', ')}${invalidInviteeIds.length > 5 ? '...' : ''}. Please refresh your saved list and try again.`,
        );
      }

      this.logger.debug(
        `[BULK_INVITE] All ${existingUserIds.length} invitees validated successfully`,
      );

      // Step 5: Check for existing invitations
      this.logger.debug(
        `[BULK_INVITE] Step 5: Checking existing invitations - EventId: ${dto.eventId}`,
      );
      const existingInvitations = await this.prisma.eventInvitation.findMany({
        where: {
          eventId: dto.eventId,
          inviteeId: {
            in: validInviteeIds,
          },
        },
        select: {
          inviteeId: true,
        },
      });

      const existingInviteeIds = existingInvitations.map((inv) => inv.inviteeId);
      const newInviteeIds = validInviteeIds.filter(
        (id) => !existingInviteeIds.includes(id),
      );

      this.logger.debug(
        `[BULK_INVITE] Invitation check complete - Total: ${validInviteeIds.length}, AlreadyInvited: ${existingInviteeIds.length}, New: ${newInviteeIds.length}`,
      );

      if (newInviteeIds.length === 0) {
        this.logger.warn(
          `[BULK_INVITE] All users already invited - EventId: ${dto.eventId}, InviterId: ${inviterId}`,
        );
        throw new ConflictException('All users are already invited');
      }

      // Step 6: Double-check validation
      const validatedNewInviteeIds = newInviteeIds.filter((id) =>
        existingUserIds.includes(id),
      );

      if (validatedNewInviteeIds.length !== newInviteeIds.length) {
        const invalid = newInviteeIds.filter(
          (id) => !existingUserIds.includes(id),
        );
        this.logger.error(
          `[BULK_INVITE] Validation mismatch detected - EventId: ${dto.eventId}, InvalidIds: ${invalid.join(', ')}, NewInviteeIds: ${newInviteeIds.join(', ')}, ValidatedIds: ${validatedNewInviteeIds.join(', ')}`,
        );
        throw new BadRequestException(
          `Some selected users are invalid. Please refresh your saved list and try again.`,
        );
      }

      // Step 7: Create invitations in transaction
      this.logger.debug(
        `[BULK_INVITE] Step 7: Creating ${validatedNewInviteeIds.length} invitations in transaction - EventId: ${dto.eventId}`,
      );
      const invitations = await this.prisma.$transaction(async (tx) => {
        try {
          // Create invitations - use validated IDs only
          const createdInvitations = await Promise.all(
            validatedNewInviteeIds.map((inviteeId) =>
              tx.eventInvitation.create({
                data: {
                  eventId: dto.eventId,
                  inviterId,
                  inviteeId,
                  personalMessage: dto.personalMessage,
                },
                include: {
                  invitee: {
                    select: {
                      id: true,
                      fullName: true,
                      avatarUrl: true,
                    },
                  },
                },
              }),
            ),
          );

          this.logger.debug(
            `[BULK_INVITE] Created ${createdInvitations.length} invitations successfully`,
          );

          // Update event status from draft to active if this is the first invitation
          if (event.status === 'draft') {
            this.logger.log(
              `[BULK_INVITE] Updating event status from draft to active - EventId: ${dto.eventId}`,
            );
            await tx.event.update({
              where: { id: dto.eventId },
              data: { status: 'active' },
            });
          }

          return createdInvitations;
        } catch (txError: any) {
          this.logger.error(
            `[BULK_INVITE] Transaction error - EventId: ${dto.eventId}, Error: ${txError.message}, Stack: ${txError.stack}`,
          );
          throw txError;
        }
      });

      const result = {
        message: `Successfully sent ${invitations.length} invitations`,
        invitations,
        skipped: existingInviteeIds.length,
      };

      this.logger.log(
        `[BULK_INVITE] Successfully completed - EventId: ${dto.eventId}, InviterId: ${inviterId}, Created: ${invitations.length}, Skipped: ${existingInviteeIds.length}`,
      );

      return result;
    } catch (error: any) {
      // Log the error with full context
      this.logger.error(
        `[BULK_INVITE] Error occurred - EventId: ${dto.eventId}, InviterId: ${inviterId}, ErrorType: ${error.constructor.name}, ErrorMessage: ${error.message}`,
      );
      this.logger.error(
        `[BULK_INVITE] Error stack trace: ${error.stack}`,
      );
      this.logger.error(
        `[BULK_INVITE] Request details - InviteeIds: ${dto.inviteeIds?.join(', ') || 'none'}, HasPersonalMessage: ${!!dto.personalMessage}`,
      );

      // Re-throw the error so it's properly handled by NestJS exception filters
      throw error;
    }
  }

  async findMyInvitations(userId: string, status?: string) {
    const where: any = {
      inviteeId: userId,
    };

    if (status) {
      where.status = status;
    }

    return this.prisma.eventInvitation.findMany({
      where,
      include: {
        event: {
          include: {
            host: {
              select: {
                id: true,
                fullName: true,
                avatarUrl: true,
                collegeName: true,
              },
            },
            category: true,
            _count: {
              select: {
                attendees: true,
              },
            },
          },
        },
        inviter: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findEventInvitations(eventId: string, userId: string) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    if (event.hostId !== userId) {
      throw new ForbiddenException(
        'Only the event host can view all invitations',
      );
    }

    return this.prisma.eventInvitation.findMany({
      where: { eventId },
      include: {
        invitee: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
            collegeName: true,
            major: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async updateStatus(id: string, userId: string, dto: UpdateInvitationDto) {
    const invitation = await this.prisma.eventInvitation.findUnique({
      where: { id },
      include: {
        event: true,
      },
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    if (invitation.inviteeId !== userId) {
      throw new ForbiddenException(
        'You can only update your own invitations',
      );
    }

    const updatedInvitation = await this.prisma.eventInvitation.update({
      where: { id },
      data: { status: dto.status },
      include: {
        event: {
          include: {
            host: {
              select: {
                id: true,
                fullName: true,
                avatarUrl: true,
              },
            },
            category: true,
          },
        },
      },
    });

    if (dto.status === 'going') {
      const existingAttendance = await this.prisma.eventAttendee.findUnique({
        where: {
          eventId_userId: {
            eventId: invitation.eventId,
            userId,
          },
        },
      });

      if (!existingAttendance) {
        await this.prisma.eventAttendee.create({
          data: {
            eventId: invitation.eventId,
            userId,
          },
        });
      }
    }

    return updatedInvitation;
  }

  async delete(id: string, userId: string) {
    const invitation = await this.prisma.eventInvitation.findUnique({
      where: { id },
      include: {
        event: true,
      },
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    if (
      invitation.inviterId !== userId &&
      invitation.event.hostId !== userId
    ) {
      throw new ForbiddenException(
        'Only the inviter or event host can delete this invitation',
      );
    }

    await this.prisma.eventInvitation.delete({
      where: { id },
    });

    return { message: 'Invitation deleted successfully' };
  }
}
