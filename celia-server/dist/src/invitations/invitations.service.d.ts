import { PrismaService } from '../prisma/prisma.service';
import { CreateInvitationDto, BulkInviteDto } from './dto/create-invitation.dto';
import { UpdateInvitationDto } from './dto/update-invitation.dto';
export declare class InvitationsService {
    private prisma;
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
        inviterId: string;
        inviteeId: string;
        personalMessage: string | null;
        declineReason: string | null;
        respondedAt: Date | null;
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
            inviterId: string;
            inviteeId: string;
            personalMessage: string | null;
            declineReason: string | null;
            respondedAt: Date | null;
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
        inviterId: string;
        inviteeId: string;
        personalMessage: string | null;
        declineReason: string | null;
        respondedAt: Date | null;
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
        inviterId: string;
        inviteeId: string;
        personalMessage: string | null;
        declineReason: string | null;
        respondedAt: Date | null;
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
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        eventId: string;
        inviterId: string;
        inviteeId: string;
        personalMessage: string | null;
        declineReason: string | null;
        respondedAt: Date | null;
    }>;
    delete(id: string, userId: string): Promise<{
        message: string;
    }>;
}
