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
exports.ScoringService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ScoringService = class ScoringService {
    constructor(prisma) {
        this.prisma = prisma;
        this.WEIGHTS = {
            profileCompleteness: 25,
            friendsCount: 20,
            eventsAttended: 15,
            invitationRatio: 15,
            engagementPoints: 15,
            socialStreak: 10,
        };
    }
    async calculateAttractivenessScore(userId) {
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
        if (!user)
            return 0;
        let score = 0;
        const fields = [
            user.fullName && user.fullName.length > 0,
            user.bio && user.bio.length >= 50,
            user.collegeName,
            user.major,
            user.interests.length >= 3,
            user.photoUrls.length >= 1,
            user.preferredLocations.length >= 1,
        ];
        const completedFields = fields.filter(Boolean).length;
        score += (completedFields / fields.length) * this.WEIGHTS.profileCompleteness;
        const friendsCount = user._count.friendships1 + user._count.friendships2;
        score += Math.min(this.WEIGHTS.friendsCount, Math.log10(friendsCount + 1) * 6);
        const eventsAttended = user._count.eventAttendances;
        score += Math.min(this.WEIGHTS.eventsAttended, Math.log10(eventsAttended + 1) * 5);
        const invitationsReceived = user._count.receivedInvitations;
        const invitationsAccepted = await this.prisma.eventInvitation.count({
            where: { inviteeId: userId, status: 'going' },
        });
        if (invitationsReceived > 0) {
            score +=
                (invitationsAccepted / invitationsReceived) *
                    this.WEIGHTS.invitationRatio;
        }
        score += Math.min(this.WEIGHTS.engagementPoints, (user.engagementPoints / 1000) * this.WEIGHTS.engagementPoints);
        score += Math.min(this.WEIGHTS.socialStreak, (user.socialStreakDays / 30) * this.WEIGHTS.socialStreak);
        return Math.round(score);
    }
    displayRating(score) {
        if (score < 10)
            return 1;
        if (score < 20)
            return 2;
        if (score < 30)
            return 3;
        if (score < 40)
            return 4;
        if (score < 50)
            return 5;
        if (score < 60)
            return 6;
        if (score < 70)
            return 7;
        if (score < 80)
            return 8;
        if (score < 90)
            return 9;
        return 10;
    }
    async recalculateUserScore(userId) {
        const score = await this.calculateAttractivenessScore(userId);
        await this.prisma.user.update({
            where: { id: userId },
            data: { attractivenessScore: score },
        });
    }
    async logEngagement(userId, actionType, pointsEarned, metadata) {
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
    async updateStreak(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user)
            return;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const lastActive = user.lastActiveDate
            ? new Date(user.lastActiveDate)
            : null;
        if (lastActive) {
            lastActive.setHours(0, 0, 0, 0);
        }
        if (!lastActive || lastActive.getTime() !== today.getTime()) {
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);
            let newStreak = user.socialStreakDays;
            if (lastActive && lastActive.getTime() === yesterday.getTime()) {
                newStreak += 1;
            }
            else if (!lastActive || lastActive.getTime() < yesterday.getTime()) {
                newStreak = 1;
            }
            await this.prisma.user.update({
                where: { id: userId },
                data: {
                    lastActiveDate: today,
                    socialStreakDays: newStreak,
                    appOpensCount: { increment: 1 },
                },
            });
            if (newStreak === 7) {
                await this.logEngagement(userId, 'streak_7_days', 50);
            }
            else if (newStreak === 30) {
                await this.logEngagement(userId, 'streak_30_days', 200);
            }
            else if (newStreak > 1) {
                await this.logEngagement(userId, 'app_open', 5);
            }
        }
    }
    async getUserEngagementStats(userId) {
        const [logs, user] = await Promise.all([
            this.prisma.engagementLog.findMany({
                where: { userId },
                orderBy: { createdAt: 'desc' },
                take: 20,
            }),
            this.prisma.user.findUnique({
                where: { id: userId },
                select: {
                    engagementPoints: true,
                    socialStreakDays: true,
                    attractivenessScore: true,
                    lastActiveDate: true,
                },
            }),
        ]);
        return {
            user,
            recentActivity: logs,
            rating: this.displayRating(user?.attractivenessScore || 0),
        };
    }
};
exports.ScoringService = ScoringService;
exports.ScoringService = ScoringService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ScoringService);
//# sourceMappingURL=scoring.service.js.map