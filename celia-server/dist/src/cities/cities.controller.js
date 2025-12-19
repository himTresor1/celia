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
exports.CitiesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const cities_service_1 = require("./cities.service");
let CitiesController = class CitiesController {
    constructor(citiesService) {
        this.citiesService = citiesService;
    }
    async findAll(search, limit) {
        const limitNum = limit ? parseInt(limit, 10) : undefined;
        return this.citiesService.findAll(search, limitNum);
    }
    async findOne(id) {
        return this.citiesService.findOne(id);
    }
};
exports.CitiesController = CitiesController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all cities with optional search' }),
    (0, swagger_1.ApiQuery)({ name: 'search', required: false, description: 'Search cities by name' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, description: 'Limit number of results', type: Number }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'List of cities',
    }),
    __param(0, (0, common_1.Query)('search')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], CitiesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get city by ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'City details',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'City not found',
    }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CitiesController.prototype, "findOne", null);
exports.CitiesController = CitiesController = __decorate([
    (0, swagger_1.ApiTags)('Cities'),
    (0, common_1.Controller)('cities'),
    __metadata("design:paramtypes", [cities_service_1.CitiesService])
], CitiesController);
//# sourceMappingURL=cities.controller.js.map