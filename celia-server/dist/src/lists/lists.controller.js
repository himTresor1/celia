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
exports.ListsController = void 0;
const common_1 = require("@nestjs/common");
const lists_service_1 = require("./lists.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const add_to_saved_dto_1 = require("./dto/add-to-saved.dto");
const bulk_invite_dto_1 = require("./dto/bulk-invite.dto");
let ListsController = class ListsController {
    constructor(listsService) {
        this.listsService = listsService;
    }
    async getSavedUsers(user, page, limit) {
        return this.listsService.getSavedUsers(user.id || user.sub, page ? parseInt(page) : 1, limit ? parseInt(limit) : 50);
    }
    async addToSaved(user, dto, req) {
        console.log('[ListsController] addToSaved - Request received');
        console.log('[ListsController] addToSaved - User object:', user);
        console.log('[ListsController] addToSaved - User type:', typeof user);
        console.log('[ListsController] addToSaved - User is null?', user === null);
        console.log('[ListsController] addToSaved - User is undefined?', user === undefined);
        if (user) {
            console.log('[ListsController] addToSaved - User object keys:', Object.keys(user));
            console.log('[ListsController] addToSaved - user.id:', user.id);
            console.log('[ListsController] addToSaved - user.sub:', user.sub);
        }
        console.log('[ListsController] addToSaved - req.user:', req.user);
        const userId = user?.id || user?.sub || user?.userId || req?.user?.id || req?.user?.sub;
        if (!userId) {
            console.error('[ListsController] addToSaved - No user ID found!');
            console.error('[ListsController] addToSaved - User object:', JSON.stringify(user, null, 2));
            console.error('[ListsController] addToSaved - Request user:', JSON.stringify(req.user, null, 2));
            throw new Error('User ID not found in request. Please ensure you are authenticated.');
        }
        console.log('[ListsController] addToSaved - Using userId:', userId);
        return this.listsService.addToSaved(userId, dto.savedUserId, dto.context, dto.notes);
    }
    async removeFromSaved(user, userId) {
        await this.listsService.removeFromSaved(user.id || user.sub, userId);
        return { message: 'User removed from saved list' };
    }
    async checkIfSaved(user, userId) {
        const isSaved = await this.listsService.isUserSaved(user.id || user.sub, userId);
        return { isSaved };
    }
    async getInvitees(user, page, limit) {
        return this.listsService.getInvitees(user.id || user.sub, page ? parseInt(page) : 1, limit ? parseInt(limit) : 50);
    }
    async bulkInvite(user, dto) {
        return this.listsService.bulkInvite(user.id || user.sub, dto.eventId, dto.userIds, dto.personalMessage);
    }
    async searchSavedUsers(user, query, page, limit) {
        return this.listsService.searchSavedUsers(user.id || user.sub, query, page ? parseInt(page) : 1, limit ? parseInt(limit) : 50);
    }
};
exports.ListsController = ListsController;
__decorate([
    (0, common_1.Get)('saved'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], ListsController.prototype, "getSavedUsers", null);
__decorate([
    (0, common_1.Post)('saved'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, add_to_saved_dto_1.AddToSavedDto, Object]),
    __metadata("design:returntype", Promise)
], ListsController.prototype, "addToSaved", null);
__decorate([
    (0, common_1.Delete)('saved/:userId'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ListsController.prototype, "removeFromSaved", null);
__decorate([
    (0, common_1.Get)('saved/check/:userId'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ListsController.prototype, "checkIfSaved", null);
__decorate([
    (0, common_1.Get)('invitees'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], ListsController.prototype, "getInvitees", null);
__decorate([
    (0, common_1.Post)('bulk-invite'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, bulk_invite_dto_1.BulkInviteDto]),
    __metadata("design:returntype", Promise)
], ListsController.prototype, "bulkInvite", null);
__decorate([
    (0, common_1.Get)('saved/search'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('q')),
    __param(2, (0, common_1.Query)('page')),
    __param(3, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", Promise)
], ListsController.prototype, "searchSavedUsers", null);
exports.ListsController = ListsController = __decorate([
    (0, common_1.Controller)('lists'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [lists_service_1.ListsService])
], ListsController);
//# sourceMappingURL=lists.controller.js.map