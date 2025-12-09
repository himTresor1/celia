import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(search?: string, interests?: string[], college?: string) {
    const where: any = {};

    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { collegeName: { contains: search, mode: 'insensitive' } },
        { major: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (interests && interests.length > 0) {
      where.interests = {
        hasSome: interests,
      };
    }

    if (college) {
      where.collegeName = { contains: college, mode: 'insensitive' };
    }

    return this.prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        fullName: true,
        collegeName: true,
        major: true,
        graduationYear: true,
        bio: true,
        avatarUrl: true,
        photoUrls: true,
        interests: true,
        preferredLocations: true,
        collegeVerified: true,
        profileCompleted: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        fullName: true,
        collegeName: true,
        major: true,
        graduationYear: true,
        bio: true,
        avatarUrl: true,
        photoUrls: true,
        interests: true,
        preferredLocations: true,
        collegeVerified: true,
        profileCompleted: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            hostedEvents: true,
            eventAttendances: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async update(id: string, currentUserId: string, dto: UpdateUserDto) {
    if (id !== currentUserId) {
      throw new ForbiddenException('You can only update your own profile');
    }

    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: dto,
      select: {
        id: true,
        email: true,
        fullName: true,
        collegeName: true,
        major: true,
        graduationYear: true,
        bio: true,
        avatarUrl: true,
        photoUrls: true,
        interests: true,
        preferredLocations: true,
        collegeVerified: true,
        profileCompleted: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return updatedUser;
  }

  async getUserStats(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const [hostedEvents, attendedEvents, receivedInvitations, sentInvitations] =
      await Promise.all([
        this.prisma.event.count({
          where: { hostId: userId },
        }),
        this.prisma.eventAttendee.count({
          where: { userId },
        }),
        this.prisma.eventInvitation.count({
          where: { inviteeId: userId },
        }),
        this.prisma.eventInvitation.count({
          where: { inviterId: userId },
        }),
      ]);

    return {
      hostedEvents,
      attendedEvents,
      receivedInvitations,
      sentInvitations,
    };
  }

  async getUserEvents(userId: string, type: 'hosted' | 'attending' = 'hosted') {
    if (type === 'hosted') {
      return this.prisma.event.findMany({
        where: { hostId: userId },
        include: {
          category: true,
          _count: {
            select: {
              attendees: true,
              invitations: true,
            },
          },
        },
        orderBy: {
          eventDate: 'asc',
        },
      });
    } else {
      const attendances = await this.prisma.eventAttendee.findMany({
        where: { userId },
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
              _count: {
                select: {
                  attendees: true,
                },
              },
            },
          },
        },
        orderBy: {
          event: {
            eventDate: 'asc',
          },
        },
      });

      return attendances.map((a) => a.event);
    }
  }
}
