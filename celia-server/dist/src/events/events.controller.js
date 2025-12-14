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
exports.EventsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const events_service_1 = require("./events.service");
const create_event_dto_1 = require("./dto/create-event.dto");
const update_event_dto_1 = require("./dto/update-event.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
let EventsController = class EventsController {
    constructor(eventsService) {
        this.eventsService = eventsService;
    }
    create(user, dto) {
        return this.eventsService.create(user.id, dto);
    }
    getMyEvents(user, status) {
        return this.eventsService.getMyEvents(user.id, status);
    }
    findAll(user, status, categoryId, search) {
        return this.eventsService.findAll(user.id, status, categoryId, search);
    }
    findOne(id, user) {
        return this.eventsService.findOne(id, user.id);
    }
    update(id, user, dto) {
        return this.eventsService.update(id, user.id, dto);
    }
    delete(id, user) {
        return this.eventsService.delete(id, user.id);
    }
    joinEvent(id, user) {
        return this.eventsService.joinEvent(id, user.id);
    }
    leaveEvent(id, user) {
        return this.eventsService.leaveEvent(id, user.id);
    }
    getAttendees(id, user) {
        return this.eventsService.getEventAttendees(id, user.id);
    }
};
exports.EventsController = EventsController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new event' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Event created successfully',
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Bad request - Invalid event data',
    }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_event_dto_1.CreateEventDto]),
    __metadata("design:returntype", void 0)
], EventsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('my'),
    (0, swagger_1.ApiOperation)({ summary: 'Get my events (events I created)' }),
    (0, swagger_1.ApiQuery)({
        name: 'status',
        required: false,
        description: 'Filter by status (draft, active, cancelled, completed)',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'List of my events',
    }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], EventsController.prototype, "getMyEvents", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all accessible events' }),
    (0, swagger_1.ApiQuery)({
        name: 'status',
        required: false,
        description: 'Filter by status (draft, active, cancelled, completed)',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'categoryId',
        required: false,
        description: 'Filter by category ID',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'search',
        required: false,
        description: 'Search by name, description, or location',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'List of events',
    }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('status')),
    __param(2, (0, common_1.Query)('categoryId')),
    __param(3, (0, common_1.Query)('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", void 0)
], EventsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get event by ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Event details',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Event not found',
    }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - No access to this event',
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], EventsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update event' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Event updated successfully',
    }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - Only host can update',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Event not found',
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, update_event_dto_1.UpdateEventDto]),
    __metadata("design:returntype", void 0)
], EventsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete event' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Event deleted successfully',
    }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - Only host can delete',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Event not found',
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], EventsController.prototype, "delete", null);
__decorate([
    (0, common_1.Post)(':id/join'),
    (0, swagger_1.ApiOperation)({ summary: 'Join an event' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Successfully joined event',
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Bad request - Already attending or event full',
    }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - Not invited to private event',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Event not found',
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], EventsController.prototype, "joinEvent", null);
__decorate([
    (0, common_1.Delete)(':id/leave'),
    (0, swagger_1.ApiOperation)({ summary: 'Leave an event' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Successfully left event',
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Bad request - Not attending or host cannot leave',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Event not found',
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], EventsController.prototype, "leaveEvent", null);
__decorate([
    (0, common_1.Get)(':id/attendees'),
    (0, swagger_1.ApiOperation)({ summary: 'Get event attendees' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'List of event attendees',
    }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - No access to this event',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Event not found',
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], EventsController.prototype, "getAttendees", null);
exports.EventsController = EventsController = __decorate([
    (0, swagger_1.ApiTags)('Events'),
    (0, common_1.Controller)('events'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [events_service_1.EventsService])
], EventsController);
//# sourceMappingURL=events.controller.js.map