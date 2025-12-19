"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FriendsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const friends_service_1 = require("./friends.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const send_friend_request_dto_1 = require("./dto/send-friend-request.dto");
let FriendsController = class FriendsController {
    constructor(friendsService) {
        this.friendsService = friendsService;
    }
    async sendFriendRequest(user, dto) {
        return this.friendsService.sendFriendRequest(user.sub, dto.toUserId, dto.message);
    }
    async acceptFriendRequest(user, requestId) {
        return this.friendsService.acceptFriendRequest(user.sub, requestId);
    }
    async declineFriendRequest(user, requestId) {
        await this.friendsService.declineFriendRequest(user.sub, requestId);
        return { message: 'Friend request declined' };
    }
    async getFriendRequests(user, type) {
        return this.friendsService.getFriendRequests(user.sub, type || 'received');
    }
    async getFriends(user, page, limit) {
        return this.friendsService.getFriends(user.sub, page ? parseInt(page) : 1, limit ? parseInt(limit) : 50);
    }
    async getPendingRequests(user) {
        return this.friendsService.getPendingRequests(user.sub);
    }
    async getMutualFriends(user, userId) {
        const mutualFriends = await this.friendsService.getMutualFriends(user.sub, userId);
        return { count: mutualFriends.length, userIds: mutualFriends };
    }
    async removeFriend(user, friendId) {
        await this.friendsService.removeFriend(user.sub, friendId);
        return { message: 'Friend removed successfully' };
    }
    async checkFriendship(user, userId) {
        const areFriends = await this.friendsService.areFriends(user.sub, userId);
        return { areFriends };
    }
};
exports.FriendsController = FriendsController;
__decorate([
    (0, common_1.Post)('request'),
    (0, swagger_1.ApiOperation)({ summary: 'Send a friend request' }),
    (0, swagger_1.ApiBody)({ type: send_friend_request_dto_1.SendFriendRequestDto }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Friend request sent successfully',
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Bad request (already friends, request exists, etc.)',
    }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, send_friend_request_dto_1.SendFriendRequestDto]),
    __metadata("design:returntype", Promise)
], FriendsController.prototype, "sendFriendRequest", null);
__decorate([
    (0, common_1.Post)('request/:requestId/accept'),
    (0, swagger_1.ApiOperation)({ summary: 'Accept a friend request' }),
    (0, swagger_1.ApiParam)({
        name: 'requestId',
        description: 'ID of the friend request to accept',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Friend request accepted successfully',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Friend request not found',
    }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('requestId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], FriendsController.prototype, "acceptFriendRequest", null);
__decorate([
    (0, common_1.Post)('request/:requestId/decline'),
    (0, swagger_1.ApiOperation)({ summary: 'Decline a friend request' }),
    (0, swagger_1.ApiParam)({
        name: 'requestId',
        description: 'ID of the friend request to decline',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Friend request declined successfully',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Friend request not found',
    }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('requestId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], FriendsController.prototype, "declineFriendRequest", null);
__decorate([
    (0, common_1.Get)('requests'),
    (0, swagger_1.ApiOperation)({ summary: 'Get friend requests (sent or received)' }),
    (0, swagger_1.ApiQuery)({
        name: 'type',
        required: false,
        enum: ['sent', 'received'],
        description: 'Type of requests to retrieve (default: received)',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'List of friend requests',
    }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('type')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], FriendsController.prototype, "getFriendRequests", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], FriendsController.prototype, "getFriends", null);
__decorate([
    (0, common_1.Get)('pending'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], FriendsController.prototype, "getPendingRequests", null);
__decorate([
    (0, common_1.Get)('mutual/:userId'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], FriendsController.prototype, "getMutualFriends", null);
__decorate([
    (0, common_1.Delete)(':friendId'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('friendId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], FriendsController.prototype, "removeFriend", null);
__decorate([
    (0, common_1.Get)('check/:userId'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], FriendsController.prototype, "checkFriendship", null);
exports.FriendsController = FriendsController = __decorate([
    (0, swagger_1.ApiTags)('Friends'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('friends'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [friends_service_1.FriendsService])
], FriendsController);
//# sourceMappingURL=friends.controller.js.map