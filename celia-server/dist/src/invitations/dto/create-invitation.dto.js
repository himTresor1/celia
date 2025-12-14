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
Object.defineProperty(exports, "__esModule", { value: true });
exports.BulkInviteDto = exports.CreateInvitationDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class CreateInvitationDto {
}
exports.CreateInvitationDto = CreateInvitationDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'event-uuid',
        description: 'Event ID',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateInvitationDto.prototype, "eventId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'user-uuid',
        description: 'Invitee user ID',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateInvitationDto.prototype, "inviteeId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 'Hey! Would love for you to join us for this event!',
        description: 'Personal message to invitee (max 200 characters)',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(200),
    __metadata("design:type", String)
], CreateInvitationDto.prototype, "personalMessage", void 0);
class BulkInviteDto {
}
exports.BulkInviteDto = BulkInviteDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'event-uuid',
        description: 'Event ID',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BulkInviteDto.prototype, "eventId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: ['user-uuid-1', 'user-uuid-2', 'user-uuid-3'],
        description: 'Array of invitee user IDs',
    }),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], BulkInviteDto.prototype, "inviteeIds", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 'Hey! Would love for you to join us for this event!',
        description: 'Personal message to all invitees (max 200 characters)',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(200),
    __metadata("design:type", String)
], BulkInviteDto.prototype, "personalMessage", void 0);
//# sourceMappingURL=create-invitation.dto.js.map