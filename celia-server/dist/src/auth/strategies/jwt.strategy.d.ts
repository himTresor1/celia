import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
declare const JwtStrategy_base: new (...args: any[]) => Strategy;
export declare class JwtStrategy extends JwtStrategy_base {
    private configService;
    private prisma;
    constructor(configService: ConfigService, prisma: PrismaService);
    validate(payload: {
        sub: string;
        email: string;
    }): Promise<{
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
        profileCompleted: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
export {};
