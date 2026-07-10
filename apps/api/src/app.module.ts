import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ForumsModule } from './forums/forums.module';
import { ThreadsModule } from './threads/threads.module';
import { PostsModule } from './posts/posts.module';
import { ReactionsModule } from './reactions/reactions.module';
import { NotificationsModule } from './notifications/notifications.module';
import { ReportsModule } from './reports/reports.module';
import { ModerationModule } from './moderation/moderation.module';
import { SearchModule } from './search/search.module';
import { TagsModule } from './tags/tags.module';
import { MessagesModule } from './messages/messages.module';
import { AdminModule } from './admin/admin.module';
import { MailModule } from './mail/mail.module';
import { UploadModule } from './upload/upload.module';
import { PrismaModule } from './prisma/prisma.module';
import { ReputationModule } from './reputation/reputation.module';
import { OpportunitiesModule } from './opportunities/opportunities.module';
import { EndorsementsModule } from './endorsements/endorsements.module';
import { CvModule } from './cv/cv.module';
import { ResourcesModule } from './resources/resources.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    PrismaModule,
    MailModule,
    AuthModule,
    UsersModule,
    ForumsModule,
    ThreadsModule,
    PostsModule,
    ReactionsModule,
    NotificationsModule,
    ReportsModule,
    ModerationModule,
    SearchModule,
    TagsModule,
    MessagesModule,
    AdminModule,
    UploadModule,
    ReputationModule,
    OpportunitiesModule,
    EndorsementsModule,
    CvModule,
    ResourcesModule,
  ],
})
export class AppModule {}
