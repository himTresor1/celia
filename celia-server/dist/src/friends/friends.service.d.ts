import { PrismaService } from '../prisma/prisma.service';
import { ScoringService } from '../scoring/scoring.service';
export declare class FriendsService {
    private prisma;
    private scoring;
    constructor(prisma: PrismaService, scoring: ScoringService);
    sendEnergyPulse(fromUserId: string, toUserId: string): Promise<any>;
    getFriends(userId: string, page?: number, limit?: number): Promise<any>;
    getPendingRequests(userId: string): Promise<any>;
    removeFriend(userId: string, friendId: string): Promise<void>;
    getMutualFriends(user1Id: string, user2Id: string): Promise<string[]>;
    areFriends(user1Id: string, user2Id: string): Promise<boolean>;
    private getFriendIds;
    cleanupExpiredFriendships(): Promise<number>;
}
