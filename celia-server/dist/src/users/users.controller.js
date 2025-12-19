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
exports.UsersController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const users_service_1 = require("./users.service");
const update_user_dto_1 = require("./dto/update-user.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
let UsersController = class UsersController {
    constructor(usersService) {
        this.usersService = usersService;
    }
    findAll(search, interests, college) {
        const interestArray = interests ? interests.split(',') : undefined;
        return this.usersService.findAll(search, interestArray, college);
    }
    findOne(id) {
        return this.usersService.findOne(id);
    }
    update(id, user, dto) {
        return this.usersService.update(id, user.id, dto);
    }
    getUserStats(id) {
        return this.usersService.getUserStats(id);
    }
    getUserEvents(id, type = 'hosted') {
        return this.usersService.getUserEvents(id, type);
    }
    updatePushToken(user, dto) {
        return this.usersService.updatePushToken(user.id, dto.pushToken);
    }
    sendCollegeVerificationOtp(user, dto) {
        return this.usersService.sendCollegeVerificationOtp(user.id, dto.email);
    }
    verifyCollegeEmail(user, dto) {
        return this.usersService.verifyCollegeEmail(user.id, dto.email, dto.otpCode);
    }
};
exports.UsersController = UsersController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all users with optional filters' }),
    (0, swagger_1.ApiQuery)({
        name: 'search',
        required: false,
        description: 'Search by name, college, or major',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'interests',
        required: false,
        description: 'Filter by interests (comma-separated)',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'college',
        required: false,
        description: 'Filter by college name',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'List of users',
    }),
    __param(0, (0, common_1.Query)('search')),
    __param(1, (0, common_1.Query)('interests')),
    __param(2, (0, common_1.Query)('college')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get user by ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'User details',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'User not found',
    }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update user profile' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'User profile updated',
    }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - Can only update own profile',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'User not found',
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, update_user_dto_1.UpdateUserDto]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "update", null);
__decorate([
    (0, common_1.Get)(':id/stats'),
    (0, swagger_1.ApiOperation)({ summary: 'Get user statistics' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'User statistics',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'User not found',
    }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "getUserStats", null);
__decorate([
    (0, common_1.Get)(':id/events'),
    (0, swagger_1.ApiOperation)({ summary: 'Get user events' }),
    (0, swagger_1.ApiQuery)({
        name: 'type',
        required: false,
        enum: ['hosted', 'attending'],
        description: 'Type of events to retrieve',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'List of user events',
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('type')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "getUserEvents", null);
__decorate([
    (0, common_1.Patch)('push-token'),
    (0, swagger_1.ApiOperation)({ summary: 'Update user push notification token' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Push token updated',
    }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "updatePushToken", null);
__decorate([
    (0, common_1.Post)('send-college-verification-otp'),
    (0, swagger_1.ApiOperation)({ summary: 'Send OTP for college email verification' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'OTP sent successfully',
    }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "sendCollegeVerificationOtp", null);
__decorate([
    (0, common_1.Post)('verify-college-email'),
    (0, swagger_1.ApiOperation)({ summary: 'Verify college email with OTP' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'College email verified successfully',
    }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "verifyCollegeEmail", null);
exports.UsersController = UsersController = __decorate([
    (0, swagger_1.ApiTags)('Users'),
    (0, common_1.Controller)('users'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [users_service_1.UsersService])
], UsersController);
//# sourceMappingURL=users.controller.js.map