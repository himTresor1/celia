import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    sendSignupOtp(dto: {
        email: string;
    }): Promise<{
        message: string;
    }>;
    register(dto: RegisterDto): Promise<{
        user: {
            id: string;
            email: string;
            fullName: string;
            collegeName: string;
            major: string;
            graduationYear: number;
            bio: string;
            avatarUrl: string;
            photoUrls: import("@prisma/client/runtime/library").JsonValue;
            interests: string[];
            collegeVerified: boolean;
            preferredLocations: string[];
            createdAt: Date;
            updatedAt: Date;
        };
        token: string;
    }>;
    login(dto: LoginDto): Promise<{
        user: {
            id: string;
            email: string;
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
        };
        token: string;
    }>;
    getMe(user: any): Promise<{
        id: string;
        email: string;
        fullName: string;
        collegeName: string;
        major: string;
        graduationYear: number;
        bio: string;
        avatarUrl: string;
        photoUrls: import("@prisma/client/runtime/library").JsonValue;
        interests: string[];
        collegeVerified: boolean;
        preferredLocations: string[];
        preferredCityIds: string[];
        profileCompleted: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
