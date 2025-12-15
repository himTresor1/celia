import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
export declare class EventsController {
    private eventsService;
    constructor(eventsService: EventsService);
    create(user: any, dto: CreateEventDto): Promise<{
        host: {
            id: string;
            fullName: string;
            collegeName: string;
            avatarUrl: string;
        };
        category: {
            id: string;
            name: string;
            createdAt: Date;
            icon: string | null;
        };
    } & {
        id: string;
        name: string;
        description: string | null;
        locationName: string | null;
        locationLat: number | null;
        locationLng: number | null;
        eventDate: Date | null;
        startTime: Date | null;
        endTime: Date | null;
        photoUrls: import("@prisma/client/runtime/library").JsonValue;
        interestTags: string[];
        capacityLimit: number | null;
        isPublic: boolean;
        status: string;
        cancellationReason: string | null;
        externalLink: string | null;
        externalLinkType: string | null;
        createdAt: Date;
        updatedAt: Date;
        hostId: string;
        categoryId: string | null;
    }>;
    getMyEvents(user: any, status?: string): Promise<{
        stats: {
            going: number;
            pending: number;
            declined: number;
            total: number;
        };
        host: {
            id: string;
            fullName: string;
            collegeName: string;
            avatarUrl: string;
        };
        category: {
            id: string;
            name: string;
            createdAt: Date;
            icon: string | null;
        };
        invitations: {
            id: string;
            status: string;
            invitee: {
                id: string;
                photoUrls: import("@prisma/client/runtime/library").JsonValue;
                fullName: string;
            };
        }[];
        id: string;
        name: string;
        description: string | null;
        locationName: string | null;
        locationLat: number | null;
        locationLng: number | null;
        eventDate: Date | null;
        startTime: Date | null;
        endTime: Date | null;
        photoUrls: import("@prisma/client/runtime/library").JsonValue;
        interestTags: string[];
        capacityLimit: number | null;
        isPublic: boolean;
        status: string;
        cancellationReason: string | null;
        externalLink: string | null;
        externalLinkType: string | null;
        createdAt: Date;
        updatedAt: Date;
        hostId: string;
        categoryId: string | null;
    }[]>;
    findAll(user: any, status?: string, categoryId?: string, search?: string): Promise<({
        host: {
            id: string;
            fullName: string;
            collegeName: string;
            avatarUrl: string;
        };
        category: {
            id: string;
            name: string;
            createdAt: Date;
            icon: string | null;
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
        _count: {
            invitations: number;
            attendees: number;
        };
    } & {
        id: string;
        name: string;
        description: string | null;
        locationName: string | null;
        locationLat: number | null;
        locationLng: number | null;
        eventDate: Date | null;
        startTime: Date | null;
        endTime: Date | null;
        photoUrls: import("@prisma/client/runtime/library").JsonValue;
        interestTags: string[];
        capacityLimit: number | null;
        isPublic: boolean;
        status: string;
        cancellationReason: string | null;
        externalLink: string | null;
        externalLinkType: string | null;
        createdAt: Date;
        updatedAt: Date;
        hostId: string;
        categoryId: string | null;
    })[]>;
    findOne(id: string, user: any): Promise<{
        host: {
            id: string;
            email: string;
            fullName: string;
            collegeName: string;
            major: string;
            avatarUrl: string;
        };
        category: {
            id: string;
            name: string;
            createdAt: Date;
            icon: string | null;
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
            eventId: string;
            userId: string;
            joinedAt: Date;
        })[];
        _count: {
            invitations: number;
            attendees: number;
        };
    } & {
        id: string;
        name: string;
        description: string | null;
        locationName: string | null;
        locationLat: number | null;
        locationLng: number | null;
        eventDate: Date | null;
        startTime: Date | null;
        endTime: Date | null;
        photoUrls: import("@prisma/client/runtime/library").JsonValue;
        interestTags: string[];
        capacityLimit: number | null;
        isPublic: boolean;
        status: string;
        cancellationReason: string | null;
        externalLink: string | null;
        externalLinkType: string | null;
        createdAt: Date;
        updatedAt: Date;
        hostId: string;
        categoryId: string | null;
    }>;
    update(id: string, user: any, dto: UpdateEventDto): Promise<{
        host: {
            id: string;
            fullName: string;
            avatarUrl: string;
        };
        category: {
            id: string;
            name: string;
            createdAt: Date;
            icon: string | null;
        };
    } & {
        id: string;
        name: string;
        description: string | null;
        locationName: string | null;
        locationLat: number | null;
        locationLng: number | null;
        eventDate: Date | null;
        startTime: Date | null;
        endTime: Date | null;
        photoUrls: import("@prisma/client/runtime/library").JsonValue;
        interestTags: string[];
        capacityLimit: number | null;
        isPublic: boolean;
        status: string;
        cancellationReason: string | null;
        externalLink: string | null;
        externalLinkType: string | null;
        createdAt: Date;
        updatedAt: Date;
        hostId: string;
        categoryId: string | null;
    }>;
    delete(id: string, user: any): Promise<{
        message: string;
    }>;
    joinEvent(id: string, user: any): Promise<{
        event: {
            host: {
                id: string;
                fullName: string;
                avatarUrl: string;
            };
        } & {
            id: string;
            name: string;
            description: string | null;
            locationName: string | null;
            locationLat: number | null;
            locationLng: number | null;
            eventDate: Date | null;
            startTime: Date | null;
            endTime: Date | null;
            photoUrls: import("@prisma/client/runtime/library").JsonValue;
            interestTags: string[];
            capacityLimit: number | null;
            isPublic: boolean;
            status: string;
            cancellationReason: string | null;
            externalLink: string | null;
            externalLinkType: string | null;
            createdAt: Date;
            updatedAt: Date;
            hostId: string;
            categoryId: string | null;
        };
        user: {
            id: string;
            fullName: string;
            avatarUrl: string;
        };
    } & {
        id: string;
        eventId: string;
        userId: string;
        joinedAt: Date;
    }>;
    leaveEvent(id: string, user: any): Promise<{
        message: string;
    }>;
    getAttendees(id: string, user: any): Promise<({
        user: {
            id: string;
            fullName: string;
            collegeName: string;
            major: string;
            avatarUrl: string;
        };
    } & {
        id: string;
        eventId: string;
        userId: string;
        joinedAt: Date;
    })[]>;
}
