import { FriendsService } from './friends.service';
export declare class FriendsController {
    private readonly friendsService;
    constructor(friendsService: FriendsService);
    getFriends(user: any, page?: string, limit?: string): Promise<any>;
    getPendingRequests(user: any): Promise<any>;
    getMutualFriends(user: any, userId: string): Promise<{
        count: number;
        userIds: string[];
    }>;
    removeFriend(user: any, friendId: string): Promise<{
        message: string;
    }>;
    checkFriendship(user: any, userId: string): Promise<{
        areFriends: boolean;
    }>;
}
