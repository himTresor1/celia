"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransformInterceptor = void 0;
const common_1 = require("@nestjs/common");
const operators_1 = require("rxjs/operators");
let TransformInterceptor = class TransformInterceptor {
    intercept(context, next) {
        const request = context.switchToHttp().getRequest();
        const method = request.method;
        const url = request.url;
        return next.handle().pipe((0, operators_1.map)((data) => {
            if (data && typeof data === 'object' && 'message' in data) {
                if ('data' in data && Object.keys(data).length === 2) {
                    return data;
                }
                const { message, ...rest } = data;
                const restKeys = Object.keys(rest);
                if (restKeys.length > 0) {
                    return {
                        message,
                        data: rest,
                    };
                }
                return {
                    message,
                };
            }
            const message = this.generateMessage(method, url, data);
            return {
                message,
                data,
            };
        }));
    }
    generateMessage(method, url, data) {
        const endpoint = url.split('?')[0].replace('/api/', '');
        switch (method) {
            case 'GET':
                if (endpoint.includes('me') || endpoint.includes('profile')) {
                    return 'Profile retrieved successfully';
                }
                if (endpoint.includes('events')) {
                    return 'Events retrieved successfully';
                }
                if (endpoint.includes('invitations')) {
                    return 'Invitations retrieved successfully';
                }
                if (endpoint.includes('users')) {
                    return 'Users retrieved successfully';
                }
                if (endpoint.includes('categories')) {
                    return 'Categories retrieved successfully';
                }
                return 'Data retrieved successfully';
            case 'POST':
                if (endpoint.includes('register')) {
                    return 'Account created successfully';
                }
                if (endpoint.includes('login')) {
                    return 'Login successful';
                }
                if (endpoint.includes('events')) {
                    return 'Event created successfully';
                }
                if (endpoint.includes('invitations/bulk')) {
                    return data?.message || 'Invitations sent successfully';
                }
                if (endpoint.includes('invitations')) {
                    return 'Invitation sent successfully';
                }
                if (endpoint.includes('join')) {
                    return 'Successfully joined event';
                }
                return 'Resource created successfully';
            case 'PATCH':
            case 'PUT':
                if (endpoint.includes('profile') || endpoint.includes('users')) {
                    return 'Profile updated successfully';
                }
                if (endpoint.includes('events')) {
                    return 'Event updated successfully';
                }
                if (endpoint.includes('invitations')) {
                    return 'Invitation updated successfully';
                }
                return 'Resource updated successfully';
            case 'DELETE':
                if (endpoint.includes('invitations')) {
                    return 'Invitation deleted successfully';
                }
                if (endpoint.includes('events')) {
                    return 'Event deleted successfully';
                }
                if (endpoint.includes('leave')) {
                    return 'Successfully left event';
                }
                return 'Resource deleted successfully';
            default:
                return 'Operation completed successfully';
        }
    }
};
exports.TransformInterceptor = TransformInterceptor;
exports.TransformInterceptor = TransformInterceptor = __decorate([
    (0, common_1.Injectable)()
], TransformInterceptor);
//# sourceMappingURL=transform.interceptor.js.map