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
exports.EventsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let EventsService = class EventsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(userId, dto) {
        let eventDate;
        if (dto.eventDate) {
            const dateStr = dto.eventDate;
            if (dateStr.includes('T')) {
                eventDate = new Date(dateStr);
            }
            else {
                eventDate = new Date(`${dateStr}T00:00:00.000Z`);
            }
            if (eventDate < new Date()) {
                throw new common_1.BadRequestException('Event date cannot be in the past');
            }
        }
        return this.prisma.event.create({
            data: {
                ...dto,
                eventDate: eventDate,
                photoUrls: dto.photoUrls || [],
                hostId: userId,
            },
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
            },
        });
    }
    async findAll(userId, status, categoryId, search) {
        const where = {
            OR: [
                { isPublic: true },
                { hostId: userId },
                {
                    invitations: {
                        some: {
                            inviteeId: userId,
                        },
                    },
                },
            ],
        };
        if (status) {
            where.status = status;
        }
        if (categoryId) {
            where.categoryId = categoryId;
        }
        if (search) {
            where.AND = [
                {
                    OR: [
                        { name: { contains: search, mode: 'insensitive' } },
                        { description: { contains: search, mode: 'insensitive' } },
                        { locationName: { contains: search, mode: 'insensitive' } },
                    ],
                },
            ];
        }
        return this.prisma.event.findMany({
            where,
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
                attendees: {
                    select: {
                        id: true,
                        userId: true,
                        joinedAt: true,
                        user: {
                            select: {
                                id: true,
                                fullName: true,
                                avatarUrl: true,
                                collegeName: true,
                                major: true,
                            },
                        },
                    },
                },
                invitations: {
                    select: {
                        id: true,
                        status: true,
                        personalMessage: true,
                        inviteeId: true,
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
                },
                _count: {
                    select: {
                        attendees: true,
                        invitations: true,
                    },
                },
            },
            orderBy: [{ eventDate: 'asc' }, { startTime: 'asc' }],
        });
    }
    async getMyEvents(userId, status) {
        const where = {
            hostId: userId,
        };
        if (status) {
            where.status = status;
        }
        const events = await this.prisma.event.findMany({
            where,
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
                invitations: {
                    select: {
                        id: true,
                        status: true,
                        invitee: {
                            select: {
                                id: true,
                                fullName: true,
                                photoUrls: true,
                            },
                        },
                    },
                },
            },
            orderBy: [{ eventDate: 'asc' }, { startTime: 'asc' }],
        });
        return events.map((event) => {
            const going = event.invitations.filter((inv) => inv.status === 'accepted').length;
            const pending = event.invitations.filter((inv) => inv.status === 'pending').length;
            const declined = event.invitations.filter((inv) => inv.status === 'rejected').length;
            return {
                ...event,
                stats: {
                    going,
                    pending,
                    declined,
                    total: event.invitations.length,
                },
            };
        });
    }
    async findOne(id, userId) {
        const event = await this.prisma.event.findUnique({
            where: { id },
            include: {
                host: {
                    select: {
                        id: true,
                        fullName: true,
                        avatarUrl: true,
                        email: true,
                        collegeName: true,
                        major: true,
                    },
                },
                category: true,
                attendees: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                fullName: true,
                                avatarUrl: true,
                                collegeName: true,
                            },
                        },
                    },
                },
                invitations: {
                    select: {
                        id: true,
                        status: true,
                        inviteeId: true,
                        personalMessage: true,
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
                },
                _count: {
                    select: {
                        invitations: true,
                        attendees: true,
                    },
                },
            },
        });
        if (!event) {
            throw new common_1.NotFoundException('Event not found');
        }
        const isHost = event.hostId === userId;
        const isInvited = event.invitations.some((invitation) => invitation.inviteeId === userId);
        const hasAccess = event.isPublic || isHost || isInvited;
        if (!hasAccess) {
            throw new common_1.ForbiddenException('You do not have access to this event');
        }
        return event;
    }
    async update(id, userId, dto) {
        const event = await this.prisma.event.findUnique({
            where: { id },
        });
        if (!event) {
            throw new common_1.NotFoundException('Event not found');
        }
        if (event.hostId !== userId) {
            throw new common_1.ForbiddenException('Only the host can update this event');
        }
        if (dto.status === 'cancelled' && !dto.cancellationReason) {
            throw new common_1.BadRequestException('Cancellation reason is required when cancelling an event');
        }
        const updateData = { ...dto };
        if (dto.eventDate) {
            const dateStr = dto.eventDate;
            if (dateStr.includes('T')) {
                updateData.eventDate = new Date(dateStr);
            }
            else {
                updateData.eventDate = new Date(`${dateStr}T00:00:00.000Z`);
            }
        }
        return this.prisma.event.update({
            where: { id },
            data: updateData,
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
        });
    }
    async delete(id, userId) {
        const event = await this.prisma.event.findUnique({
            where: { id },
        });
        if (!event) {
            throw new common_1.NotFoundException('Event not found');
        }
        if (event.hostId !== userId) {
            throw new common_1.ForbiddenException('Only the host can delete this event');
        }
        await this.prisma.event.delete({
            where: { id },
        });
        return { message: 'Event deleted successfully' };
    }
    async joinEvent(eventId, userId) {
        const event = await this.prisma.event.findUnique({
            where: { id: eventId },
            include: {
                attendees: true,
                invitations: {
                    where: {
                        inviteeId: userId,
                    },
                },
            },
        });
        if (!event) {
            throw new common_1.NotFoundException('Event not found');
        }
        if (!event.isPublic && event.invitations.length === 0) {
            throw new common_1.ForbiddenException('You must be invited to join this private event');
        }
        if (event.capacityLimit &&
            event.attendees.length >= event.capacityLimit) {
            throw new common_1.BadRequestException('Event has reached capacity');
        }
        const existingAttendance = await this.prisma.eventAttendee.findUnique({
            where: {
                eventId_userId: {
                    eventId,
                    userId,
                },
            },
        });
        if (existingAttendance) {
            throw new common_1.BadRequestException('You are already attending this event');
        }
        return this.prisma.eventAttendee.create({
            data: {
                eventId,
                userId,
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
                    },
                },
                user: {
                    select: {
                        id: true,
                        fullName: true,
                        avatarUrl: true,
                    },
                },
            },
        });
    }
    async leaveEvent(eventId, userId) {
        const event = await this.prisma.event.findUnique({
            where: { id: eventId },
        });
        if (!event) {
            throw new common_1.NotFoundException('Event not found');
        }
        if (event.hostId === userId) {
            throw new common_1.BadRequestException('Event host cannot leave their own event');
        }
        const attendance = await this.prisma.eventAttendee.findUnique({
            where: {
                eventId_userId: {
                    eventId,
                    userId,
                },
            },
        });
        if (!attendance) {
            throw new common_1.NotFoundException('You are not attending this event');
        }
        await this.prisma.eventAttendee.delete({
            where: {
                eventId_userId: {
                    eventId,
                    userId,
                },
            },
        });
        return { message: 'Successfully left the event' };
    }
    async getEventAttendees(eventId, userId) {
        const event = await this.prisma.event.findUnique({
            where: { id: eventId },
        });
        if (!event) {
            throw new common_1.NotFoundException('Event not found');
        }
        const hasAccess = event.isPublic ||
            event.hostId === userId ||
            (await this.prisma.eventInvitation.findFirst({
                where: {
                    eventId,
                    inviteeId: userId,
                },
            }));
        if (!hasAccess) {
            throw new common_1.ForbiddenException('You do not have access to this event');
        }
        return this.prisma.eventAttendee.findMany({
            where: { eventId },
            include: {
                user: {
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
                joinedAt: 'asc',
            },
        });
    }
};
exports.EventsService = EventsService;
exports.EventsService = EventsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], EventsService);
//# sourceMappingURL=events.service.js.map