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
            createdAt: Date;
            name: string;
            icon: string | null;
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
            createdAt: Date;
            name: string;
            icon: string | null;
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
    findAll(user: any, status?: string, categoryId?: string, search?: string): Promise<({
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
        category: {
            id: string;
            createdAt: Date;
            name: string;
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
    findOne(id: string, user: any): Promise<{
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
        category: {
            id: string;
            createdAt: Date;
            name: string;
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
    update(id: string, user: any, dto: UpdateEventDto): Promise<{
        host: {
            id: string;
            fullName: string;
            avatarUrl: string;
        };
        category: {
            id: string;
            createdAt: Date;
            name: string;
            icon: string | null;
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
        userId: string;
        eventId: string;
        joinedAt: Date;
    })[]>;
}
