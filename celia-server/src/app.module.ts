import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { EventsModule } from './events/events.module';
import { InvitationsModule } from './invitations/invitations.module';
import { CategoriesModule } from './categories/categories.module';
import { ScoringModule } from './scoring/scoring.module';
import { FriendsModule } from './friends/friends.module';
import { ListsModule } from './lists/lists.module';
import { RecommendationsModule } from './recommendations/recommendations.module';
import { CitiesModule } from './cities/cities.module';
import { EmailModule } from './email/email.module';
import { PushModule } from './push/push.module';
import { NotificationsModule } from './notifications/notifications.module';
import { OtpModule } from './otp/otp.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),
    PrismaModule,
    AuthModule,
    UsersModule,
    EventsModule,
    InvitationsModule,
    CategoriesModule,
    ScoringModule,
    FriendsModule,
    ListsModule,
    RecommendationsModule,
    CitiesModule,
    EmailModule,
    PushModule,
    NotificationsModule,
    OtpModule,
  ],
})
export class AppModule {}
