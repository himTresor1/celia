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
exports.FriendsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const scoring_service_1 = require("../scoring/scoring.service");
let FriendsService = class FriendsService {
    constructor(prisma, scoring) {
        this.prisma = prisma;
        this.scoring = scoring;
    }
    async sendEnergyPulse(fromUserId, toUserId) {
        if (fromUserId === toUserId) {
            throw new common_1.BadRequestException('Cannot send energy pulse to yourself');
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
        }
        else {
            const updateData = {
                pulseExpiresAt: expiresAt,
            };
            if (fromUserId === user1Id) {
                updateData.pulseSentByUser1 = now;
            }
            else {
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
            if (friendship.pulseSentByUser1 &&
                friendship.pulseSentByUser2 &&
                friendship.pulseExpiresAt &&
                now <= friendship.pulseExpiresAt) {
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
    async getFriends(userId, page = 1, limit = 50) {
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
    async getPendingRequests(userId) {
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
            myPulseSent: userId === f.user1Id ? !!f.pulseSentByUser1 : !!f.pulseSentByUser2,
            theirPulseSent: userId === f.user1Id ? !!f.pulseSentByUser2 : !!f.pulseSentByUser1,
            expiresAt: f.pulseExpiresAt,
        }));
    }
    async removeFriend(userId, friendId) {
        const [user1Id, user2Id] = [userId, friendId].sort();
        const friendship = await this.prisma.friendship.findUnique({
            where: { user1Id_user2Id: { user1Id, user2Id } },
        });
        if (!friendship) {
            throw new common_1.NotFoundException('Friendship not found');
        }
        await this.prisma.friendship.delete({
            where: { user1Id_user2Id: { user1Id, user2Id } },
        });
    }
    async getMutualFriends(user1Id, user2Id) {
        const user1Friends = await this.getFriendIds(user1Id);
        const user2Friends = await this.getFriendIds(user2Id);
        return user1Friends.filter((id) => user2Friends.includes(id));
    }
    async areFriends(user1Id, user2Id) {
        const [userId1, userId2] = [user1Id, user2Id].sort();
        const friendship = await this.prisma.friendship.findUnique({
            where: {
                user1Id_user2Id: { user1Id: userId1, user2Id: userId2 },
            },
        });
        return friendship?.status === 'active';
    }
    async getFriendIds(userId) {
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
        return friendships.map((f) => f.user1Id === userId ? f.user2Id : f.user1Id);
    }
    async cleanupExpiredFriendships() {
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
};
exports.FriendsService = FriendsService;
exports.FriendsService = FriendsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        scoring_service_1.ScoringService])
], FriendsService);
//# sourceMappingURL=friends.service.js.map