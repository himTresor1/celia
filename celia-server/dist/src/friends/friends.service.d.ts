import { PrismaService } from '../prisma/prisma.service';
import { ScoringService } from '../scoring/scoring.service';
export declare class FriendsService {
    private prisma;
    private scoring;
    constructor(prisma: PrismaService, scoring: ScoringService);
    getFriends(userId: string, page?: number, limit?: number): Promise<any>;
    sendFriendRequest(fromUserId: string, toUserId: string, message?: string): Promise<any>;
    acceptFriendRequest(userId: string, requestId: string): Promise<any>;
    declineFriendRequest(userId: string, requestId: string): Promise<void>;
    getFriendRequests(userId: string, type?: 'sent' | 'received'): Promise<any>;
    getPendingRequests(userId: string): Promise<any>;
    removeFriend(userId: string, friendId: string): Promise<void>;
    getMutualFriends(user1Id: string, user2Id: string): Promise<string[]>;
    areFriends(user1Id: string, user2Id: string): Promise<boolean>;
    private getFriendIds;
}
