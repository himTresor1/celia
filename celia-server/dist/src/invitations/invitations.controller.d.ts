import { InvitationsService } from './invitations.service';
import { CreateInvitationDto, BulkInviteDto } from './dto/create-invitation.dto';
import { UpdateInvitationDto } from './dto/update-invitation.dto';
export declare class InvitationsController {
    private invitationsService;
    private readonly logger;
    constructor(invitationsService: InvitationsService);
    create(user: any, dto: CreateInvitationDto): Promise<{
        event: {
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
            status: string;
            createdAt: Date;
            updatedAt: Date;
            hostId: string;
            name: string;
            description: string | null;
            categoryId: string | null;
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
            cancellationReason: string | null;
            externalLink: string | null;
            externalLinkType: string | null;
        };
        inviter: {
            id: string;
            fullName: string;
            avatarUrl: string;
        };
        invitee: {
            id: string;
            fullName: string;
            avatarUrl: string;
        };
    } & {
        id: string;
        status: string;
        personalMessage: string | null;
        declineReason: string | null;
        respondedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        eventId: string;
        inviterId: string;
        inviteeId: string;
    }>;
    bulkCreate(user: any, dto: BulkInviteDto): Promise<{
        message: string;
        invitations: ({
            invitee: {
                id: string;
                fullName: string;
                avatarUrl: string;
            };
        } & {
            id: string;
            status: string;
            personalMessage: string | null;
            declineReason: string | null;
            respondedAt: Date | null;
            createdAt: Date;
            updatedAt: Date;
            eventId: string;
            inviterId: string;
            inviteeId: string;
        })[];
        skipped: number;
    }>;
    findMyInvitations(user: any, status?: string): Promise<({
        event: {
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
            _count: {
                attendees: number;
            };
        } & {
            id: string;
            status: string;
            createdAt: Date;
            updatedAt: Date;
            hostId: string;
            name: string;
            description: string | null;
            categoryId: string | null;
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
            cancellationReason: string | null;
            externalLink: string | null;
            externalLinkType: string | null;
        };
        inviter: {
            id: string;
            fullName: string;
            avatarUrl: string;
        };
    } & {
        id: string;
        status: string;
        personalMessage: string | null;
        declineReason: string | null;
        respondedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        eventId: string;
        inviterId: string;
        inviteeId: string;
    })[]>;
    findEventInvitations(eventId: string, user: any): Promise<({
        invitee: {
            id: string;
            fullName: string;
            collegeName: string;
            major: string;
            avatarUrl: string;
        };
    } & {
        id: string;
        status: string;
        personalMessage: string | null;
        declineReason: string | null;
        respondedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        eventId: string;
        inviterId: string;
        inviteeId: string;
    })[]>;
    updateStatus(id: string, user: any, dto: UpdateInvitationDto): Promise<{
        event: {
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
            status: string;
            createdAt: Date;
            updatedAt: Date;
            hostId: string;
            name: string;
            description: string | null;
            categoryId: string | null;
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
            cancellationReason: string | null;
            externalLink: string | null;
            externalLinkType: string | null;
        };
    } & {
        id: string;
        status: string;
        personalMessage: string | null;
        declineReason: string | null;
        respondedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        eventId: string;
        inviterId: string;
        inviteeId: string;
    }>;
    delete(id: string, user: any): Promise<{
        message: string;
    }>;
}
