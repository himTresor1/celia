import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { ScoringService } from '../scoring/scoring.service';
export declare class UsersService {
    private prisma;
    private scoring;
    constructor(prisma: PrismaService, scoring: ScoringService);
    findAll(search?: string, interests?: string[], college?: string): Promise<{
        id: string;
        email: string;
        fullName: string;
        age: number;
        gender: string;
        collegeName: string;
        major: string;
        graduationYear: number;
        bio: string;
        avatarUrl: string;
        photoUrls: import("@prisma/client/runtime/library").JsonValue;
        interests: string[];
        collegeVerified: boolean;
        preferredLocations: string[];
        profileCompleted: boolean;
        attractivenessScore: number;
        createdAt: Date;
    }[]>;
    findOne(id: string): Promise<{
        friendsCount: number;
        rating: number;
        id: string;
        email: string;
        fullName: string;
        dateOfBirth: Date;
        age: number;
        gender: string;
        collegeName: string;
        collegeId: string;
        major: string;
        graduationYear: number;
        bio: string;
        avatarUrl: string;
        photoUrls: import("@prisma/client/runtime/library").JsonValue;
        interests: string[];
        collegeVerified: boolean;
        preferredLocations: string[];
        profileCompleted: boolean;
        attractivenessScore: number;
        engagementPoints: number;
        socialStreakDays: number;
        createdAt: Date;
        updatedAt: Date;
        _count: {
            hostedEvents: number;
            receivedInvitations: number;
            eventAttendances: number;
            friendships1: number;
            friendships2: number;
        };
    }>;
    update(id: string, currentUserId: string, dto: UpdateUserDto): Promise<{
        id: string;
        email: string;
        fullName: string;
        dateOfBirth: Date;
        age: number;
        gender: string;
        collegeName: string;
        collegeId: string;
        major: string;
        graduationYear: number;
        bio: string;
        avatarUrl: string;
        photoUrls: import("@prisma/client/runtime/library").JsonValue;
        interests: string[];
        collegeVerified: boolean;
        preferredLocations: string[];
        profileCompleted: boolean;
        attractivenessScore: number;
        engagementPoints: number;
        socialStreakDays: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getUserStats(userId: string): Promise<{
        hostedEvents: number;
        attendedEvents: number;
        receivedInvitations: number;
        sentInvitations: number;
        friendsCount: number;
        attractivenessScore: number;
        rating: number;
        engagementPoints: number;
        socialStreakDays: number;
    }>;
    getUserEvents(userId: string, type?: 'hosted' | 'attending'): Promise<({
        _count: {
            invitations: number;
            attendees: number;
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
    })[] | ({
        _count: {
            attendees: number;
        };
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
    })[]>;
}
