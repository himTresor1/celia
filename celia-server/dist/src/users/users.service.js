"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const scoring_service_1 = require("../scoring/scoring.service");
let UsersService = class UsersService {
    constructor(prisma, scoring) {
        this.prisma = prisma;
        this.scoring = scoring;
    }
    async findAll(search, interests, college) {
        const where = {};
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
    async findOne(id) {
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
            throw new common_1.NotFoundException('User not found');
        }
        const friendsCount = user._count.friendships1 + user._count.friendships2;
        return {
            ...user,
            friendsCount,
            rating: this.scoring.displayRating(user.attractivenessScore),
        };
    }
    async update(id, currentUserId, dto) {
        if (id !== currentUserId) {
            throw new common_1.ForbiddenException('You can only update your own profile');
        }
        const user = await this.prisma.user.findUnique({
            where: { id },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const updatedData = {
            ...dto,
        };
        const finalFullName = dto.fullName ?? user.fullName;
        const finalBio = dto.bio ?? user.bio;
        const finalCollegeName = dto.collegeName ?? user.collegeName;
        const finalInterests = dto.interests ?? user.interests;
        const finalPhotoUrls = dto.photoUrls ?? user.photoUrls;
        const finalPreferredCityIds = dto.preferredCityIds ?? user.preferredCityIds;
        const finalPreferredLocations = dto.preferredLocations ?? user.preferredLocations;
        const hasPreferredLocations = (Array.isArray(finalPreferredCityIds) && finalPreferredCityIds.length >= 1) ||
            (Array.isArray(finalPreferredLocations) && finalPreferredLocations.length >= 1);
        const isProfileComplete = finalFullName &&
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
        if (dto.profileCompleted !== undefined) {
            updatedData.profileCompleted = dto.profileCompleted;
        }
        else if (isProfileComplete) {
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
    async getUserStats(userId) {
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
            throw new common_1.NotFoundException('User not found');
        }
        const [hostedEvents, attendedEvents, receivedInvitations, sentInvitations] = await Promise.all([
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
    async getUserEvents(userId, type = 'hosted') {
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
        }
        else {
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
    async updatePushToken(userId, pushToken) {
        return this.prisma.user.update({
            where: { id: userId },
            data: { pushToken },
        });
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        scoring_service_1.ScoringService])
], UsersService);
//# sourceMappingURL=users.service.js.map