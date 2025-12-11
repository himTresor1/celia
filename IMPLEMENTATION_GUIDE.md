# CELIA - Complete Implementation Guide

## Overview

This guide provides step-by-step instructions and code templates for implementing all enhancements to the CELIA platform.

---

## 📋 Prerequisites

### 1. Apply Database Migrations

**For Supabase (Frontend)**:
```bash
cd celia-client
# Run the enhanced migration
supabase migration up
```

**For NestJS Backend**:
```bash
cd celia-server
# Replace schema.prisma with schema-enhanced.prisma
cp prisma/schema-enhanced.prisma prisma/schema.prisma
# Generate Prisma client
npx prisma generate
# Push to database
npx prisma db push
```

---

## 🎯 PART 1: Backend Implementation (NestJS)

### 1.1 Scoring Service

Create `src/scoring/scoring.service.ts`:

```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface AttractivenessWeights {
  profileCompleteness: number;
  friendsCount: number;
  eventsAttended: number;
  invitationRatio: number;
  engagementPoints: number;
  socialStreak: number;
}

@Injectable()
export class ScoringService {
  constructor(private prisma: PrismaService) {}

  private readonly WEIGHTS: AttractivenessWeights = {
    profileCompleteness: 25,
    friendsCount: 20,
    eventsAttended: 15,
    invitationRatio: 15,
    engagementPoints: 15,
    socialStreak: 10,
  };

  async calculateAttractivenessScore(userId: string): Promise<number> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        _count: {
          select: {
            friendships1: { where: { status: 'active' } },
            friendships2: { where: { status: 'active' } },
            eventAttendances: true,
            receivedInvitations: true,
          },
        },
      },
    });

    if (!user) return 0;

    let score = 0;

    // 1. Profile Completeness (0-25)
    const fields = [
      user.fullName,
      user.bio && user.bio.length >= 50,
      user.collegeName,
      user.major,
      user.interests.length >= 3,
      (user.photoUrls as any[]).length >= 1,
      user.preferredLocations.length >= 1,
    ];
    const completedFields = fields.filter(Boolean).length;
    score += (completedFields / fields.length) * this.WEIGHTS.profileCompleteness;

    // 2. Friends Count (0-20) - Logarithmic
    const friendsCount =
      user._count.friendships1 + user._count.friendships2;
    score += Math.min(
      this.WEIGHTS.friendsCount,
      Math.log10(friendsCount + 1) * 6
    );

    // 3. Events Attended (0-15)
    const eventsAttended = user._count.eventAttendances;
    score += Math.min(
      this.WEIGHTS.eventsAttended,
      Math.log10(eventsAttended + 1) * 5
    );

    // 4. Invitation Acceptance Ratio (0-15)
    const invitationsReceived = user._count.receivedInvitations;
    const invitationsAccepted = await this.prisma.eventInvitation.count({
      where: { inviteeId: userId, status: 'going' },
    });
    if (invitationsReceived > 0) {
      score +=
        (invitationsAccepted / invitationsReceived) *
        this.WEIGHTS.invitationRatio;
    }

    // 5. Engagement Points (0-15)
    score += Math.min(
      this.WEIGHTS.engagementPoints,
      (user.engagementPoints / 1000) * this.WEIGHTS.engagementPoints
    );

    // 6. Social Streak (0-10)
    score += Math.min(
      this.WEIGHTS.socialStreak,
      (user.socialStreakDays / 30) * this.WEIGHTS.socialStreak
    );

    return Math.round(score);
  }

  displayRating(score: number): number {
    if (score < 10) return 1;
    if (score < 20) return 2;
    if (score < 30) return 3;
    if (score < 40) return 4;
    if (score < 50) return 5;
    if (score < 60) return 6;
    if (score < 70) return 7;
    if (score < 80) return 8;
    if (score < 90) return 9;
    return 10;
  }

  async recalculateUserScore(userId: string): Promise<void> {
    const score = await this.calculateAttractivenessScore(userId);
    await this.prisma.user.update({
      where: { id: userId },
      data: { attractivenessScore: score },
    });
  }

  async logEngagement(
    userId: string,
    actionType: string,
    pointsEarned: number,
    metadata?: any
  ): Promise<void> {
    await this.prisma.engagementLog.create({
      data: {
        userId,
        actionType,
        pointsEarned,
        metadata,
      },
    });

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        engagementPoints: { increment: pointsEarned },
      },
    });

    await this.recalculateUserScore(userId);
  }

  async updateStreak(userId: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) return;

    const today = new Date().toISOString().split('T')[0];
    const lastActive = user.lastActiveDate?.toISOString().split('T')[0];

    if (lastActive !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      let newStreak = user.socialStreakDays;

      if (lastActive === yesterdayStr) {
        // Continue streak
        newStreak += 1;
      } else if (!lastActive || lastActive < yesterdayStr) {
        // Reset streak
        newStreak = 1;
      }

      await this.prisma.user.update({
        where: { id: userId },
        data: {
          lastActiveDate: new Date(),
          socialStreakDays: newStreak,
          appOpensCount: { increment: 1 },
        },
      });

      // Award streak bonuses
      if (newStreak === 7) {
        await this.logEngagement(userId, 'streak_7_days', 50);
      } else if (newStreak === 30) {
        await this.logEngagement(userId, 'streak_30_days', 200);
      }
    }
  }
}
```

### 1.2 Friends Service

Create `src/friends/friends.service.ts`:

```typescript
import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ScoringService } from '../scoring/scoring.service';

@Injectable()
export class FriendsService {
  constructor(
    private prisma: PrismaService,
    private scoring: ScoringService
  ) {}

  async sendEnergyPulse(
    fromUserId: string,
    toUserId: string
  ): Promise<any> {
    // Ensure canonical ordering
    const [user1Id, user2Id] = [fromUserId, toUserId].sort();

    // Check if friendship already exists
    let friendship = await this.prisma.friendship.findUnique({
      where: { user1Id_user2Id: { user1Id, user2Id } },
    });

    const now = new Date();
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours

    if (!friendship) {
      // Create new friendship request
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
      });
    } else {
      // Update existing friendship
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
      });

      // Check if both pulses sent within 24 hours
      if (
        friendship.pulseSentByUser1 &&
        friendship.pulseSentByUser2 &&
        friendship.pulseExpiresAt &&
        now <= friendship.pulseExpiresAt
      ) {
        // Activate friendship
        friendship = await this.prisma.friendship.update({
          where: { id: friendship.id },
          data: {
            status: 'active',
            completedAt: now,
          },
        });

        // Award points to both users
        await this.scoring.logEngagement(user1Id, 'friend_add', 20);
        await this.scoring.logEngagement(user2Id, 'friend_add', 20);
      }
    }

    return friendship;
  }

  async getFriends(userId: string): Promise<any[]> {
    const friendships = await this.prisma.friendship.findMany({
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
          },
        },
        user2: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
            collegeName: true,
            attractivenessScore: true,
          },
        },
      },
    });

    return friendships.map((f) => ({
      ...f,
      friend: f.user1Id === userId ? f.user2 : f.user1,
    }));
  }

  async getPendingRequests(userId: string): Promise<any[]> {
    const [user1Id, user2Id] = ['placeholder', userId].sort();

    return this.prisma.friendship.findMany({
      where: {
        OR: [
          { user1Id: userId, status: 'pending' },
          { user2Id: userId, status: 'pending' },
        ],
      },
      include: {
        user1: true,
        user2: true,
        initiator: true,
      },
    });
  }

  async removeFriend(userId: string, friendId: string): Promise<void> {
    const [user1Id, user2Id] = [userId, friendId].sort();

    await this.prisma.friendship.delete({
      where: { user1Id_user2Id: { user1Id, user2Id } },
    });
  }

  async getMutualFriends(user1Id: string, user2Id: string): Promise<string[]> {
    const user1Friends = await this.getFriendIds(user1Id);
    const user2Friends = await this.getFriendIds(user2Id);

    return user1Friends.filter((id) => user2Friends.includes(id));
  }

  private async getFriendIds(userId: string): Promise<string[]> {
    const friendships = await this.prisma.friendship.findMany({
      where: {
        OR: [{ user1Id: userId }, { user2Id: userId }],
        status: 'active',
      },
    });

    return friendships.map((f) =>
      f.user1Id === userId ? f.user2Id : f.user1Id
    );
  }
}
```

### 1.3 Lists Service

Create `src/lists/lists.service.ts`:

```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ListsService {
  constructor(private prisma: PrismaService) {}

  // SAVED LIST
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
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.savedUser.count({ where: { userId } }),
    ]);

    return { items, total, page, limit, pages: Math.ceil(total / limit) };
  }

  async addToSaved(
    userId: string,
    savedUserId: string,
    context?: string
  ): Promise<any> {
    return this.prisma.savedUser.create({
      data: {
        userId,
        savedUserId,
        savedFromContext: context,
      },
    });
  }

  async removeFromSaved(userId: string, savedUserId: string): Promise<void> {
    await this.prisma.savedUser.delete({
      where: { userId_savedUserId: { userId, savedUserId } },
    });
  }

  // INVITEES LIST
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
            },
          },
        },
        orderBy: { lastInvitedAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.userInvitee.count({ where: { userId } }),
    ]);

    return { items, total, page, limit, pages: Math.ceil(total / limit) };
  }

  // BULK INVITE
  async bulkInvite(
    hostId: string,
    eventId: string,
    userIds: string[]
  ): Promise<any> {
    const invitations = await Promise.all(
      userIds.map((inviteeId) =>
        this.prisma.eventInvitation.create({
          data: {
            eventId,
            inviterId: hostId,
            inviteeId,
          },
        })
      )
    );

    return { created: invitations.length, invitations };
  }
}
```

### 1.4 Recommendation Service

Create `src/recommendations/recommendations.service.ts`:

```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FriendsService } from '../friends/friends.service';

@Injectable()
export class RecommendationsService {
  constructor(
    private prisma: PrismaService,
    private friendsService: FriendsService
  ) {}

  async getSmartSuggestions(
    userId: string,
    filters?: any,
    limit = 50
  ): Promise<any[]> {
    const currentUser = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!currentUser) return [];

    // Build where clause based on filters
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

    if (filters?.minScore) {
      where.attractivenessScore = { gte: filters.minScore };
    }

    if (filters?.interests && filters.interests.length > 0) {
      where.interests = { hasSome: filters.interests };
    }

    // Get candidates
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
      },
      take: 200, // Get more than needed for scoring
    });

    // Score each candidate
    const scored = await Promise.all(
      candidates.map(async (candidate) => ({
        ...candidate,
        recommendationScore: await this.calculateRecommendationScore(
          currentUser,
          candidate
        ),
      }))
    );

    // Sort by score and return top N
    return scored.sort((a, b) => b.recommendationScore - a.recommendationScore).slice(0, limit);
  }

  private async calculateRecommendationScore(
    currentUser: any,
    targetUser: any
  ): Promise<number> {
    let score = 0;

    // Same college: +30
    if (currentUser.collegeId === targetUser.collegeId) {
      score += 30;
    }

    // Mutual friends: +10 per friend (max 40)
    const mutualFriends = await this.friendsService.getMutualFriends(
      currentUser.id,
      targetUser.id
    );
    score += Math.min(40, mutualFriends.length * 10);

    // Shared interests: +5 per interest (max 25)
    const sharedInterests = currentUser.interests.filter((i: string) =>
      targetUser.interests.includes(i)
    );
    score += Math.min(25, sharedInterests.length * 5);

    // Similar attractiveness: +15 if within 10 points
    const scoreDiff = Math.abs(
      currentUser.attractivenessScore - targetUser.attractivenessScore
    );
    if (scoreDiff <= 10) {
      score += 15;
    }

    // Recently active: +10 if active today
    const today = new Date().toISOString().split('T')[0];
    if (
      targetUser.lastActiveDate &&
      targetUser.lastActiveDate.toISOString().split('T')[0] === today
    ) {
      score += 10;
    }

    return score;
  }
}
```

### 1.5 Create Controllers and DTOs

**DTOs** (`src/users/dto/update-user.dto.ts`):
```typescript
import { IsOptional, IsString, IsInt, Min, Max, IsArray, IsDate, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  fullName?: string;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  dateOfBirth?: Date;

  @IsOptional()
  @IsEnum(['male', 'female', 'non-binary', 'prefer-not-to-say'])
  gender?: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsArray()
  interests?: string[];

  @IsOptional()
  @IsArray()
  photoUrls?: string[];

  @IsOptional()
  @IsArray()
  preferredLocations?: string[];
}

export class UserFiltersDto {
  @IsOptional()
  @IsInt()
  @Min(18)
  minAge?: number;

  @IsOptional()
  @IsInt()
  @Max(100)
  maxAge?: number;

  @IsOptional()
  @IsEnum(['male', 'female', 'non-binary', 'prefer-not-to-say'])
  gender?: string;

  @IsOptional()
  @IsString()
  collegeId?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  minScore?: number;

  @IsOptional()
  @IsArray()
  interests?: string[];
}
```

**Controllers** - Add endpoints to existing controllers or create new ones following the same pattern.

---

## 🎨 PART 2: Frontend Implementation (React Native)

### 2.1 Supabase Client Service

Create `lib/supabaseService.ts`:

```typescript
import { supabase } from './supabase';

export const supabaseService = {
  // SCORING
  async recalculateScore(userId: string) {
    const { data, error } = await supabase.rpc('calculate_attractiveness_score', {
      user_profile_id: userId,
    });
    if (error) throw error;
    return data;
  },

  async logEngagement(userId: string, actionType: string, points: number) {
    const { error } = await supabase.rpc('log_engagement', {
      p_user_id: userId,
      p_action_type: actionType,
      p_points_earned: points,
    });
    if (error) throw error;
  },

  async updateStreak(userId: string) {
    const { error } = await supabase.rpc('update_user_streak', {
      p_user_id: userId,
    });
    if (error) throw error;
  },

  // FRIENDS
  async sendEnergyPulse(fromUserId: string, toUserId: string) {
    const [user1Id, user2Id] = [fromUserId, toUserId].sort();
    const now = new Date().toISOString();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    // Check existing friendship
    const { data: existing } = await supabase
      .from('friendships')
      .select('*')
      .eq('user1_id', user1Id)
      .eq('user2_id', user2Id)
      .maybeSingle();

    if (!existing) {
      // Create new
      const { data, error } = await supabase
        .from('friendships')
        .insert({
          user1_id: user1Id,
          user2_id: user2Id,
          initiated_by: fromUserId,
          connection_method: 'energy_pulse',
          pulse_expires_at: expiresAt,
          [fromUserId === user1Id ? 'pulse_sent_by_user1' : 'pulse_sent_by_user2']: now,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } else {
      // Update existing
      const { data, error } = await supabase
        .from('friendships')
        .update({
          pulse_expires_at: expiresAt,
          [fromUserId === user1Id ? 'pulse_sent_by_user1' : 'pulse_sent_by_user2']: now,
        })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    }
  },

  async getFriends(userId: string) {
    const { data, error } = await supabase
      .from('friendships')
      .select(`
        *,
        user1:profiles!friendships_user1_id_fkey(id, full_name, avatar_url, college_name, attractiveness_score),
        user2:profiles!friendships_user2_id_fkey(id, full_name, avatar_url, college_name, attractiveness_score)
      `)
      .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
      .eq('status', 'active');

    if (error) throw error;

    return data?.map((f) => ({
      ...f,
      friend: f.user1_id === userId ? f.user2 : f.user1,
    }));
  },

  // SAVED LIST
  async getSavedUsers(userId: string) {
    const { data, error } = await supabase
      .from('saved_users')
      .select(`
        *,
        saved_user:profiles!saved_users_saved_user_id_fkey(id, full_name, avatar_url, college_name, interests, attractiveness_score)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async addToSaved(userId: string, savedUserId: string, context?: string) {
    const { data, error } = await supabase
      .from('saved_users')
      .insert({
        user_id: userId,
        saved_user_id: savedUserId,
        saved_from_context: context,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async removeFromSaved(userId: string, savedUserId: string) {
    const { error } = await supabase
      .from('saved_users')
      .delete()
      .eq('user_id', userId)
      .eq('saved_user_id', savedUserId);

    if (error) throw error;
  },

  // INVITEES LIST
  async getInvitees(userId: string) {
    const { data, error } = await supabase
      .from('user_invitees')
      .select(`
        *,
        invitee:profiles!user_invitees_invitee_id_fkey(id, full_name, avatar_url, college_name, interests, attractiveness_score)
      `)
      .eq('user_id', userId)
      .order('last_invited_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // SMART SUGGESTIONS
  async getSmartSuggestions(userId: string, filters?: any) {
    const query = supabase
      .from('profiles')
      .select('*')
      .neq('id', userId)
      .eq('is_profile_completed', true);

    if (filters?.gender) {
      query.eq('gender', filters.gender);
    }

    if (filters?.minAge) {
      query.gte('age', filters.minAge);
    }

    if (filters?.maxAge) {
      query.lte('age', filters.maxAge);
    }

    if (filters?.minScore) {
      query.gte('attractiveness_score', filters.minScore);
    }

    if (filters?.collegeId) {
      query.eq('college_id', filters.collegeId);
    }

    const { data, error } = await query.limit(100);

    if (error) throw error;
    return data;
  },
};
```

### 2.2 Updated Screens

**Profile Screen with Lists** (`app/(tabs)/profile.tsx` - additions):

```typescript
// Add to existing profile screen

const [stats, setStats] = useState({
  friendsCount: 0,
  eventsCreated: 0,
  invitationsReceived: 0,
});

useEffect(() => {
  loadStats();
}, []);

const loadStats = async () => {
  if (!user) return;

  const [friends, events, invitations] = await Promise.all([
    supabaseService.getFriends(user.id),
    supabase.from('events').select('id').eq('host_id', user.id),
    supabase.from('event_invitations').select('id').eq('invitee_id', user.id),
  ]);

  setStats({
    friendsCount: friends?.length || 0,
    eventsCreated: events.data?.length || 0,
    invitationsReceived: invitations.data?.length || 0,
  });
};

// Add to JSX:
<View style={styles.metricsSection}>
  <View style={styles.metricCard}>
    <Text style={styles.metricNumber}>{stats.eventsCreated}</Text>
    <Text style={styles.metricLabel}>Events Created</Text>
  </View>
  <View style={styles.metricCard}>
    <Text style={styles.metricNumber}>{stats.invitationsReceived}</Text>
    <Text style={styles.metricLabel}>Invitations Received</Text>
  </View>
  <View style={styles.metricCard}>
    <Text style={styles.metricNumber}>{stats.friendsCount}</Text>
    <Text style={styles.metricLabel}>Friends</Text>
  </View>
</View>

<View style={styles.attractivenessCard}>
  <Text style={styles.attractivenessLabel}>Attractiveness Rating</Text>
  <Text style={styles.attractivenessScore}>
    {displayRating(profile?.attractiveness_score || 0)}/10
  </Text>
  <Text style={styles.streakText}>
    🔥 {profile?.social_streak_days || 0} day streak
  </Text>
</View>

<TouchableOpacity
  style={styles.listsButton}
  onPress={() => router.push('/profile/lists')}
>
  <Text style={styles.listsButtonText}>My Lists</Text>
  <ChevronRight size={20} />
</TouchableOpacity>
```

**Lists Overview Screen** (`app/profile/lists.tsx` - new):

```typescript
export default function MyListsScreen() {
  const { user } = useAuth();
  const [savedCount, setSavedCount] = useState(0);
  const [friendsCount, setFriendsCount] = useState(0);
  const [inviteesCount, setInviteesCount] = useState(0);

  useEffect(() => {
    loadCounts();
  }, []);

  const loadCounts = async () => {
    if (!user) return;

    const [saved, friends, invitees] = await Promise.all([
      supabaseService.getSavedUsers(user.id),
      supabaseService.getFriends(user.id),
      supabaseService.getInvitees(user.id),
    ]);

    setSavedCount(saved?.length || 0);
    setFriendsCount(friends?.length || 0);
    setInviteesCount(invitees?.length || 0);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Lists</Text>

      <TouchableOpacity
        style={styles.listCard}
        onPress={() => router.push('/profile/saved')}
      >
        <Heart size={32} color="#3AFF6E" />
        <View style={styles.listInfo}>
          <Text style={styles.listName}>Saved List</Text>
          <Text style={styles.listCount}>{savedCount} people</Text>
        </View>
        <ChevronRight size={24} />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.listCard}
        onPress={() => router.push('/profile/friends')}
      >
        <Users size={32} color="#007AFF" />
        <View style={styles.listInfo}>
          <Text style={styles.listName}>Friends</Text>
          <Text style={styles.listCount}>{friendsCount} friends</Text>
        </View>
        <ChevronRight size={24} />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.listCard}
        onPress={() => router.push('/profile/invitees')}
      >
        <Mail size={32} color="#FF9500" />
        <View style={styles.listInfo}>
          <Text style={styles.listName}>Invitees</Text>
          <Text style={styles.listCount}>{inviteesCount} people</Text>
        </View>
        <ChevronRight size={24} />
      </TouchableOpacity>
    </View>
  );
}
```

**Energy Pulse Screen** (`app/profile/send-pulse/[userId].tsx` - new):

```typescript
export default function SendPulseScreen() {
  const { userId } = useLocalSearchParams();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleSendPulse = async () => {
    if (!user) return;

    setLoading(true);
    try {
      await supabaseService.sendEnergyPulse(user.id, userId as string);
      await supabaseService.logEngagement(user.id, 'energy_pulse_send', 3);

      Alert.alert(
        'Energy Pulse Sent! ⚡',
        'They have 24 hours to send one back to become friends!'
      );
      router.back();
    } catch (error) {
      Alert.alert('Error', 'Failed to send energy pulse');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Animated.View style={styles.pulseAnimation}>
        {/* Animated pulse circles */}
      </Animated.View>

      <Text style={styles.title}>Send Energy Pulse</Text>
      <Text style={styles.description}>
        Send an energy pulse to connect! They'll have 24 hours to send one back.
      </Text>

      <TouchableOpacity
        style={styles.sendButton}
        onPress={handleSendPulse}
        disabled={loading}
      >
        <Text style={styles.sendButtonText}>
          {loading ? 'Sending...' : 'Send Pulse ⚡'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
```

---

## 🔧 PART 3: Integration & Testing

### 3.1 Environment Variables

Update `.env` files:

```bash
# Backend
DATABASE_URL="postgresql://..."
JWT_SECRET="your-secret-key"

# Frontend
EXPO_PUBLIC_SUPABASE_URL="https://..."
EXPO_PUBLIC_SUPABASE_ANON_KEY="..."
```

### 3.2 Testing Checklist

- [ ] User registration creates profile with default gamification values
- [ ] Opening app updates streak and awards points
- [ ] Profile updates recalculate attractiveness score
- [ ] Energy Pulse flow works end-to-end
- [ ] Saved list persists across sessions
- [ ] Invitees list tracks invitation history
- [ ] Smart suggestions return relevant users
- [ ] Bulk invite sends to multiple users
- [ ] Advanced filters work correctly
- [ ] External event links save and display
- [ ] RLS policies prevent unauthorized access

---

## 🚀 PART 4: Deployment

### 4.1 Backend Deployment

1. Apply Prisma migrations:
```bash
npx prisma migrate deploy
```

2. Deploy to hosting platform (Railway/Heroku/AWS)

3. Set environment variables in production

4. Enable CORS for frontend domain

### 4.2 Frontend Deployment

1. Apply Supabase migration:
```bash
supabase db push
```

2. Build iOS/Android:
```bash
eas build --platform ios
eas build --platform android
```

3. Submit to app stores

---

## 📚 Additional Resources

- **Scoring Algorithm**: See `SYSTEM_ARCHITECTURE.md` for detailed scoring logic
- **Database Schema**: See `DATABASE_ERD.md` for complete ERD
- **API Documentation**: Generate using Swagger/OpenAPI from NestJS controllers
- **Testing Guide**: Create integration tests for all new endpoints

---

This implementation guide provides complete code templates for all major features. Follow the structure, adapt to your specific needs, and ensure thorough testing before deployment.
