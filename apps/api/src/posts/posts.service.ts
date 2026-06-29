import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePostDto, UpdatePostDto } from './dto/create-post.dto';
import { Role, ThreadStatus } from '@forum/database';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class PostsService {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
  ) {}

  async findByThread(threadId: string, page: number, limit: number) {
    const [posts, total] = await Promise.all([
      this.prisma.post.findMany({
        where: { threadId, isDeleted: false },
        include: {
          author: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatar: true,
              role: true,
              reputation: true,
              postCount: true,
            },
          },
          reactions: true,
          _count: { select: { reactions: true } },
        },
        orderBy: { createdAt: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.post.count({ where: { threadId, isDeleted: false } }),
    ]);

    return { data: posts, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async create(userId: string, dto: CreatePostDto) {
    const thread = await this.prisma.thread.findUnique({
      where: { id: dto.threadId },
      include: { subscriptions: { include: { user: { select: { id: true, email: true } } } } },
    });
    if (!thread) throw new NotFoundException('Thread not found');
    if (thread.status === ThreadStatus.LOCKED) {
      throw new BadRequestException('Thread is locked');
    }

    const post = await this.prisma.$transaction(async (tx) => {
      const p = await tx.post.create({
        data: { threadId: dto.threadId, authorId: userId, content: dto.content },
        include: {
          author: { select: { id: true, username: true, displayName: true, avatar: true } },
        },
      });

      await tx.thread.update({
        where: { id: dto.threadId },
        data: {
          replyCount: { increment: 1 },
          lastPostAt: new Date(),
          lastPostBy: userId,
        },
      });

      await tx.forum.update({
        where: { id: thread.forumId },
        data: { postCount: { increment: 1 } },
      });

      await tx.user.update({
        where: { id: userId },
        data: { postCount: { increment: 1 } },
      });

      return p;
    });

    await this.notifications.notifyThreadSubscribers(
      thread,
      userId,
      post.id,
      'THREAD_REPLY',
    );

    return post;
  }

  async update(postId: string, userId: string, role: Role, dto: UpdatePostDto) {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post || post.isDeleted) throw new NotFoundException('Post not found');

    const canEdit =
      post.authorId === userId ||
      role === Role.MODERATOR ||
      role === Role.ADMINISTRATOR;
    if (!canEdit) throw new ForbiddenException('Cannot edit this post');

    await this.prisma.postVersion.create({
      data: { postId, authorId: userId, content: post.content },
    });

    return this.prisma.post.update({
      where: { id: postId },
      data: { content: dto.content, isEdited: true },
    });
  }

  async delete(postId: string, userId: string, role: Role) {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post || post.isDeleted) throw new NotFoundException('Post not found');

    const canDelete =
      post.authorId === userId ||
      role === Role.MODERATOR ||
      role === Role.ADMINISTRATOR;
    if (!canDelete) throw new ForbiddenException('Cannot delete this post');

    return this.prisma.post.update({
      where: { id: postId },
      data: { isDeleted: true, content: '[deleted]' },
    });
  }

  async getVersions(postId: string) {
    return this.prisma.postVersion.findMany({
      where: { postId },
      include: { author: { select: { id: true, username: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }
}
