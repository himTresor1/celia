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
exports.RecommendationsController = void 0;
const common_1 = require("@nestjs/common");
const recommendations_service_1 = require("./recommendations.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const recommendation_filters_dto_1 = require("./dto/recommendation-filters.dto");
let RecommendationsController = class RecommendationsController {
    constructor(recommendationsService) {
        this.recommendationsService = recommendationsService;
    }
    async getSmartSuggestions(user, filters) {
        const limit = filters.limit || 50;
        delete filters.limit;
        return this.recommendationsService.getSmartSuggestions(user.sub, filters, limit);
    }
    async getFilteredUsers(user, filters, page, limit) {
        return this.recommendationsService.getFilteredUsers(user.sub, filters, page ? parseInt(page) : 1, limit ? parseInt(limit) : 50);
    }
};
exports.RecommendationsController = RecommendationsController;
__decorate([
    (0, common_1.Get)('suggestions'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, recommendation_filters_dto_1.RecommendationFiltersDto]),
    __metadata("design:returntype", Promise)
], RecommendationsController.prototype, "getSmartSuggestions", null);
__decorate([
    (0, common_1.Get)('filtered'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __param(2, (0, common_1.Query)('page')),
    __param(3, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, recommendation_filters_dto_1.RecommendationFiltersDto, String, String]),
    __metadata("design:returntype", Promise)
], RecommendationsController.prototype, "getFilteredUsers", null);
exports.RecommendationsController = RecommendationsController = __decorate([
    (0, common_1.Controller)('recommendations'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [recommendations_service_1.RecommendationsService])
], RecommendationsController);
//# sourceMappingURL=recommendations.controller.js.map