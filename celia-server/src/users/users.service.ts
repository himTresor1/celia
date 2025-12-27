import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { ScoringService } from '../scoring/scoring.service';
import { OtpService } from '../otp/otp.service';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private scoring: ScoringService,
    private otpService: OtpService,
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
    console.log(id, currentUserId);
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

    // Validate collegeId if provided
    if (dto.collegeId) {
      const college = await this.prisma.college.findUnique({
        where: { id: dto.collegeId },
      });
      if (!college) {
        // If college not found by ID, try to find by name if provided, or throw error
        // For now, let's just remove the invalid collegeId to prevent FK error
        // or throw a BadRequestException
        throw new BadRequestException('Invalid college ID');
      }
    } else if (dto.collegeName) {
      // If collegeName provided but no ID, try to find/link college
      const college = await this.prisma.college.findUnique({
        where: { name: dto.collegeName },
      });
      if (college) {
        updatedData.collegeId = college.id;
      }
    }

    // Automatically determine profile completion based on required fields
    // Required fields: fullName, bio (min 50 chars), collegeName, interests (min 3), photoUrls (min 1), preferredCityIds (min 1)
    const finalFullName = dto.fullName ?? user.fullName;
    const finalBio = dto.bio ?? user.bio;
    const finalCollegeName = dto.collegeName ?? user.collegeName;
    const finalInterests = dto.interests ?? user.interests;
    const finalPhotoUrls = dto.photoUrls ?? (user.photoUrls as any[]);
    const finalPreferredCityIds = dto.preferredCityIds ?? user.preferredCityIds;
    const finalPreferredLocations =
      dto.preferredLocations ?? user.preferredLocations;

    // Check completion using preferredCityIds (new) or preferredLocations (legacy)
    const hasPreferredLocations =
      (Array.isArray(finalPreferredCityIds) &&
        finalPreferredCityIds.length >= 1) ||
      (Array.isArray(finalPreferredLocations) &&
        finalPreferredLocations.length >= 1);

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
      hasPreferredLocations;

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

  async updatePushToken(userId: string, pushToken: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { pushToken },
    });
  }

  async updateLocation(userId: string, lat: number, lng: number) {
    console.log('hereeeee');
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        lastLatitude: lat,
        lastLongitude: lng,
        lastLocationAt: new Date(),
      },
    });
  }

  async sendCollegeVerificationOtp(userId: string, email: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.otpService.sendOtp(email, 'college_verification');
    return { message: 'OTP sent successfully' };
  }

  async verifyCollegeEmail(userId: string, email: string, otpCode: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verify OTP
    try {
      await this.otpService.verifyOtp(email, otpCode, 'college_verification');
    } catch (error) {
      throw new BadRequestException('Invalid or expired OTP code');
    }

    // Update user's college verification status
    await this.prisma.user.update({
      where: { id: userId },
      data: { collegeVerified: true },
    });

    return {
      message: 'College email verified successfully',
      collegeVerified: true,
    };
  }

  // ============================================================================
  // RECOMMENDATION ALGORITHM
  // ============================================================================

  async getRecommendations(userId: string, lat?: number, lng?: number) {
    // 1. Fetch Viewer Data
    const viewer = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        friendships1: { select: { user2Id: true } },
        friendships2: { select: { user1Id: true } },
        savedUsers: { select: { savedUserId: true } },
      },
    });

    if (!viewer) throw new NotFoundException('User not found');

    // Compile lists of excluded users (friends, self)
    const friendIds = [
      ...viewer.friendships1.map((f) => f.user2Id),
      ...viewer.friendships2.map((f) => f.user1Id),
    ];
    const excludedIds = new Set([userId, ...friendIds]);

    // 2. Fetch Candidates (Phase 1: Hard Filters)
    const candidates = await this.prisma.user.findMany({
      where: {
        id: { notIn: Array.from(excludedIds) },
        profileCompleted: true,
      },
      select: {
        id: true,
        fullName: true,
        // avatarUrl is often null, photoUrls is the main array
        avatarUrl: true,
        photoUrls: true,
        collegeName: true,
        major: true,
        interests: true,
        preferredLocations: true,
        attractivenessScore: true,
        engagementPoints: true,
        profileCompleteness: true,
        lastActiveDate: true,
        lastLatitude: true,
        lastLongitude: true,
        _count: {
          select: {
            friendships1: true,
            friendships2: true,
          },
        },
      },
      take: 100,
    });

    // 3. Phase 2: Scoring & Geo-Filtering
    const scoredCandidates = await Promise.all(
      candidates.map(async (candidate) => {
        // --- Geo Filter (Hard Constraint: 60km) ---
        let distance: number | null = null;
        if (lat && lng && candidate.lastLatitude && candidate.lastLongitude) {
          distance = this.calculateDistance(
            lat,
            lng,
            candidate.lastLatitude,
            candidate.lastLongitude,
          );

          if (distance - 10000 > 5000) {
            return null;
          }
        }

        // --- A. University Match (Highest Priority: 0.40) ---
        // If users are from the same university, this overrides almost everything else
        const isSameCollege =
          viewer.collegeName &&
          candidate.collegeName &&
          viewer.collegeName === candidate.collegeName;
        const collegeScore = isSameCollege ? 1 : 0;

        // --- B. Personality Similarity (0.35) ---
        // Include Major + Interests + Preferred Locations
        const viewerInterests = [
          ...(viewer.interests || []),
          viewer.major,
        ].filter(Boolean) as string[];
        const candidateInterests = [
          ...(candidate.interests || []),
          candidate.major,
        ].filter(Boolean) as string[];

        const interestScore = this.calculateJaccardSimilarity(
          viewerInterests,
          candidateInterests,
        );

        // Location Similarity
        const viewerLocations = viewer.preferredLocations || [];
        const candidateLocations = candidate.preferredLocations || [];
        const locationScore = this.calculateJaccardSimilarity(
          viewerLocations,
          candidateLocations,
        );

        // Combined Personality Score (Interests weighed slightly higher than locations)
        const personalityScore = interestScore * 0.7 + locationScore * 0.3;

        // --- C. Event Affinity (0.10) ---
        const sharedEventsCount = await this.prisma.eventAttendee.count({
          where: {
            userId: candidate.id,
            event: {
              attendees: {
                some: { userId: viewer.id },
              },
              eventDate: {
                gte: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // Last 60 days
              },
            },
          },
        });
        const eventAffinityScore = Math.min(sharedEventsCount / 3, 1);

        // --- D. Social Proximity (0.10) ---
        // Simplified mutual friend check
        const candidateFriendships = await this.prisma.friendship.findMany({
          where: {
            OR: [{ user1Id: candidate.id }, { user2Id: candidate.id }],
          },
          select: { user1Id: true, user2Id: true },
        });
        const candidateFriendIds = candidateFriendships.map((f) =>
          f.user1Id === candidate.id ? f.user2Id : f.user1Id,
        );
        const mutualFriendsCount = candidateFriendIds.filter((id) =>
          friendIds.includes(id),
        ).length;
        const socialProximityScore = Math.min(mutualFriendsCount / 5, 1);

        // --- E. Quality (0.05) ---
        const qualityScore =
          (this.normalize(candidate.attractivenessScore, 0, 100) +
            this.normalize(candidate.profileCompleteness, 0, 100)) /
          2;

        // --- Score Weights ---
        // College (0.40) -> Personality (0.35) -> Others (0.25)
        const matchScore =
          0.4 * collegeScore +
          0.35 * personalityScore +
          0.1 * eventAffinityScore +
          0.1 * socialProximityScore +
          0.05 * qualityScore;

        // --- Generate Insights ---
        const matchInsights: string[] = [];

        if (isSameCollege) {
          matchInsights.push(`You both go to ${viewer.collegeName}`);
        }

        if (
          viewer.major &&
          candidate.major &&
          viewer.major === candidate.major
        ) {
          matchInsights.push(`You both study ${viewer.major}`);
        }

        // Shared Interests
        const sharedInterests = viewerInterests.filter(
          (i) => candidateInterests.includes(i) && i !== viewer.major,
        );
        if (sharedInterests.length > 0) {
          if (sharedInterests.length === 1) {
            matchInsights.push(`You both like ${sharedInterests[0]}`);
          } else {
            matchInsights.push(
              `Shared interests: ${sharedInterests.slice(0, 2).join(', ')}`,
            );
          }
        }

        // Shared Locations
        const sharedLocations = viewerLocations.filter((l) =>
          candidateLocations.includes(l),
        );
        if (sharedLocations.length > 0) {
          matchInsights.push(`You both prefer ${sharedLocations[0]}`);
        }

        // Shared Events
        if (sharedEventsCount > 0) {
          matchInsights.push(
            `You attended ${sharedEventsCount} same event${sharedEventsCount > 1 ? 's' : ''}`,
          );
        }

        // Mutual Friends
        if (mutualFriendsCount > 0) {
          matchInsights.push(
            `${mutualFriendsCount} mutual friend${mutualFriendsCount > 1 ? 's' : ''}`,
          );
        }

        return {
          ...candidate,
          distance, // Include distance in response
          matchScore,
          matchInsights, // Return insights
          scores: {
            college: collegeScore,
            personality: personalityScore,
            eventAffinity: eventAffinityScore,
            socialProximity: socialProximityScore,
            quality: qualityScore,
          },
        };
      }),
    );

    // 4. Sort and Return (filtering out nulls from geo-filter)
    return scoredCandidates
      .filter((item) => item !== null)
      .sort((a, b) => b.matchScore - a.matchScore)
      .map(({ _count, ...user }) => user);
  }

  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 6371; // Radius of the earth in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) *
        Math.cos(this.deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return Number(d.toFixed(1));
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  private calculateJaccardSimilarity(arr1: string[], arr2: string[]): number {
    if (!arr1 || !arr2 || arr1.length === 0 || arr2.length === 0) return 0;
    const set1 = new Set(arr1);
    const set2 = new Set(arr2);
    const intersection = new Set([...set1].filter((x) => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    return intersection.size / union.size;
  }

  private normalize(value: number, min: number, max: number): number {
    return Math.max(0, Math.min(1, (value - min) / (max - min)));
  }
}
