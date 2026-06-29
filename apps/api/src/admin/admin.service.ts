import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@forum/database';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats() {
    const now = new Date();
    const dayAgo = new Date(now.getTime() - 24 * 3600 * 1000);
    const weekAgo = new Date(now.getTime() - 7 * 24 * 3600 * 1000);

    const [
      totalUsers,
      newUsersToday,
      totalThreads,
      totalPosts,
      newPostsToday,
      pendingReports,
      activeUsers,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { createdAt: { gte: dayAgo } } }),
      this.prisma.thread.count({ where: { status: { not: 'DELETED' } } }),
      this.prisma.post.count({ where: { isDeleted: false } }),
      this.prisma.post.count({ where: { createdAt: { gte: dayAgo }, isDeleted: false } }),
      this.prisma.report.count({ where: { status: 'PENDING' } }),
      this.prisma.user.count({ where: { lastSeenAt: { gte: weekAgo } } }),
    ]);

    return {
      users: { total: totalUsers, newToday: newUsersToday, activeLastWeek: activeUsers },
      content: { threads: totalThreads, posts: totalPosts, newPostsToday },
      moderation: { pendingReports },
    };
  }

  async getUsers(page: number, limit: number, search?: string) {
    const where = search
      ? {
          OR: [
            { username: { contains: search, mode: 'insensitive' as const } },
            { email: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: {
          id: true,
          username: true,
          email: true,
          role: true,
          reputation: true,
          postCount: true,
          isBanned: true,
          isSuspended: true,
          isEmailVerified: true,
          createdAt: true,
          lastSeenAt: true,
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.user.count({ where }),
    ]);

    return { data: users, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async updateUserRole(userId: string, role: Role) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { role },
      select: { id: true, username: true, role: true },
    });
  }

  async getSiteSettings() {
    return this.prisma.siteSettings.findMany();
  }

  async updateSiteSetting(key: string, value: any) {
    return this.prisma.siteSettings.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
  }
}
