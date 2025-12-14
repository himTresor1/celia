import { PrismaService } from '../prisma/prisma.service';
import { FriendsService } from '../friends/friends.service';
interface RecommendationFilters {
    gender?: string;
    collegeId?: string;
    minAge?: number;
    maxAge?: number;
    minScore?: number;
    maxScore?: number;
    interests?: string[];
    hasMutualFriends?: boolean;
}
export declare class RecommendationsService {
    private prisma;
    private friendsService;
    constructor(prisma: PrismaService, friendsService: FriendsService);
    getSmartSuggestions(userId: string, filters?: RecommendationFilters, limit?: number): Promise<any[]>;
    private calculateRecommendationScore;
    getFilteredUsers(userId: string, filters: RecommendationFilters, page?: number, limit?: number): Promise<any>;
}
export {};
