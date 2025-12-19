"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const throttler_1 = require("@nestjs/throttler");
const prisma_module_1 = require("./prisma/prisma.module");
const auth_module_1 = require("./auth/auth.module");
const users_module_1 = require("./users/users.module");
const events_module_1 = require("./events/events.module");
const invitations_module_1 = require("./invitations/invitations.module");
const categories_module_1 = require("./categories/categories.module");
const scoring_module_1 = require("./scoring/scoring.module");
const friends_module_1 = require("./friends/friends.module");
const lists_module_1 = require("./lists/lists.module");
const recommendations_module_1 = require("./recommendations/recommendations.module");
const cities_module_1 = require("./cities/cities.module");
const email_module_1 = require("./email/email.module");
const push_module_1 = require("./push/push.module");
const notifications_module_1 = require("./notifications/notifications.module");
const otp_module_1 = require("./otp/otp.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
            }),
            throttler_1.ThrottlerModule.forRoot([
                {
                    ttl: 60000,
                    limit: 100,
                },
            ]),
            prisma_module_1.PrismaModule,
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            events_module_1.EventsModule,
            invitations_module_1.InvitationsModule,
            categories_module_1.CategoriesModule,
            scoring_module_1.ScoringModule,
            friends_module_1.FriendsModule,
            lists_module_1.ListsModule,
            recommendations_module_1.RecommendationsModule,
            cities_module_1.CitiesModule,
            email_module_1.EmailModule,
            push_module_1.PushModule,
            notifications_module_1.NotificationsModule,
            otp_module_1.OtpModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map