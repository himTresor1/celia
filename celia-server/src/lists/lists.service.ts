import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ListsService {
  constructor(private prisma: PrismaService) {}

  async getSavedUsers(userId: string, page = 1, limit = 50): Promise<any> {
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.prisma.savedUser.findMany({
        where: { userId },
        include: {
          savedUser: {
            select: {
              id: true,
              fullName: true,
              avatarUrl: true,
              collegeName: true,
              interests: true,
              attractivenessScore: true,
              bio: true,
              age: true,
              gender: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.savedUser.count({ where: { userId } }),
    ]);

    return {
      items: items.map((item) => ({
        id: item.id,
        savedAt: item.createdAt,
        context: item.savedFromContext,
        notes: item.notes,
        user: item.savedUser,
      })),
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  }

  async addToSaved(
    userId: string,
    savedUserId: string,
    context?: string,
    notes?: string,
  ): Promise<any> {
    if (userId === savedUserId) {
      throw new Error('Cannot save yourself');
    }

    const saved = await this.prisma.savedUser.create({
      data: {
        userId,
        savedUserId,
        savedFromContext: context,
        notes,
      },
      include: {
        savedUser: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
            collegeName: true,
          },
        },
      },
    });

    return saved;
  }

  async removeFromSaved(userId: string, savedUserId: string): Promise<void> {
    const saved = await this.prisma.savedUser.findUnique({
      where: { userId_savedUserId: { userId, savedUserId } },
    });

    if (!saved) {
      throw new NotFoundException('Saved user not found');
    }

    await this.prisma.savedUser.delete({
      where: { userId_savedUserId: { userId, savedUserId } },
    });
  }

  async isUserSaved(userId: string, targetUserId: string): Promise<boolean> {
    const saved = await this.prisma.savedUser.findUnique({
      where: { userId_savedUserId: { userId, savedUserId: targetUserId } },
    });

    return !!saved;
  }

  async getInvitees(userId: string, page = 1, limit = 50): Promise<any> {
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.prisma.userInvitee.findMany({
        where: { userId },
        include: {
          invitee: {
            select: {
              id: true,
              fullName: true,
              avatarUrl: true,
              collegeName: true,
              interests: true,
              attractivenessScore: true,
              bio: true,
              age: true,
              gender: true,
            },
          },
        },
        orderBy: { lastInvitedAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.userInvitee.count({ where: { userId } }),
    ]);

    return {
      items: items.map((item) => ({
        id: item.id,
        firstInvitedAt: item.firstInvitedAt,
        lastInvitedAt: item.lastInvitedAt,
        totalInvitations: item.totalInvitations,
        eventsInvitedTo: item.eventsInvitedTo,
        user: item.invitee,
      })),
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  }

  async bulkInvite(
    hostId: string,
    eventId: string,
    userIds: string[],
    personalMessage?: string,
  ): Promise<any> {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    if (event.hostId !== hostId) {
      throw new Error('Only the host can send invitations');
    }

    const uniqueUserIds = [...new Set(userIds)].filter((id) => id !== hostId);

    const existingInvitations = await this.prisma.eventInvitation.findMany({
      where: {
        eventId,
        inviteeId: { in: uniqueUserIds },
      },
      select: { inviteeId: true },
    });

    const existingInviteeIds = existingInvitations.map((inv) => inv.inviteeId);
    const newInviteeIds = uniqueUserIds.filter(
      (id) => !existingInviteeIds.includes(id),
    );

    const invitations = await Promise.all(
      newInviteeIds.map((inviteeId) =>
        this.prisma.eventInvitation.create({
          data: {
            eventId,
            inviterId: hostId,
            inviteeId,
            personalMessage,
          },
          include: {
            invitee: {
              select: {
                id: true,
                fullName: true,
                email: true,
              },
            },
          },
        }),
      ),
    );

    for (const inviteeId of newInviteeIds) {
      await this.updateInviteeHistory(hostId, inviteeId, eventId);
    }

    return {
      created: invitations.length,
      skipped: existingInviteeIds.length,
      invitations,
    };
  }

  private async updateInviteeHistory(
    userId: string,
    inviteeId: string,
    eventId: string,
  ): Promise<void> {
    const existing = await this.prisma.userInvitee.findUnique({
      where: { userId_inviteeId: { userId, inviteeId } },
    });

    if (existing) {
      await this.prisma.userInvitee.update({
        where: { userId_inviteeId: { userId, inviteeId } },
        data: {
          lastInvitedAt: new Date(),
          totalInvitations: { increment: 1 },
          eventsInvitedTo: {
            push: eventId,
          },
        },
      });
    } else {
      await this.prisma.userInvitee.create({
        data: {
          userId,
          inviteeId,
          eventsInvitedTo: [eventId],
        },
      });
    }
  }

  async searchSavedUsers(
    userId: string,
    query: string,
    page = 1,
    limit = 50,
  ): Promise<any> {
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.prisma.savedUser.findMany({
        where: {
          userId,
          savedUser: {
            OR: [
              { fullName: { contains: query, mode: 'insensitive' } },
              { collegeName: { contains: query, mode: 'insensitive' } },
            ],
          },
        },
        include: {
          savedUser: {
            select: {
              id: true,
              fullName: true,
              avatarUrl: true,
              collegeName: true,
              interests: true,
              attractivenessScore: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.savedUser.count({
        where: {
          userId,
          savedUser: {
            OR: [
              { fullName: { contains: query, mode: 'insensitive' } },
              { collegeName: { contains: query, mode: 'insensitive' } },
            ],
          },
        },
      }),
    ]);

    return {
      items: items.map((item) => ({
        id: item.id,
        savedAt: item.createdAt,
        user: item.savedUser,
      })),
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  }
}
