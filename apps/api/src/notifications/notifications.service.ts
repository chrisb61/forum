import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationType } from '@forum/database';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async notifyThreadSubscribers(
    thread: any,
    actorId: string,
    postId: string,
    type: NotificationType,
  ) {
    const subscribers = (thread.subscriptions || [])
      .map((s: any) => s.user)
      .filter((u: any) => u.id !== actorId);

    if (subscribers.length === 0) return;

    await this.prisma.notification.createMany({
      data: subscribers.map((u: any) => ({
        userId: u.id,
        type,
        payload: { threadId: thread.id, threadSlug: thread.slug, postId, actorId },
      })),
    });
  }

  async getForUser(userId: string, page: number, limit: number) {
    const [notifications, total] = await Promise.all([
      this.prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.notification.count({ where: { userId } }),
    ]);
    return { data: notifications, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async markRead(notificationId: string, userId: string) {
    return this.prisma.notification.updateMany({
      where: { id: notificationId, userId },
      data: { readAt: new Date() },
    });
  }

  async markAllRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { userId, readAt: null },
      data: { readAt: new Date() },
    });
  }

  async getUnreadCount(userId: string) {
    const count = await this.prisma.notification.count({
      where: { userId, readAt: null },
    });
    return { count };
  }
}
