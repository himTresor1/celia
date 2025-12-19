import { PrismaService } from '../prisma/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
export declare class EventsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(userId: string, dto: CreateEventDto): Promise<{
        category: {
            id: string;
            createdAt: Date;
            name: string;
            icon: string | null;
        };
        host: {
            id: string;
            fullName: string;
            collegeName: string;
            avatarUrl: string;
        };
    } & {
        id: string;
        photoUrls: import("@prisma/client/runtime/library").JsonValue;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        hostId: string;
        categoryId: string | null;
        locationName: string | null;
        locationLat: number | null;
        locationLng: number | null;
        exactLocation: string | null;
        eventDate: Date | null;
        startTime: Date | null;
        endTime: Date | null;
        interestTags: string[];
        capacityLimit: number | null;
        isPublic: boolean;
        status: string;
        cancellationReason: string | null;
        externalLink: string | null;
        externalLinkType: string | null;
    }>;
    findAll(userId: string, status?: string, categoryId?: string, search?: string): Promise<({
        category: {
            id: string;
            createdAt: Date;
            name: string;
            icon: string | null;
        };
        _count: {
            invitations: number;
            attendees: number;
        };
        host: {
            id: string;
            fullName: string;
            collegeName: string;
            avatarUrl: string;
        };
        invitations: {
            id: string;
            status: string;
            inviteeId: string;
            personalMessage: string;
            invitee: {
                id: string;
                fullName: string;
                collegeName: string;
                major: string;
                avatarUrl: string;
            };
        }[];
        attendees: {
            id: string;
            user: {
                id: string;
                fullName: string;
                collegeName: string;
                major: string;
                avatarUrl: string;
            };
            userId: string;
            joinedAt: Date;
        }[];
    } & {
        id: string;
        photoUrls: import("@prisma/client/runtime/library").JsonValue;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        hostId: string;
        categoryId: string | null;
        locationName: string | null;
        locationLat: number | null;
        locationLng: number | null;
        exactLocation: string | null;
        eventDate: Date | null;
        startTime: Date | null;
        endTime: Date | null;
        interestTags: string[];
        capacityLimit: number | null;
        isPublic: boolean;
        status: string;
        cancellationReason: string | null;
        externalLink: string | null;
        externalLinkType: string | null;
    })[]>;
    getMyEvents(userId: string, status?: string): Promise<{
        stats: {
            going: number;
            pending: number;
            declined: number;
            total: number;
        };
        category: {
            id: string;
            createdAt: Date;
            name: string;
            icon: string | null;
        };
        host: {
            id: string;
            fullName: string;
            collegeName: string;
            avatarUrl: string;
        };
        invitations: {
            id: string;
            status: string;
            invitee: {
                id: string;
                fullName: string;
                photoUrls: import("@prisma/client/runtime/library").JsonValue;
            };
        }[];
        id: string;
        photoUrls: import("@prisma/client/runtime/library").JsonValue;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        hostId: string;
        categoryId: string | null;
        locationName: string | null;
        locationLat: number | null;
        locationLng: number | null;
        exactLocation: string | null;
        eventDate: Date | null;
        startTime: Date | null;
        endTime: Date | null;
        interestTags: string[];
        capacityLimit: number | null;
        isPublic: boolean;
        status: string;
        cancellationReason: string | null;
        externalLink: string | null;
        externalLinkType: string | null;
    }[]>;
    findOne(id: string, userId: string): Promise<{
        category: {
            id: string;
            createdAt: Date;
            name: string;
            icon: string | null;
        };
        _count: {
            invitations: number;
            attendees: number;
        };
        host: {
            id: string;
            email: string;
            fullName: string;
            collegeName: string;
            major: string;
            avatarUrl: string;
        };
        invitations: {
            id: string;
            status: string;
            inviteeId: string;
            personalMessage: string;
            invitee: {
                id: string;
                fullName: string;
                collegeName: string;
                major: string;
                avatarUrl: string;
            };
        }[];
        attendees: ({
            user: {
                id: string;
                fullName: string;
                collegeName: string;
                avatarUrl: string;
            };
        } & {
            id: string;
            userId: string;
            eventId: string;
            joinedAt: Date;
        })[];
    } & {
        id: string;
        photoUrls: import("@prisma/client/runtime/library").JsonValue;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        hostId: string;
        categoryId: string | null;
        locationName: string | null;
        locationLat: number | null;
        locationLng: number | null;
        exactLocation: string | null;
        eventDate: Date | null;
        startTime: Date | null;
        endTime: Date | null;
        interestTags: string[];
        capacityLimit: number | null;
        isPublic: boolean;
        status: string;
        cancellationReason: string | null;
        externalLink: string | null;
        externalLinkType: string | null;
    }>;
    update(id: string, userId: string, dto: UpdateEventDto): Promise<{
        category: {
            id: string;
            createdAt: Date;
            name: string;
            icon: string | null;
        };
        host: {
            id: string;
            fullName: string;
            avatarUrl: string;
        };
    } & {
        id: string;
        photoUrls: import("@prisma/client/runtime/library").JsonValue;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        hostId: string;
        categoryId: string | null;
        locationName: string | null;
        locationLat: number | null;
        locationLng: number | null;
        exactLocation: string | null;
        eventDate: Date | null;
        startTime: Date | null;
        endTime: Date | null;
        interestTags: string[];
        capacityLimit: number | null;
        isPublic: boolean;
        status: string;
        cancellationReason: string | null;
        externalLink: string | null;
        externalLinkType: string | null;
    }>;
    delete(id: string, userId: string): Promise<{
        message: string;
    }>;
    joinEvent(eventId: string, userId: string): Promise<{
        event: {
            host: {
                id: string;
                fullName: string;
                avatarUrl: string;
            };
        } & {
            id: string;
            photoUrls: import("@prisma/client/runtime/library").JsonValue;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            description: string | null;
            hostId: string;
            categoryId: string | null;
            locationName: string | null;
            locationLat: number | null;
            locationLng: number | null;
            exactLocation: string | null;
            eventDate: Date | null;
            startTime: Date | null;
            endTime: Date | null;
            interestTags: string[];
            capacityLimit: number | null;
            isPublic: boolean;
            status: string;
            cancellationReason: string | null;
            externalLink: string | null;
            externalLinkType: string | null;
        };
        user: {
            id: string;
            fullName: string;
            avatarUrl: string;
        };
    } & {
        id: string;
        userId: string;
        eventId: string;
        joinedAt: Date;
    }>;
    leaveEvent(eventId: string, userId: string): Promise<{
        message: string;
    }>;
    getEventAttendees(eventId: string, userId: string): Promise<({
        user: {
            id: string;
            fullName: string;
            collegeName: string;
            major: string;
            avatarUrl: string;
        };
    } & {
        id: string;
        userId: string;
        eventId: string;
        joinedAt: Date;
    })[]>;
}
