import { FriendsService } from './friends.service';
import { SendFriendRequestDto } from './dto/send-friend-request.dto';
export declare class FriendsController {
    private readonly friendsService;
    constructor(friendsService: FriendsService);
    sendFriendRequest(user: any, dto: SendFriendRequestDto): Promise<any>;
    acceptFriendRequest(user: any, requestId: string): Promise<any>;
    declineFriendRequest(user: any, requestId: string): Promise<{
        message: string;
    }>;
    getFriendRequests(user: any, type?: 'sent' | 'received'): Promise<any>;
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
