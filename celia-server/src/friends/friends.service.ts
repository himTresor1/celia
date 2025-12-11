import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ScoringService } from '../scoring/scoring.service';

@Injectable()
export class FriendsService {
  constructor(
    private prisma: PrismaService,
    private scoring: ScoringService,
  ) {}

  async sendEnergyPulse(fromUserId: string, toUserId: string): Promise<any> {
    if (fromUserId === toUserId) {
      throw new BadRequestException('Cannot send energy pulse to yourself');
    }

    const [user1Id, user2Id] = [fromUserId, toUserId].sort();

    let friendship = await this.prisma.friendship.findUnique({
      where: { user1Id_user2Id: { user1Id, user2Id } },
    });

    const now = new Date();
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    if (!friendship) {
      friendship = await this.prisma.friendship.create({
        data: {
          user1Id,
          user2Id,
          initiatedBy: fromUserId,
          connectionMethod: 'energy_pulse',
          status: 'pending',
          pulseExpiresAt: expiresAt,
          ...(fromUserId === user1Id
            ? { pulseSentByUser1: now }
            : { pulseSentByUser2: now }),
        },
        include: {
          user1: {
            select: {
              id: true,
              fullName: true,
              avatarUrl: true,
              collegeName: true,
            },
          },
          user2: {
            select: {
              id: true,
              fullName: true,
              avatarUrl: true,
              collegeName: true,
            },
          },
        },
      });
    } else {
      const updateData: any = {
        pulseExpiresAt: expiresAt,
      };

      if (fromUserId === user1Id) {
        updateData.pulseSentByUser1 = now;
      } else {
        updateData.pulseSentByUser2 = now;
      }

      friendship = await this.prisma.friendship.update({
        where: { id: friendship.id },
        data: updateData,
        include: {
          user1: {
            select: {
              id: true,
              fullName: true,
              avatarUrl: true,
              collegeName: true,
            },
          },
          user2: {
            select: {
              id: true,
              fullName: true,
              avatarUrl: true,
              collegeName: true,
            },
          },
        },
      });

      if (
        friendship.pulseSentByUser1 &&
        friendship.pulseSentByUser2 &&
        friendship.pulseExpiresAt &&
        now <= friendship.pulseExpiresAt
      ) {
        friendship = await this.prisma.friendship.update({
          where: { id: friendship.id },
          data: {
            status: 'active',
            completedAt: now,
          },
          include: {
            user1: {
              select: {
                id: true,
                fullName: true,
                avatarUrl: true,
                collegeName: true,
              },
            },
            user2: {
              select: {
                id: true,
                fullName: true,
                avatarUrl: true,
                collegeName: true,
              },
            },
          },
        });

        await this.scoring.logEngagement(user1Id, 'friend_add', 20);
        await this.scoring.logEngagement(user2Id, 'friend_add', 20);
      }
    }

    return friendship;
  }

  async getFriends(userId: string, page = 1, limit = 50): Promise<any> {
    const skip = (page - 1) * limit;

    const [friendships, total] = await Promise.all([
      this.prisma.friendship.findMany({
        where: {
          OR: [{ user1Id: userId }, { user2Id: userId }],
          status: 'active',
        },
        include: {
          user1: {
            select: {
              id: true,
              fullName: true,
              avatarUrl: true,
              collegeName: true,
              attractivenessScore: true,
              interests: true,
            },
          },
          user2: {
            select: {
              id: true,
              fullName: true,
              avatarUrl: true,
              collegeName: true,
              attractivenessScore: true,
              interests: true,
            },
          },
        },
        orderBy: { completedAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.friendship.count({
        where: {
          OR: [{ user1Id: userId }, { user2Id: userId }],
          status: 'active',
        },
      }),
    ]);

    const friends = friendships.map((f) => ({
      friendshipId: f.id,
      friend: f.user1Id === userId ? f.user2 : f.user1,
      connectedAt: f.completedAt,
    }));

    return {
      friends,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  }

  async getPendingRequests(userId: string): Promise<any> {
    const friendships = await this.prisma.friendship.findMany({
      where: {
        OR: [{ user1Id: userId }, { user2Id: userId }],
        status: 'pending',
      },
      include: {
        user1: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
            collegeName: true,
          },
        },
        user2: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
            collegeName: true,
          },
        },
        initiator: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
    });

    return friendships.map((f) => ({
      ...f,
      otherUser: f.user1Id === userId ? f.user2 : f.user1,
      sentByMe: f.initiatedBy === userId,
      myPulseSent:
        userId === f.user1Id ? !!f.pulseSentByUser1 : !!f.pulseSentByUser2,
      theirPulseSent:
        userId === f.user1Id ? !!f.pulseSentByUser2 : !!f.pulseSentByUser1,
      expiresAt: f.pulseExpiresAt,
    }));
  }

  async removeFriend(userId: string, friendId: string): Promise<void> {
    const [user1Id, user2Id] = [userId, friendId].sort();

    const friendship = await this.prisma.friendship.findUnique({
      where: { user1Id_user2Id: { user1Id, user2Id } },
    });

    if (!friendship) {
      throw new NotFoundException('Friendship not found');
    }

    await this.prisma.friendship.delete({
      where: { user1Id_user2Id: { user1Id, user2Id } },
    });
  }

  async getMutualFriends(user1Id: string, user2Id: string): Promise<string[]> {
    const user1Friends = await this.getFriendIds(user1Id);
    const user2Friends = await this.getFriendIds(user2Id);

    return user1Friends.filter((id) => user2Friends.includes(id));
  }

  async areFriends(user1Id: string, user2Id: string): Promise<boolean> {
    const [userId1, userId2] = [user1Id, user2Id].sort();

    const friendship = await this.prisma.friendship.findUnique({
      where: {
        user1Id_user2Id: { user1Id: userId1, user2Id: userId2 },
      },
    });

    return friendship?.status === 'active';
  }

  private async getFriendIds(userId: string): Promise<string[]> {
    const friendships = await this.prisma.friendship.findMany({
      where: {
        OR: [{ user1Id: userId }, { user2Id: userId }],
        status: 'active',
      },
      select: {
        user1Id: true,
        user2Id: true,
      },
    });

    return friendships.map((f) =>
      f.user1Id === userId ? f.user2Id : f.user1Id,
    );
  }

  async cleanupExpiredFriendships(): Promise<number> {
    const now = new Date();

    const result = await this.prisma.friendship.updateMany({
      where: {
        status: 'pending',
        pulseExpiresAt: {
          lt: now,
        },
      },
      data: {
        status: 'expired',
      },
    });

    return result.count;
  }
}
