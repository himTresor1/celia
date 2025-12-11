import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FriendsService } from '../friends/friends.service';

interface RecommendationFilters {
  gender?: string;
  collegeId?: string;
  minAge?: number;
  maxAge?: number;
  minScore?: number;
  maxScore?: number;
  interests?: string[];
  hasMutualFriends?: boolean;
}

@Injectable()
export class RecommendationsService {
  constructor(
    private prisma: PrismaService,
    private friendsService: FriendsService,
  ) {}

  async getSmartSuggestions(
    userId: string,
    filters?: RecommendationFilters,
    limit = 50,
  ): Promise<any[]> {
    const currentUser = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        collegeId: true,
        interests: true,
        attractivenessScore: true,
        gender: true,
      },
    });

    if (!currentUser) return [];

    const where: any = {
      id: { not: userId },
      profileCompleted: true,
    };

    if (filters?.gender) {
      where.gender = filters.gender;
    }

    if (filters?.collegeId) {
      where.collegeId = filters.collegeId;
    }

    if (filters?.minAge || filters?.maxAge) {
      where.age = {};
      if (filters.minAge) where.age.gte = filters.minAge;
      if (filters.maxAge) where.age.lte = filters.maxAge;
    }

    if (filters?.minScore !== undefined) {
      where.attractivenessScore = { gte: filters.minScore };
    }

    if (filters?.maxScore !== undefined) {
      where.attractivenessScore = {
        ...where.attractivenessScore,
        lte: filters.maxScore,
      };
    }

    if (filters?.interests && filters.interests.length > 0) {
      where.interests = { hasSome: filters.interests };
    }

    const candidates = await this.prisma.user.findMany({
      where,
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
        preferredLocations: true,
        lastActiveDate: true,
      },
      take: 200,
    });

    const scored = await Promise.all(
      candidates.map(async (candidate) => {
        const recommendationScore = await this.calculateRecommendationScore(
          currentUser,
          candidate,
          userId,
        );

        return {
          ...candidate,
          recommendationScore,
        };
      }),
    );

    let filtered = scored;

    if (filters?.hasMutualFriends) {
      filtered = scored.filter((c) => c.recommendationScore >= 10);
    }

    return filtered
      .sort((a, b) => b.recommendationScore - a.recommendationScore)
      .slice(0, limit);
  }

  private async calculateRecommendationScore(
    currentUser: any,
    targetUser: any,
    currentUserId: string,
  ): Promise<number> {
    let score = 0;

    if (currentUser.collegeId === targetUser.collegeId && currentUser.collegeId) {
      score += 30;
    }

    const mutualFriends = await this.friendsService.getMutualFriends(
      currentUserId,
      targetUser.id,
    );
    score += Math.min(40, mutualFriends.length * 10);

    const sharedInterests = currentUser.interests.filter((i: string) =>
      targetUser.interests.includes(i),
    );
    score += Math.min(25, sharedInterests.length * 5);

    const scoreDiff = Math.abs(
      currentUser.attractivenessScore - targetUser.attractivenessScore,
    );
    if (scoreDiff <= 10) {
      score += 15;
    }

    if (targetUser.lastActiveDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const lastActive = new Date(targetUser.lastActiveDate);
      lastActive.setHours(0, 0, 0, 0);

      if (lastActive.getTime() === today.getTime()) {
        score += 10;
      }
    }

    if (currentUser.gender && targetUser.gender) {
      score += 10;
    }

    return score;
  }

  async getFilteredUsers(
    userId: string,
    filters: RecommendationFilters,
    page = 1,
    limit = 50,
  ): Promise<any> {
    const skip = (page - 1) * limit;

    const where: any = {
      id: { not: userId },
      profileCompleted: true,
    };

    if (filters.gender) {
      where.gender = filters.gender;
    }

    if (filters.collegeId) {
      where.collegeId = filters.collegeId;
    }

    if (filters.minAge || filters.maxAge) {
      where.age = {};
      if (filters.minAge) where.age.gte = filters.minAge;
      if (filters.maxAge) where.age.lte = filters.maxAge;
    }

    if (filters.minScore !== undefined) {
      where.attractivenessScore = { gte: filters.minScore };
    }

    if (filters.maxScore !== undefined) {
      where.attractivenessScore = {
        ...where.attractivenessScore,
        lte: filters.maxScore,
      };
    }

    if (filters.interests && filters.interests.length > 0) {
      where.interests = { hasSome: filters.interests };
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: {
          id: true,
          fullName: true,
          avatarUrl: true,
          photoUrls: true,
          collegeName: true,
          interests: true,
          attractivenessScore: true,
          gender: true,
          age: true,
          bio: true,
        },
        orderBy: { attractivenessScore: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      users,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  }
}
