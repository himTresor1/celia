import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
export declare class UsersController {
    private usersService;
    constructor(usersService: UsersService);
    findAll(search?: string, interests?: string, college?: string): Promise<{
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
    update(id: string, user: any, dto: UpdateUserDto): Promise<{
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
    })[] | ({
        category: {
            id: string;
            createdAt: Date;
            name: string;
            icon: string | null;
        };
        _count: {
            attendees: number;
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
    })[]>;
    updatePushToken(user: any, dto: {
        pushToken: string;
    }): Promise<{
        id: string;
        email: string;
        password: string;
        fullName: string;
        dateOfBirth: Date | null;
        age: number | null;
        gender: string | null;
        collegeName: string | null;
        collegeId: string | null;
        major: string | null;
        graduationYear: number | null;
        bio: string;
        avatarUrl: string | null;
        photoUrls: import("@prisma/client/runtime/library").JsonValue;
        interests: string[];
        emailVerified: boolean;
        collegeVerified: boolean;
        preferredLocations: string[];
        preferredCityIds: string[];
        profileCompleted: boolean;
        attractivenessScore: number;
        engagementPoints: number;
        socialStreakDays: number;
        lastActiveDate: Date | null;
        appOpensCount: number;
        profileCompleteness: number;
        createdAt: Date;
        updatedAt: Date;
        pushToken: string | null;
    }>;
    sendCollegeVerificationOtp(user: any, dto: {
        email: string;
    }): Promise<{
        message: string;
    }>;
    verifyCollegeEmail(user: any, dto: {
        email: string;
        otpCode: string;
    }): Promise<{
        message: string;
        collegeVerified: boolean;
    }>;
}
