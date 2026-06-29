import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateForumDto } from './dto/create-forum.dto';
import { CreateCategoryDto } from './dto/create-category.dto';

@Injectable()
export class ForumsService {
  constructor(private prisma: PrismaService) {}

  async getAll() {
    return this.prisma.category.findMany({
      include: {
        forums: {
          orderBy: { displayOrder: 'asc' },
          select: {
            id: true,
            name: true,
            description: true,
            slug: true,
            threadCount: true,
            postCount: true,
            isPrivate: true,
          },
        },
      },
      orderBy: { displayOrder: 'asc' },
    });
  }

  async findOne(slug: string) {
    const forum = await this.prisma.forum.findUnique({
      where: { slug },
      include: { category: true },
    });
    if (!forum) throw new NotFoundException('Forum not found');
    return forum;
  }

  async createCategory(dto: CreateCategoryDto) {
    return this.prisma.category.create({ data: dto });
  }

  async createForum(dto: CreateForumDto) {
    const slugify = (await import('slugify')).default;
    const slug = slugify(dto.name, { lower: true, strict: true });
    return this.prisma.forum.create({ data: { ...dto, slug } });
  }

  async updateForum(id: string, data: Partial<CreateForumDto>) {
    return this.prisma.forum.update({ where: { id }, data });
  }

  async deleteForum(id: string) {
    return this.prisma.forum.delete({ where: { id } });
  }
}
