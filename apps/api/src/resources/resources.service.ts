import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ResourceStatus } from '@prisma/client';

// FCA Financial Promotions Order 2005 — terms that trigger compliance review
const FINANCIAL_KEYWORDS = [
  'invest', 'investment', 'return', 'profit', 'guaranteed', 'income', 'yield',
  'portfolio', 'fund', 'bond', 'equity', 'shares', 'dividend', 'pension',
  'annuity', 'isa', 'sipp', 'financial advice', 'regulated', 'fca',
  'capital growth', 'tax-free', 'risk-free',
];

function scanForFinancialContent(text: string): boolean {
  const lower = text.toLowerCase();
  return FINANCIAL_KEYWORDS.some((kw) => lower.includes(kw));
}

@Injectable()
export class ResourcesService {
  constructor(private prisma: PrismaService) {}

  async upload(
    uploaderId: string,
    data: {
      title: string;
      description?: string;
      type: string;
      embedUrl?: string;
      category?: string;
      tags?: string[];
      ipDeclared: boolean;
    },
    file?: Express.Multer.File,
  ) {
    if (!data.ipDeclared) {
      throw new BadRequestException('You must declare that you own or have the right to share this content.');
    }

    if (data.type === 'VIDEO_EMBED' && !data.embedUrl) {
      throw new BadRequestException('An embed URL is required for video content.');
    }

    if (data.type !== 'VIDEO_EMBED' && !file) {
      throw new BadRequestException('A file is required for this content type.');
    }

    const textToScan = `${data.title} ${data.description ?? ''}`;
    const financialFlagged = scanForFinancialContent(textToScan);

    return this.prisma.resource.create({
      data: {
        uploaderId,
        title: data.title,
        description: data.description,
        type: data.type as any,
        status: 'PENDING',
        fileUrl: file ? `/uploads/library/${file.filename}` : undefined,
        filename: file?.originalname,
        fileSize: file?.size,
        mimeType: file?.mimetype,
        embedUrl: data.embedUrl,
        category: data.category,
        tags: data.tags ?? [],
        financialFlagged,
        hasFinancialDisclaimer: financialFlagged,
        ipDeclared: data.ipDeclared,
      },
      include: { uploader: { select: { id: true, username: true, displayName: true } } },
    });
  }

  async list(filters: { status?: ResourceStatus; type?: string; category?: string }) {
    return this.prisma.resource.findMany({
      where: {
        status: filters.status ?? 'APPROVED',
        type: filters.type ? (filters.type as any) : undefined,
        category: filters.category,
      },
      include: {
        uploader: { select: { id: true, username: true, displayName: true, avatar: true } },
        _count: { select: { downloads: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async listPending() {
    return this.prisma.resource.findMany({
      where: { status: 'PENDING' },
      include: {
        uploader: { select: { id: true, username: true, displayName: true, memberType: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findOne(id: string) {
    const resource = await this.prisma.resource.findUnique({
      where: { id },
      include: {
        uploader: { select: { id: true, username: true, displayName: true, avatar: true } },
        _count: { select: { downloads: true } },
      },
    });
    if (!resource) throw new NotFoundException('Resource not found');
    return resource;
  }

  async trackDownload(resourceId: string, downloaderId: string) {
    const resource = await this.findOne(resourceId);
    if (resource.status !== 'APPROVED') throw new ForbiddenException('Resource not available');

    await this.prisma.$transaction([
      this.prisma.resourceDownload.upsert({
        where: {
          resourceId_downloaderId: { resourceId, downloaderId },
        },
        create: { resourceId, downloaderId },
        update: {},
      }),
      this.prisma.resource.update({
        where: { id: resourceId },
        data: { downloadCount: { increment: 1 } },
      }),
    ]);

    return { ok: true };
  }

  async moderate(
    resourceId: string,
    moderatorId: string,
    action: 'APPROVED' | 'REJECTED' | 'FLAGGED',
    note?: string,
  ) {
    return this.prisma.resource.update({
      where: { id: resourceId },
      data: {
        status: action,
        moderatorId,
        moderatorNote: note,
        reviewedAt: new Date(),
      },
    });
  }

  async myDownloadStats(userId: string) {
    return this.prisma.resource.findMany({
      where: { uploaderId: userId, status: 'APPROVED' },
      select: {
        id: true,
        title: true,
        downloadCount: true,
        viewCount: true,
        createdAt: true,
        downloads: {
          include: {
            downloader: { select: { id: true, username: true, displayName: true } },
          },
          orderBy: { createdAt: 'desc' },
          take: 50,
        },
      },
    });
  }

  async myUploads(userId: string) {
    return this.prisma.resource.findMany({
      where: { uploaderId: userId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
