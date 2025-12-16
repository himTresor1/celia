import { PrismaService } from '../prisma/prisma.service';
import { CreateInvitationDto, BulkInviteDto } from './dto/create-invitation.dto';
import { UpdateInvitationDto } from './dto/update-invitation.dto';
export declare class InvitationsService {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    create(inviterId: string, dto: CreateInvitationDto): Promise<{
        event: {
            host: {
                id: string;
                fullName: string;
                avatarUrl: string;
            };
            category: {
                id: string;
                name: string;
                icon: string | null;
                createdAt: Date;
            };
        } & {
            id: string;
            name: string;
            createdAt: Date;
            photoUrls: import("@prisma/client/runtime/library").JsonValue;
            updatedAt: Date;
            hostId: string;
            description: string | null;
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
        createdAt: Date;
        updatedAt: Date;
        status: string;
        eventId: string;
        personalMessage: string | null;
        declineReason: string | null;
        respondedAt: Date | null;
        inviterId: string;
        inviteeId: string;
    }>;
    bulkCreate(inviterId: string, dto: BulkInviteDto): Promise<{
        message: string;
        invitations: ({
            invitee: {
                id: string;
                fullName: string;
                avatarUrl: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: string;
            eventId: string;
            personalMessage: string | null;
            declineReason: string | null;
            respondedAt: Date | null;
            inviterId: string;
            inviteeId: string;
        })[];
        skipped: number;
    }>;
    findMyInvitations(userId: string, status?: string): Promise<({
        event: {
            _count: {
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
                name: string;
                icon: string | null;
                createdAt: Date;
            };
        } & {
            id: string;
            name: string;
            createdAt: Date;
            photoUrls: import("@prisma/client/runtime/library").JsonValue;
            updatedAt: Date;
            hostId: string;
            description: string | null;
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
        inviter: {
            id: string;
            fullName: string;
            avatarUrl: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        eventId: string;
        personalMessage: string | null;
        declineReason: string | null;
        respondedAt: Date | null;
        inviterId: string;
        inviteeId: string;
    })[]>;
    findEventInvitations(eventId: string, userId: string): Promise<({
        invitee: {
            id: string;
            fullName: string;
            collegeName: string;
            major: string;
            avatarUrl: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        eventId: string;
        personalMessage: string | null;
        declineReason: string | null;
        respondedAt: Date | null;
        inviterId: string;
        inviteeId: string;
    })[]>;
    updateStatus(id: string, userId: string, dto: UpdateInvitationDto): Promise<{
        event: {
            host: {
                id: string;
                fullName: string;
                avatarUrl: string;
            };
            category: {
                id: string;
                name: string;
                icon: string | null;
                createdAt: Date;
            };
        } & {
            id: string;
            name: string;
            createdAt: Date;
            photoUrls: import("@prisma/client/runtime/library").JsonValue;
            updatedAt: Date;
            hostId: string;
            description: string | null;
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
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        eventId: string;
        personalMessage: string | null;
        declineReason: string | null;
        respondedAt: Date | null;
        inviterId: string;
        inviteeId: string;
    }>;
    delete(id: string, userId: string): Promise<{
        message: string;
    }>;
}
