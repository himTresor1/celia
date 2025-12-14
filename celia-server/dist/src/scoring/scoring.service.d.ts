import { PrismaService } from '../prisma/prisma.service';
export declare class ScoringService {
    private prisma;
    constructor(prisma: PrismaService);
    private readonly WEIGHTS;
    calculateAttractivenessScore(userId: string): Promise<number>;
    displayRating(score: number): number;
    recalculateUserScore(userId: string): Promise<void>;
    logEngagement(userId: string, actionType: string, pointsEarned: number, metadata?: any): Promise<void>;
    updateStreak(userId: string): Promise<void>;
    getUserEngagementStats(userId: string): Promise<any>;
}
