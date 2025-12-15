import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { ScoringService } from '../scoring/scoring.service';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private scoring: ScoringService,
  ) {}

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
        age: true,
        gender: true,
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
        attractivenessScore: true,
        createdAt: true,
      },
      orderBy: {
        attractivenessScore: 'desc',
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
        dateOfBirth: true,
        age: true,
        gender: true,
        collegeName: true,
        collegeId: true,
        major: true,
        graduationYear: true,
        bio: true,
        avatarUrl: true,
        photoUrls: true,
        interests: true,
        preferredLocations: true,
        collegeVerified: true,
        profileCompleted: true,
        attractivenessScore: true,
        engagementPoints: true,
        socialStreakDays: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            hostedEvents: true,
            eventAttendances: true,
            receivedInvitations: true,
            friendships1: { where: { status: 'active' } },
            friendships2: { where: { status: 'active' } },
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const friendsCount = user._count.friendships1 + user._count.friendships2;

    return {
      ...user,
      friendsCount,
      rating: this.scoring.displayRating(user.attractivenessScore),
    };
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

    // Merge existing data with updates
    const updatedData = {
      ...dto,
    };

    // Automatically determine profile completion based on required fields
    // Required fields: fullName, bio (min 50 chars), collegeName, interests (min 3), photoUrls (min 1), preferredLocations (min 1)
    const finalFullName = dto.fullName ?? user.fullName;
    const finalBio = dto.bio ?? user.bio;
    const finalCollegeName = dto.collegeName ?? user.collegeName;
    const finalInterests = dto.interests ?? user.interests;
    const finalPhotoUrls = dto.photoUrls ?? (user.photoUrls as any[]);
    const finalPreferredLocations = dto.preferredLocations ?? user.preferredLocations;

    const isProfileComplete =
      finalFullName &&
      finalFullName.length > 0 &&
      finalBio &&
      finalBio.length >= 50 &&
      finalCollegeName &&
      finalCollegeName.length > 0 &&
      Array.isArray(finalInterests) &&
      finalInterests.length >= 3 &&
      Array.isArray(finalPhotoUrls) &&
      finalPhotoUrls.length >= 1 &&
      Array.isArray(finalPreferredLocations) &&
      finalPreferredLocations.length >= 1;

    // Only update profileCompleted if explicitly set, or if we can determine it's complete
    if (dto.profileCompleted !== undefined) {
      updatedData.profileCompleted = dto.profileCompleted;
    } else if (isProfileComplete) {
      updatedData.profileCompleted = true;
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: updatedData,
      select: {
        id: true,
        email: true,
        fullName: true,
        dateOfBirth: true,
        age: true,
        gender: true,
        collegeName: true,
        collegeId: true,
        major: true,
        graduationYear: true,
        bio: true,
        avatarUrl: true,
        photoUrls: true,
        interests: true,
        preferredLocations: true,
        collegeVerified: true,
        profileCompleted: true,
        attractivenessScore: true,
        engagementPoints: true,
        socialStreakDays: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    await this.scoring.logEngagement(id, 'profile_update', 10);

    return updatedUser;
  }

  async getUserStats(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        attractivenessScore: true,
        engagementPoints: true,
        socialStreakDays: true,
        _count: {
          select: {
            friendships1: { where: { status: 'active' } },
            friendships2: { where: { status: 'active' } },
          },
        },
      },
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

    const friendsCount = user._count.friendships1 + user._count.friendships2;

    return {
      hostedEvents,
      attendedEvents,
      receivedInvitations,
      sentInvitations,
      friendsCount,
      attractivenessScore: user.attractivenessScore,
      rating: this.scoring.displayRating(user.attractivenessScore),
      engagementPoints: user.engagementPoints,
      socialStreakDays: user.socialStreakDays,
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
