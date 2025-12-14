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
exports.InvitationsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let InvitationsService = class InvitationsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(inviterId, dto) {
        const event = await this.prisma.event.findUnique({
            where: { id: dto.eventId },
        });
        if (!event) {
            throw new common_1.NotFoundException('Event not found');
        }
        if (event.hostId !== inviterId) {
            throw new common_1.ForbiddenException('Only the event host can send invitations');
        }
        if (dto.inviteeId === inviterId) {
            throw new common_1.BadRequestException('You cannot invite yourself');
        }
        const invitee = await this.prisma.user.findUnique({
            where: { id: dto.inviteeId },
        });
        if (!invitee) {
            throw new common_1.NotFoundException('Invitee not found');
        }
        const existing = await this.prisma.eventInvitation.findUnique({
            where: {
                eventId_inviteeId: {
                    eventId: dto.eventId,
                    inviteeId: dto.inviteeId,
                },
            },
        });
        if (existing) {
            throw new common_1.ConflictException('User already invited to this event');
        }
        const invitation = await this.prisma.$transaction(async (tx) => {
            const created = await tx.eventInvitation.create({
                data: {
                    eventId: dto.eventId,
                    inviterId,
                    inviteeId: dto.inviteeId,
                    personalMessage: dto.personalMessage,
                },
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
                        },
                    },
                    inviter: {
                        select: {
                            id: true,
                            fullName: true,
                            avatarUrl: true,
                        },
                    },
                    invitee: {
                        select: {
                            id: true,
                            fullName: true,
                            avatarUrl: true,
                        },
                    },
                },
            });
            if (event.status === 'draft') {
                await tx.event.update({
                    where: { id: dto.eventId },
                    data: { status: 'active' },
                });
            }
            return created;
        });
        return invitation;
    }
    async bulkCreate(inviterId, dto) {
        const event = await this.prisma.event.findUnique({
            where: { id: dto.eventId },
        });
        if (!event) {
            throw new common_1.NotFoundException('Event not found');
        }
        if (event.hostId !== inviterId) {
            throw new common_1.ForbiddenException('Only the event host can send invitations');
        }
        const validInviteeIds = dto.inviteeIds.filter((id) => id !== inviterId);
        if (validInviteeIds.length === 0) {
            throw new common_1.BadRequestException('No valid invitees provided');
        }
        const existingInvitations = await this.prisma.eventInvitation.findMany({
            where: {
                eventId: dto.eventId,
                inviteeId: {
                    in: validInviteeIds,
                },
            },
            select: {
                inviteeId: true,
            },
        });
        const existingInviteeIds = existingInvitations.map((inv) => inv.inviteeId);
        const newInviteeIds = validInviteeIds.filter((id) => !existingInviteeIds.includes(id));
        if (newInviteeIds.length === 0) {
            throw new common_1.ConflictException('All users are already invited');
        }
        const invitations = await this.prisma.$transaction(async (tx) => {
            const createdInvitations = await Promise.all(newInviteeIds.map((inviteeId) => tx.eventInvitation.create({
                data: {
                    eventId: dto.eventId,
                    inviterId,
                    inviteeId,
                    personalMessage: dto.personalMessage,
                },
                include: {
                    invitee: {
                        select: {
                            id: true,
                            fullName: true,
                            avatarUrl: true,
                        },
                    },
                },
            })));
            if (event.status === 'draft') {
                await tx.event.update({
                    where: { id: dto.eventId },
                    data: { status: 'active' },
                });
            }
            return createdInvitations;
        });
        return {
            message: `Successfully sent ${invitations.length} invitations`,
            invitations,
            skipped: existingInviteeIds.length,
        };
    }
    async findMyInvitations(userId, status) {
        const where = {
            inviteeId: userId,
        };
        if (status) {
            where.status = status;
        }
        return this.prisma.eventInvitation.findMany({
            where,
            include: {
                event: {
                    include: {
                        host: {
                            select: {
                                id: true,
                                fullName: true,
                                avatarUrl: true,
                                collegeName: true,
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
                inviter: {
                    select: {
                        id: true,
                        fullName: true,
                        avatarUrl: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }
    async findEventInvitations(eventId, userId) {
        const event = await this.prisma.event.findUnique({
            where: { id: eventId },
        });
        if (!event) {
            throw new common_1.NotFoundException('Event not found');
        }
        if (event.hostId !== userId) {
            throw new common_1.ForbiddenException('Only the event host can view all invitations');
        }
        return this.prisma.eventInvitation.findMany({
            where: { eventId },
            include: {
                invitee: {
                    select: {
                        id: true,
                        fullName: true,
                        avatarUrl: true,
                        collegeName: true,
                        major: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }
    async updateStatus(id, userId, dto) {
        const invitation = await this.prisma.eventInvitation.findUnique({
            where: { id },
            include: {
                event: true,
            },
        });
        if (!invitation) {
            throw new common_1.NotFoundException('Invitation not found');
        }
        if (invitation.inviteeId !== userId) {
            throw new common_1.ForbiddenException('You can only update your own invitations');
        }
        const updatedInvitation = await this.prisma.eventInvitation.update({
            where: { id },
            data: { status: dto.status },
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
                    },
                },
            },
        });
        if (dto.status === 'going') {
            const existingAttendance = await this.prisma.eventAttendee.findUnique({
                where: {
                    eventId_userId: {
                        eventId: invitation.eventId,
                        userId,
                    },
                },
            });
            if (!existingAttendance) {
                await this.prisma.eventAttendee.create({
                    data: {
                        eventId: invitation.eventId,
                        userId,
                    },
                });
            }
        }
        return updatedInvitation;
    }
    async delete(id, userId) {
        const invitation = await this.prisma.eventInvitation.findUnique({
            where: { id },
            include: {
                event: true,
            },
        });
        if (!invitation) {
            throw new common_1.NotFoundException('Invitation not found');
        }
        if (invitation.inviterId !== userId &&
            invitation.event.hostId !== userId) {
            throw new common_1.ForbiddenException('Only the inviter or event host can delete this invitation');
        }
        await this.prisma.eventInvitation.delete({
            where: { id },
        });
        return { message: 'Invitation deleted successfully' };
    }
};
exports.InvitationsService = InvitationsService;
exports.InvitationsService = InvitationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], InvitationsService);
//# sourceMappingURL=invitations.service.js.map