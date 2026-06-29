import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SearchService {
  constructor(private prisma: PrismaService) {}

  async search(query: string, type: string, page: number, limit: number) {
    const skip = (page - 1) * limit;

    if (type === 'users') {
      const [results, total] = await Promise.all([
        this.prisma.user.findMany({
          where: {
            OR: [
              { username: { contains: query, mode: 'insensitive' } },
              { displayName: { contains: query, mode: 'insensitive' } },
            ],
          },
          select: { id: true, username: true, displayName: true, avatar: true, role: true },
          skip,
          take: limit,
        }),
        this.prisma.user.count({
          where: {
            OR: [
              { username: { contains: query, mode: 'insensitive' } },
              { displayName: { contains: query, mode: 'insensitive' } },
            ],
          },
        }),
      ]);
      return { data: results, meta: { total, page, limit, type } };
    }

    if (type === 'posts') {
      const [results, total] = await Promise.all([
        this.prisma.post.findMany({
          where: {
            content: { contains: query, mode: 'insensitive' },
            isDeleted: false,
          },
          include: {
            author: { select: { id: true, username: true } },
            thread: { select: { id: true, title: true, slug: true } },
          },
          skip,
          take: limit,
        }),
        this.prisma.post.count({
          where: { content: { contains: query, mode: 'insensitive' }, isDeleted: false },
        }),
      ]);
      return { data: results, meta: { total, page, limit, type } };
    }

    const [results, total] = await Promise.all([
      this.prisma.thread.findMany({
        where: {
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { tags: { some: { tag: { name: { contains: query, mode: 'insensitive' } } } } },
          ],
          status: { not: 'DELETED' },
        },
        include: {
          author: { select: { id: true, username: true, displayName: true } },
          forum: { select: { id: true, name: true, slug: true } },
          tags: { include: { tag: true } },
          _count: { select: { posts: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.thread.count({
        where: {
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
          ],
          status: { not: 'DELETED' },
        },
      }),
    ]);

    return { data: results, meta: { total, page, limit, type: 'threads' } };
  }
}
