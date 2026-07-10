import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CoursesService {
  constructor(private prisma: PrismaService) {}

  async create(providerId: string, data: {
    title: string;
    providerName: string;
    description: string;
    isExternalProvider: boolean;
    externalUrl?: string;
    price?: string;
    deliveryMode?: string;
    startDate?: string;
    sectors?: string[];
  }) {
    return this.prisma.courseListing.create({
      data: {
        providerId,
        title: data.title,
        providerName: data.providerName,
        description: data.description,
        isExternalProvider: data.isExternalProvider,
        externalUrl: data.externalUrl,
        price: data.price,
        deliveryMode: data.deliveryMode,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        sectors: data.sectors ?? [],
        status: 'PENDING',
      },
      include: { provider: { select: { id: true, username: true, displayName: true } } },
    });
  }

  async list(approved = true) {
    return this.prisma.courseListing.findMany({
      where: { status: approved ? 'APPROVED' : undefined },
      include: { provider: { select: { id: true, username: true, displayName: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async listPending() {
    return this.prisma.courseListing.findMany({
      where: { status: 'PENDING' },
      include: { provider: { select: { id: true, username: true, displayName: true, memberType: true } } },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findOne(id: string) {
    const course = await this.prisma.courseListing.findUnique({
      where: { id },
      include: { provider: { select: { id: true, username: true, displayName: true } } },
    });
    if (!course) throw new NotFoundException('Course not found');
    return course;
  }

  async moderate(id: string, action: 'APPROVED' | 'REJECTED', commissionUrl?: string) {
    return this.prisma.courseListing.update({
      where: { id },
      data: { status: action, commissionUrl },
    });
  }
}
