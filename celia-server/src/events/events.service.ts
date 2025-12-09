import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateEventDto) {
    if (dto.eventDate) {
      const date = new Date(dto.eventDate);
      if (date < new Date()) {
        throw new BadRequestException('Event date cannot be in the past');
      }
    }

    return this.prisma.event.create({
      data: {
        ...dto,
        photoUrls: dto.photoUrls || [],
        hostId: userId,
      },
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
      },
    });
  }

  async findAll(
    userId: string,
    status?: string,
    categoryId?: string,
    search?: string,
  ) {
    const where: any = {
      OR: [
        { isPublic: true },
        { hostId: userId },
        {
          invitations: {
            some: {
              inviteeId: userId,
            },
          },
        },
      ],
    };

    if (status) {
      where.status = status;
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (search) {
      where.AND = [
        {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
            { locationName: { contains: search, mode: 'insensitive' } },
          ],
        },
      ];
    }

    return this.prisma.event.findMany({
      where,
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
            invitations: true,
          },
        },
      },
      orderBy: [{ eventDate: 'asc' }, { startTime: 'asc' }],
    });
  }

  async findOne(id: string, userId: string) {
    const event = await this.prisma.event.findUnique({
      where: { id },
      include: {
        host: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
            email: true,
            collegeName: true,
            major: true,
          },
        },
        category: true,
        attendees: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                avatarUrl: true,
                collegeName: true,
              },
            },
          },
        },
        invitations: {
          where: {
            inviteeId: userId,
          },
          select: {
            id: true,
            status: true,
            personalMessage: true,
          },
        },
        _count: {
          select: {
            invitations: true,
            attendees: true,
          },
        },
      },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    const hasAccess =
      event.isPublic ||
      event.hostId === userId ||
      event.invitations.length > 0;

    if (!hasAccess) {
      throw new ForbiddenException('You do not have access to this event');
    }

    return event;
  }

  async update(id: string, userId: string, dto: UpdateEventDto) {
    const event = await this.prisma.event.findUnique({
      where: { id },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    if (event.hostId !== userId) {
      throw new ForbiddenException('Only the host can update this event');
    }

    if (dto.status === 'cancelled' && !dto.cancellationReason) {
      throw new BadRequestException(
        'Cancellation reason is required when cancelling an event',
      );
    }

    return this.prisma.event.update({
      where: { id },
      data: dto,
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
    });
  }

  async delete(id: string, userId: string) {
    const event = await this.prisma.event.findUnique({
      where: { id },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    if (event.hostId !== userId) {
      throw new ForbiddenException('Only the host can delete this event');
    }

    await this.prisma.event.delete({
      where: { id },
    });

    return { message: 'Event deleted successfully' };
  }

  async joinEvent(eventId: string, userId: string) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      include: {
        attendees: true,
        invitations: {
          where: {
            inviteeId: userId,
          },
        },
      },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    if (!event.isPublic && event.invitations.length === 0) {
      throw new ForbiddenException(
        'You must be invited to join this private event',
      );
    }

    if (
      event.capacityLimit &&
      event.attendees.length >= event.capacityLimit
    ) {
      throw new BadRequestException('Event has reached capacity');
    }

    const existingAttendance = await this.prisma.eventAttendee.findUnique({
      where: {
        eventId_userId: {
          eventId,
          userId,
        },
      },
    });

    if (existingAttendance) {
      throw new BadRequestException('You are already attending this event');
    }

    return this.prisma.eventAttendee.create({
      data: {
        eventId,
        userId,
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
          },
        },
        user: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
          },
        },
      },
    });
  }

  async leaveEvent(eventId: string, userId: string) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    if (event.hostId === userId) {
      throw new BadRequestException('Event host cannot leave their own event');
    }

    const attendance = await this.prisma.eventAttendee.findUnique({
      where: {
        eventId_userId: {
          eventId,
          userId,
        },
      },
    });

    if (!attendance) {
      throw new NotFoundException('You are not attending this event');
    }

    await this.prisma.eventAttendee.delete({
      where: {
        eventId_userId: {
          eventId,
          userId,
        },
      },
    });

    return { message: 'Successfully left the event' };
  }

  async getEventAttendees(eventId: string, userId: string) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    const hasAccess =
      event.isPublic ||
      event.hostId === userId ||
      (await this.prisma.eventInvitation.findFirst({
        where: {
          eventId,
          inviteeId: userId,
        },
      }));

    if (!hasAccess) {
      throw new ForbiddenException('You do not have access to this event');
    }

    return this.prisma.eventAttendee.findMany({
      where: { eventId },
      include: {
        user: {
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
        joinedAt: 'asc',
      },
    });
  }
}
