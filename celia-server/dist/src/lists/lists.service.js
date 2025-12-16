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
exports.ListsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ListsService = class ListsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getSavedUsers(userId, page = 1, limit = 50) {
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
                            bio: true,
                            age: true,
                            gender: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.savedUser.count({ where: { userId } }),
        ]);
        return {
            items: items.map((item) => ({
                id: item.id,
                savedAt: item.createdAt,
                context: item.savedFromContext,
                notes: item.notes,
                user: item.savedUser,
            })),
            total,
            page,
            limit,
            pages: Math.ceil(total / limit),
        };
    }
    async addToSaved(userId, savedUserId, context, notes) {
        if (!userId || userId === 'undefined' || userId === 'null' || (typeof userId === 'string' && userId.trim() === '')) {
            console.error('[ListsService] addToSaved - userId is missing or invalid!');
            console.error('[ListsService] addToSaved - userId value:', userId);
            console.error('[ListsService] addToSaved - userId type:', typeof userId);
            throw new Error('User ID is required to save a user. Please ensure you are authenticated.');
        }
        if (!savedUserId || savedUserId === 'undefined' || savedUserId === 'null' || (typeof savedUserId === 'string' && savedUserId.trim() === '')) {
            console.error('[ListsService] addToSaved - savedUserId is missing or invalid!');
            throw new Error('Saved user ID is required');
        }
        if (userId === savedUserId) {
            throw new Error('Cannot save yourself');
        }
        console.log('[ListsService] addToSaved - Creating saved user:', { userId, savedUserId, context });
        const saved = await this.prisma.savedUser.create({
            data: {
                userId,
                savedUserId,
                savedFromContext: context,
                notes,
            },
            include: {
                savedUser: {
                    select: {
                        id: true,
                        fullName: true,
                        avatarUrl: true,
                        collegeName: true,
                    },
                },
            },
        });
        return saved;
    }
    async removeFromSaved(userId, savedUserId) {
        const saved = await this.prisma.savedUser.findUnique({
            where: { userId_savedUserId: { userId, savedUserId } },
        });
        if (!saved) {
            throw new common_1.NotFoundException('Saved user not found');
        }
        await this.prisma.savedUser.delete({
            where: { userId_savedUserId: { userId, savedUserId } },
        });
    }
    async isUserSaved(userId, targetUserId) {
        const saved = await this.prisma.savedUser.findUnique({
            where: { userId_savedUserId: { userId, savedUserId: targetUserId } },
        });
        return !!saved;
    }
    async getInvitees(userId, page = 1, limit = 50) {
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
                            bio: true,
                            age: true,
                            gender: true,
                        },
                    },
                },
                orderBy: { lastInvitedAt: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.userInvitee.count({ where: { userId } }),
        ]);
        return {
            items: items.map((item) => ({
                id: item.id,
                firstInvitedAt: item.firstInvitedAt,
                lastInvitedAt: item.lastInvitedAt,
                totalInvitations: item.totalInvitations,
                eventsInvitedTo: item.eventsInvitedTo,
                user: item.invitee,
            })),
            total,
            page,
            limit,
            pages: Math.ceil(total / limit),
        };
    }
    async bulkInvite(hostId, eventId, userIds, personalMessage) {
        const event = await this.prisma.event.findUnique({
            where: { id: eventId },
        });
        if (!event) {
            throw new common_1.NotFoundException('Event not found');
        }
        if (event.hostId !== hostId) {
            throw new Error('Only the host can send invitations');
        }
        const uniqueUserIds = [...new Set(userIds)].filter((id) => id !== hostId);
        const existingInvitations = await this.prisma.eventInvitation.findMany({
            where: {
                eventId,
                inviteeId: { in: uniqueUserIds },
            },
            select: { inviteeId: true },
        });
        const existingInviteeIds = existingInvitations.map((inv) => inv.inviteeId);
        const newInviteeIds = uniqueUserIds.filter((id) => !existingInviteeIds.includes(id));
        const invitations = await Promise.all(newInviteeIds.map((inviteeId) => this.prisma.eventInvitation.create({
            data: {
                eventId,
                inviterId: hostId,
                inviteeId,
                personalMessage,
            },
            include: {
                invitee: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                    },
                },
            },
        })));
        for (const inviteeId of newInviteeIds) {
            await this.updateInviteeHistory(hostId, inviteeId, eventId);
        }
        return {
            created: invitations.length,
            skipped: existingInviteeIds.length,
            invitations,
        };
    }
    async updateInviteeHistory(userId, inviteeId, eventId) {
        const existing = await this.prisma.userInvitee.findUnique({
            where: { userId_inviteeId: { userId, inviteeId } },
        });
        if (existing) {
            await this.prisma.userInvitee.update({
                where: { userId_inviteeId: { userId, inviteeId } },
                data: {
                    lastInvitedAt: new Date(),
                    totalInvitations: { increment: 1 },
                    eventsInvitedTo: {
                        push: eventId,
                    },
                },
            });
        }
        else {
            await this.prisma.userInvitee.create({
                data: {
                    userId,
                    inviteeId,
                    eventsInvitedTo: [eventId],
                },
            });
        }
    }
    async searchSavedUsers(userId, query, page = 1, limit = 50) {
        const skip = (page - 1) * limit;
        const [items, total] = await Promise.all([
            this.prisma.savedUser.findMany({
                where: {
                    userId,
                    savedUser: {
                        OR: [
                            { fullName: { contains: query, mode: 'insensitive' } },
                            { collegeName: { contains: query, mode: 'insensitive' } },
                        ],
                    },
                },
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
            this.prisma.savedUser.count({
                where: {
                    userId,
                    savedUser: {
                        OR: [
                            { fullName: { contains: query, mode: 'insensitive' } },
                            { collegeName: { contains: query, mode: 'insensitive' } },
                        ],
                    },
                },
            }),
        ]);
        return {
            items: items.map((item) => ({
                id: item.id,
                savedAt: item.createdAt,
                user: item.savedUser,
            })),
            total,
            page,
            limit,
            pages: Math.ceil(total / limit),
        };
    }
};
exports.ListsService = ListsService;
exports.ListsService = ListsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ListsService);
//# sourceMappingURL=lists.service.js.map