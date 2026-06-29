import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { Role } from '@forum/database';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findOne(username: string) {
    const user = await this.prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        displayName: true,
        avatar: true,
        bio: true,
        role: true,
        reputation: true,
        postCount: true,
        createdAt: true,
        badges: { include: { badge: true } },
        _count: { select: { threads: true, posts: true } },
      },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    return this.prisma.user.update({
      where: { id: userId },
      data: dto,
      select: {
        id: true,
        username: true,
        displayName: true,
        avatar: true,
        bio: true,
        role: true,
        reputation: true,
      },
    });
  }

  async getUserThreads(username: string, page: number, limit: number) {
    const user = await this.prisma.user.findUnique({ where: { username } });
    if (!user) throw new NotFoundException('User not found');

    const [threads, total] = await Promise.all([
      this.prisma.thread.findMany({
        where: { authorId: user.id, status: { not: 'DELETED' } },
        include: { forum: { include: { category: true } }, _count: { select: { posts: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.thread.count({ where: { authorId: user.id, status: { not: 'DELETED' } } }),
    ]);

    return { data: threads, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async getUserPosts(username: string, page: number, limit: number) {
    const user = await this.prisma.user.findUnique({ where: { username } });
    if (!user) throw new NotFoundException('User not found');

    const [posts, total] = await Promise.all([
      this.prisma.post.findMany({
        where: { authorId: user.id, isDeleted: false },
        include: { thread: true },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.post.count({ where: { authorId: user.id, isDeleted: false } }),
    ]);

    return { data: posts, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }
}
