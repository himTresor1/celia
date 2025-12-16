import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
export declare class UsersController {
    private usersService;
    constructor(usersService: UsersService);
    findAll(search?: string, interests?: string, college?: string): Promise<{
        id: string;
        createdAt: Date;
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
    }[]>;
    findOne(id: string): Promise<{
        friendsCount: number;
        rating: number;
        id: string;
        createdAt: Date;
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
        updatedAt: Date;
        _count: {
            hostedEvents: number;
            receivedInvitations: number;
            eventAttendances: number;
            friendships1: number;
            friendships2: number;
        };
    }>;
    update(id: string, user: any, dto: UpdateUserDto): Promise<{
        id: string;
        createdAt: Date;
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
        updatedAt: Date;
    }>;
    getUserStats(id: string): Promise<{
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
    getUserEvents(id: string, type?: 'hosted' | 'attending'): Promise<({
        _count: {
            invitations: number;
            attendees: number;
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
    })[]>;
}
