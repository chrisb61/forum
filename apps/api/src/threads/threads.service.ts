import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateThreadDto, UpdateThreadDto } from './dto/create-thread.dto';
import { Role, ThreadStatus } from '@forum/database';

@Injectable()
export class ThreadsService {
  constructor(private prisma: PrismaService) {}

  private async makeSlug(title: string): Promise<string> {
    const slugify = (await import('slugify')).default;
    const base = slugify(title, { lower: true, strict: true });
    const existing = await this.prisma.thread.count({ where: { slug: { startsWith: base } } });
    return existing === 0 ? base : `${base}-${existing}`;
  }

  async findByForum(forumId: string, page: number, limit: number) {
    const [threads, total] = await Promise.all([
      this.prisma.thread.findMany({
        where: { forumId, status: { not: ThreadStatus.DELETED } },
        include: {
          author: { select: { id: true, username: true, displayName: true, avatar: true } },
          tags: { include: { tag: true } },
          _count: { select: { posts: true } },
        },
        orderBy: [{ isPinned: 'desc' }, { lastPostAt: 'desc' }, { createdAt: 'desc' }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.thread.count({ where: { forumId, status: { not: ThreadStatus.DELETED } } }),
    ]);
    return { data: threads, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(slug: string, userId?: string) {
    const thread = await this.prisma.thread.findUnique({
      where: { slug },
      include: {
        author: { select: { id: true, username: true, displayName: true, avatar: true, role: true } },
        forum: { include: { category: true } },
        tags: { include: { tag: true } },
        poll: { include: { options: true } },
        _count: { select: { posts: true, bookmarks: true } },
      },
    });
    if (!thread) throw new NotFoundException('Thread not found');
    if (thread.status === ThreadStatus.DELETED) throw new NotFoundException('Thread not found');

    await this.prisma.thread.update({
      where: { id: thread.id },
      data: { viewCount: { increment: 1 } },
    });

    return thread;
  }

  async create(userId: string, dto: CreateThreadDto) {
    const forum = await this.prisma.forum.findUnique({ where: { id: dto.forumId } });
    if (!forum) throw new NotFoundException('Forum not found');

    const slug = await this.makeSlug(dto.title);

    const thread = await this.prisma.$transaction(async (tx) => {
      const t = await tx.thread.create({
        data: {
          forumId: dto.forumId,
          authorId: userId,
          title: dto.title,
          slug,
          type: dto.type,
          lastPostAt: new Date(),
          lastPostBy: userId,
        },
      });

      await tx.post.create({
        data: {
          threadId: t.id,
          authorId: userId,
          content: dto.content,
        },
      });

      if (dto.tags?.length) {
        const tags = await Promise.all(
          dto.tags.map((tagSlug) =>
            tx.tag.upsert({
              where: { slug: tagSlug.toLowerCase() },
              update: {},
              create: { name: tagSlug, slug: tagSlug.toLowerCase() },
            }),
          ),
        );
        await tx.threadTag.createMany({
          data: tags.map((tag) => ({ threadId: t.id, tagId: tag.id })),
          skipDuplicates: true,
        });
      }

      await tx.forum.update({
        where: { id: dto.forumId },
        data: { threadCount: { increment: 1 }, postCount: { increment: 1 } },
      });

      await tx.user.update({
        where: { id: userId },
        data: { postCount: { increment: 1 } },
      });

      return t;
    });

    return this.findOne(thread.slug);
  }

  async update(slug: string, userId: string, role: Role, dto: UpdateThreadDto) {
    const thread = await this.prisma.thread.findUnique({ where: { slug } });
    if (!thread) throw new NotFoundException('Thread not found');

    const canEdit =
      thread.authorId === userId ||
      role === Role.MODERATOR ||
      role === Role.ADMINISTRATOR;
    if (!canEdit) throw new ForbiddenException('Cannot edit this thread');

    if (dto.title) {
      const newSlug = await this.makeSlug(dto.title);
      return this.prisma.thread.update({
        where: { id: thread.id },
        data: { title: dto.title, slug: newSlug },
      });
    }
    return thread;
  }

  async lock(slug: string, lock: boolean) {
    const thread = await this.prisma.thread.findUnique({ where: { slug } });
    if (!thread) throw new NotFoundException('Thread not found');
    return this.prisma.thread.update({
      where: { id: thread.id },
      data: { status: lock ? ThreadStatus.LOCKED : ThreadStatus.OPEN },
    });
  }

  async pin(slug: string, pin: boolean) {
    const thread = await this.prisma.thread.findUnique({ where: { slug } });
    if (!thread) throw new NotFoundException('Thread not found');
    return this.prisma.thread.update({
      where: { id: thread.id },
      data: { isPinned: pin },
    });
  }

  async delete(slug: string, userId: string, role: Role) {
    const thread = await this.prisma.thread.findUnique({ where: { slug } });
    if (!thread) throw new NotFoundException('Thread not found');

    const canDelete =
      thread.authorId === userId ||
      role === Role.MODERATOR ||
      role === Role.ADMINISTRATOR;
    if (!canDelete) throw new ForbiddenException('Cannot delete this thread');

    return this.prisma.thread.update({
      where: { id: thread.id },
      data: { status: ThreadStatus.DELETED },
    });
  }

  async subscribe(threadId: string, userId: string) {
    return this.prisma.threadSubscription.upsert({
      where: { userId_threadId: { userId, threadId } },
      update: {},
      create: { userId, threadId },
    });
  }

  async unsubscribe(threadId: string, userId: string) {
    return this.prisma.threadSubscription.deleteMany({
      where: { userId, threadId },
    });
  }

  async bookmark(threadId: string, userId: string) {
    return this.prisma.bookmark.upsert({
      where: { userId_threadId: { userId, threadId } },
      update: {},
      create: { userId, threadId },
    });
  }

  async unbookmark(threadId: string, userId: string) {
    return this.prisma.bookmark.deleteMany({
      where: { userId, threadId },
    });
  }
}
