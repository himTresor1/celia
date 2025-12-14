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
exports.CategoriesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const categories_service_1 = require("./categories.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let CategoriesController = class CategoriesController {
    constructor(categoriesService) {
        this.categoriesService = categoriesService;
    }
    getEventCategories() {
        return this.categoriesService.getEventCategories();
    }
    getInterestCategories() {
        return this.categoriesService.getInterestCategories();
    }
    getColleges(search) {
        return this.categoriesService.getColleges(search);
    }
};
exports.CategoriesController = CategoriesController;
__decorate([
    (0, common_1.Get)('events'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all event categories' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'List of event categories',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CategoriesController.prototype, "getEventCategories", null);
__decorate([
    (0, common_1.Get)('interests'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all interest categories' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'List of interest categories',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CategoriesController.prototype, "getInterestCategories", null);
__decorate([
    (0, common_1.Get)('colleges'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all colleges' }),
    (0, swagger_1.ApiQuery)({
        name: 'search',
        required: false,
        description: 'Search colleges by name or location',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'List of colleges',
    }),
    __param(0, (0, common_1.Query)('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CategoriesController.prototype, "getColleges", null);
exports.CategoriesController = CategoriesController = __decorate([
    (0, swagger_1.ApiTags)('Categories & Reference Data'),
    (0, common_1.Controller)('categories'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [categories_service_1.CategoriesService])
], CategoriesController);
//# sourceMappingURL=categories.controller.js.map