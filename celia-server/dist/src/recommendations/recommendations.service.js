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
exports.RecommendationsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const friends_service_1 = require("../friends/friends.service");
let RecommendationsService = class RecommendationsService {
    constructor(prisma, friendsService) {
        this.prisma = prisma;
        this.friendsService = friendsService;
    }
    async getSmartSuggestions(userId, filters, limit = 50) {
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
        if (!currentUser)
            return [];
        const where = {
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
            if (filters.minAge)
                where.age.gte = filters.minAge;
            if (filters.maxAge)
                where.age.lte = filters.maxAge;
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
        const scored = await Promise.all(candidates.map(async (candidate) => {
            const recommendationScore = await this.calculateRecommendationScore(currentUser, candidate, userId);
            return {
                ...candidate,
                recommendationScore,
            };
        }));
        let filtered = scored;
        if (filters?.hasMutualFriends) {
            filtered = scored.filter((c) => c.recommendationScore >= 10);
        }
        return filtered
            .sort((a, b) => b.recommendationScore - a.recommendationScore)
            .slice(0, limit);
    }
    async calculateRecommendationScore(currentUser, targetUser, currentUserId) {
        let score = 0;
        if (currentUser.collegeId === targetUser.collegeId && currentUser.collegeId) {
            score += 30;
        }
        const mutualFriends = await this.friendsService.getMutualFriends(currentUserId, targetUser.id);
        score += Math.min(40, mutualFriends.length * 10);
        const sharedInterests = currentUser.interests.filter((i) => targetUser.interests.includes(i));
        score += Math.min(25, sharedInterests.length * 5);
        const scoreDiff = Math.abs(currentUser.attractivenessScore - targetUser.attractivenessScore);
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
    async getFilteredUsers(userId, filters, page = 1, limit = 50) {
        const skip = (page - 1) * limit;
        const where = {
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
            if (filters.minAge)
                where.age.gte = filters.minAge;
            if (filters.maxAge)
                where.age.lte = filters.maxAge;
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
};
exports.RecommendationsService = RecommendationsService;
exports.RecommendationsService = RecommendationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        friends_service_1.FriendsService])
], RecommendationsService);
//# sourceMappingURL=recommendations.service.js.map