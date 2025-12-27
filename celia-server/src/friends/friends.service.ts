import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ScoringService } from '../scoring/scoring.service';

@Injectable()
export class FriendsService {
  constructor(
    private prisma: PrismaService,
    private scoring: ScoringService,
  ) {}

  async getFriends(
    userId: string,
    page: any = 1,
    limit: any = 50,
  ): Promise<any> {
    // Ensure page is a valid number
    const pageNum = Math.max(
      1,
      typeof page === 'string' ? parseInt(page) || 1 : page,
    );
    const limitNum = Math.max(
      1,
      typeof limit === 'string' ? parseInt(limit) || 50 : limit,
    );
    const skip = (pageNum - 1) * limitNum;

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
        take: limitNum,
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
      page: pageNum,
      limit: limitNum,
      pages: Math.ceil(total / limitNum),
    };
  }

  async sendFriendRequest(
    fromUserId: string,
    toUserId: string,
    message?: string,
  ): Promise<any> {
    if (fromUserId === toUserId) {
      throw new BadRequestException('Cannot send friend request to yourself');
    }

    const [user1Id, user2Id] = [fromUserId, toUserId].sort();

    // Check if friendship already exists
    const existingFriendship = await this.prisma.friendship.findUnique({
      where: { user1Id_user2Id: { user1Id, user2Id } },
    });

    if (existingFriendship) {
      if (existingFriendship.status === 'active') {
        throw new BadRequestException('You are already friends with this user');
      }
      if (existingFriendship.status === 'pending') {
        throw new BadRequestException('Friend request already exists');
      }
    }

    // Create or update friendship
    const friendship = await this.prisma.friendship.upsert({
      where: { user1Id_user2Id: { user1Id, user2Id } },
      update: {
        status: 'pending',
        initiatedBy: fromUserId,
        requestMessage: message,
        connectionMethod: 'friend_request',
      },
      create: {
        user1Id,
        user2Id,
        status: 'pending',
        initiatedBy: fromUserId,
        requestMessage: message,
        connectionMethod: 'friend_request',
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

    return friendship;
  }

  async acceptFriendRequest(userId: string, requestId: string): Promise<any> {
    const friendship = await this.prisma.friendship.findUnique({
      where: { id: requestId },
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

    if (!friendship) {
      throw new NotFoundException('Friend request not found');
    }

    // Verify the user is the recipient
    if (friendship.user1Id !== userId && friendship.user2Id !== userId) {
      throw new BadRequestException('This friend request is not for you');
    }

    if (friendship.status !== 'pending') {
      throw new BadRequestException('Friend request is not pending');
    }

    // Update to active
    const updated = await this.prisma.friendship.update({
      where: { id: requestId },
      data: {
        status: 'active',
        completedAt: new Date(),
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

    // Award points
    await this.scoring.logEngagement(friendship.user1Id, 'friend_add', 20);
    await this.scoring.logEngagement(friendship.user2Id, 'friend_add', 20);

    return updated;
  }

  async declineFriendRequest(userId: string, requestId: string): Promise<void> {
    const friendship = await this.prisma.friendship.findUnique({
      where: { id: requestId },
    });

    if (!friendship) {
      throw new NotFoundException('Friend request not found');
    }

    // Verify the user is the recipient
    if (friendship.user1Id !== userId && friendship.user2Id !== userId) {
      throw new BadRequestException('This friend request is not for you');
    }

    if (friendship.status !== 'pending') {
      throw new BadRequestException('Friend request is not pending');
    }

    // Delete the friendship
    await this.prisma.friendship.delete({
      where: { id: requestId },
    });
  }

  async getFriendRequests(
    userId: string,
    type: 'sent' | 'received' = 'received',
  ): Promise<any> {
    const where: any = {
      status: 'pending',
    };

    if (type === 'sent') {
      where.initiatedBy = userId;
    } else {
      where.OR = [
        { user1Id: userId, initiatedBy: { not: userId } },
        { user2Id: userId, initiatedBy: { not: userId } },
      ];
    }

    const friendships = await this.prisma.friendship.findMany({
      where,
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
            avatarUrl: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return friendships.map((f) => ({
      id: f.id,
      otherUser: f.user1Id === userId ? f.user2 : f.user1,
      initiator: f.initiator,
      requestMessage: f.requestMessage,
      createdAt: f.createdAt,
      sentByMe: f.initiatedBy === userId,
    }));
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

  async getFriendSuggestions(
    userId: string,
    limit: number = 50,
  ): Promise<any[]> {
    // TEMPORARY: Return all users for testing purposes
    // TODO: Replace with proper recommendation algorithm later

    // Get current user profile
    const currentUser = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        collegeId: true,
        interests: true,
        attractivenessScore: true,
        gender: true,
        age: true,
      },
    });

    if (!currentUser) return [];

    // Get all users that the current user has any relationship with (friends or pending requests)
    const existingRelationships = await this.prisma.friendship.findMany({
      where: {
        OR: [{ user1Id: userId }, { user2Id: userId }],
      },
      select: {
        user1Id: true,
        user2Id: true,
      },
    });

    // Extract all user IDs to exclude
    const excludedUserIds = new Set<string>([userId]);
    existingRelationships.forEach((rel) => {
      excludedUserIds.add(rel.user1Id);
      excludedUserIds.add(rel.user2Id);
    });

    // TEMPORARY: Get ALL users (excluding current user and existing relationships)
    // This is for testing purposes only - will be replaced with proper recommendations
    const allUsers = await this.prisma.user.findMany({
      where: {
        id: { notIn: Array.from(excludedUserIds) },
        profileCompleted: true,
      },
      select: {
        id: true,
        fullName: true,
        avatarUrl: true,
        photoUrls: true,
        collegeName: true,
        collegeId: true,
        interests: true,
        attractivenessScore: true,
        gender: true,
        age: true,
        bio: true,
        lastActiveDate: true,
      },
      take: limit || 100, // Allow more users for testing
      orderBy: {
        createdAt: 'desc', // Show newest users first
      },
    });

    // Calculate mutual friends count for each user
    const usersWithMutualFriends = await Promise.all(
      allUsers.map(async (user) => {
        const mutualCount = await this.getMutualFriendsCount(userId, user.id);
        return {
          ...user,
          mutualFriendsCount: mutualCount,
        };
      }),
    );

    // Return all users (temporary for testing)
    return usersWithMutualFriends;
  }

  private async calculateSuggestionScore(
    currentUser: any,
    candidate: any,
    currentUserId: string,
  ): Promise<number> {
    let score = 0;

    // 1. Shared Interests (Highest Priority - as user requested)
    if (currentUser.interests && candidate.interests) {
      const sharedInterests = currentUser.interests.filter((interest: string) =>
        candidate.interests.includes(interest),
      );
      // More shared interests = higher score (up to 50 points)
      score += Math.min(50, sharedInterests.length * 10);
    }

    // 2. Same College (30 points)
    if (
      currentUser.collegeId === candidate.collegeId &&
      currentUser.collegeId
    ) {
      score += 30;
    }

    // 3. Mutual Friends (up to 40 points)
    const mutualCount = await this.getMutualFriendsCount(
      currentUserId,
      candidate.id,
    );
    score += Math.min(40, mutualCount * 8);

    // 4. Similar Attractiveness Score (15 points if within 10 points)
    if (currentUser.attractivenessScore && candidate.attractivenessScore) {
      const scoreDiff = Math.abs(
        currentUser.attractivenessScore - candidate.attractivenessScore,
      );
      if (scoreDiff <= 10) {
        score += 15;
      }
    }

    // 5. Active User (10 points if active today)
    if (candidate.lastActiveDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const lastActive = new Date(candidate.lastActiveDate);
      lastActive.setHours(0, 0, 0, 0);

      if (lastActive.getTime() === today.getTime()) {
        score += 10;
      }
    }

    // 6. Has Bio (5 points)
    if (candidate.bio && candidate.bio.trim().length > 0) {
      score += 5;
    }

    return score;
  }

  private async getMutualFriendsCount(
    userId: string,
    targetUserId: string,
  ): Promise<number> {
    const mutualFriends = await this.getMutualFriends(userId, targetUserId);
    return mutualFriends.length;
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
}
