import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateInvitationDto,
  BulkInviteDto,
} from './dto/create-invitation.dto';
import { UpdateInvitationDto } from './dto/update-invitation.dto';

@Injectable()
export class InvitationsService {
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

    return this.prisma.eventInvitation.create({
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
  }

  async bulkCreate(inviterId: string, dto: BulkInviteDto) {
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

    const validInviteeIds = dto.inviteeIds.filter((id) => id !== inviterId);

    if (validInviteeIds.length === 0) {
      throw new BadRequestException('No valid invitees provided');
    }

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

    if (newInviteeIds.length === 0) {
      throw new ConflictException('All users are already invited');
    }

    const invitations = await this.prisma.$transaction(
      newInviteeIds.map((inviteeId) =>
        this.prisma.eventInvitation.create({
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

    return {
      message: `Successfully sent ${invitations.length} invitations`,
      invitations,
      skipped: existingInviteeIds.length,
    };
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
