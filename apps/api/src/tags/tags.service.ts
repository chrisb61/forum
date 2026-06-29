import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TagsService {
  constructor(private prisma: PrismaService) {}

  async getAll() {
    return this.prisma.tag.findMany({ orderBy: { name: 'asc' } });
  }

  async getPopular(limit = 20) {
    return this.prisma.tag.findMany({
      include: { _count: { select: { threads: true } } },
      orderBy: { threads: { _count: 'desc' } },
      take: limit,
    });
  }
}
