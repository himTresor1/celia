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
var InvitationsController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvitationsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const invitations_service_1 = require("./invitations.service");
const create_invitation_dto_1 = require("./dto/create-invitation.dto");
const update_invitation_dto_1 = require("./dto/update-invitation.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
let InvitationsController = InvitationsController_1 = class InvitationsController {
    constructor(invitationsService) {
        this.invitationsService = invitationsService;
        this.logger = new common_1.Logger(InvitationsController_1.name);
    }
    create(user, dto) {
        return this.invitationsService.create(user.id, dto);
    }
    async bulkCreate(user, dto) {
        this.logger.log(`[BULK_INVITE_CONTROLLER] Received bulk invite request - UserId: ${user?.id}, EventId: ${dto?.eventId}, InviteeCount: ${dto?.inviteeIds?.length || 0}`);
        try {
            if (!dto.eventId) {
                this.logger.error(`[BULK_INVITE_CONTROLLER] Missing eventId in request - UserId: ${user?.id}`);
                throw new common_1.BadRequestException('Event ID is required');
            }
            if (!dto.inviteeIds || dto.inviteeIds.length === 0) {
                this.logger.error(`[BULK_INVITE_CONTROLLER] Missing or empty inviteeIds in request - UserId: ${user?.id}, EventId: ${dto.eventId}`);
                throw new common_1.BadRequestException('At least one invitee ID is required');
            }
            if (!user?.id) {
                this.logger.error(`[BULK_INVITE_CONTROLLER] Missing user ID in request context`);
                throw new common_1.BadRequestException('User ID is required');
            }
            this.logger.debug(`[BULK_INVITE_CONTROLLER] Request validated - Proceeding to service layer`);
            const result = await this.invitationsService.bulkCreate(user.id, dto);
            this.logger.log(`[BULK_INVITE_CONTROLLER] Bulk invite completed successfully - UserId: ${user.id}, EventId: ${dto.eventId}, Created: ${result.invitations?.length || 0}, Skipped: ${result.skipped || 0}`);
            return result;
        }
        catch (error) {
            this.logger.error(`[BULK_INVITE_CONTROLLER] Error in bulk invite endpoint - UserId: ${user?.id}, EventId: ${dto?.eventId}, ErrorType: ${error.constructor?.name || 'Unknown'}, ErrorMessage: ${error.message || 'Unknown error'}`);
            this.logger.error(`[BULK_INVITE_CONTROLLER] Error stack: ${error.stack || 'No stack trace'}`);
            this.logger.error(`[BULK_INVITE_CONTROLLER] Request body: ${JSON.stringify(dto, null, 2)}`);
            throw error;
        }
    }
    findMyInvitations(user, status) {
        return this.invitationsService.findMyInvitations(user.id, status);
    }
    findEventInvitations(eventId, user) {
        return this.invitationsService.findEventInvitations(eventId, user.id);
    }
    updateStatus(id, user, dto) {
        return this.invitationsService.updateStatus(id, user.id, dto);
    }
    delete(id, user) {
        return this.invitationsService.delete(id, user.id);
    }
};
exports.InvitationsController = InvitationsController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a single invitation' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Invitation created successfully',
    }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - Only host can send invitations',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Event or invitee not found',
    }),
    (0, swagger_1.ApiResponse)({
        status: 409,
        description: 'User already invited',
    }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_invitation_dto_1.CreateInvitationDto]),
    __metadata("design:returntype", void 0)
], InvitationsController.prototype, "create", null);
__decorate([
    (0, common_1.Post)('bulk'),
    (0, swagger_1.ApiOperation)({ summary: 'Send bulk invitations' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Invitations sent successfully',
    }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - Only host can send invitations',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Event not found',
    }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_invitation_dto_1.BulkInviteDto]),
    __metadata("design:returntype", Promise)
], InvitationsController.prototype, "bulkCreate", null);
__decorate([
    (0, common_1.Get)('my'),
    (0, swagger_1.ApiOperation)({ summary: 'Get my invitations' }),
    (0, swagger_1.ApiQuery)({
        name: 'status',
        required: false,
        description: 'Filter by status (pending, going, declined)',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'List of user invitations',
    }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], InvitationsController.prototype, "findMyInvitations", null);
__decorate([
    (0, common_1.Get)('event/:eventId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all invitations for an event' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'List of event invitations',
    }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - Only host can view',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Event not found',
    }),
    __param(0, (0, common_1.Param)('eventId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], InvitationsController.prototype, "findEventInvitations", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update invitation status' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Invitation status updated',
    }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - Can only update own invitations',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Invitation not found',
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, update_invitation_dto_1.UpdateInvitationDto]),
    __metadata("design:returntype", void 0)
], InvitationsController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete invitation' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Invitation deleted successfully',
    }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - Only inviter or host can delete',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Invitation not found',
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], InvitationsController.prototype, "delete", null);
exports.InvitationsController = InvitationsController = InvitationsController_1 = __decorate([
    (0, swagger_1.ApiTags)('Invitations'),
    (0, common_1.Controller)('invitations'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [invitations_service_1.InvitationsService])
], InvitationsController);
//# sourceMappingURL=invitations.controller.js.map