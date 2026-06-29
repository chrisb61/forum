import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ReportReason, ReportStatus } from '@forum/database';

export class CreateReportDto {
  targetType: string;
  targetId: string;
  reason: ReportReason;
  details?: string;
}

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async create(reporterId: string, dto: CreateReportDto) {
    return this.prisma.report.create({
      data: { reporterId, ...dto },
    });
  }

  async getAll(status?: ReportStatus, page = 1, limit = 20) {
    const where = status ? { status } : {};
    const [reports, total] = await Promise.all([
      this.prisma.report.findMany({
        where,
        include: {
          reporter: { select: { id: true, username: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.report.count({ where }),
    ]);
    return { data: reports, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async resolve(reportId: string, moderatorId: string, status: ReportStatus) {
    return this.prisma.report.update({
      where: { id: reportId },
      data: { status, resolvedBy: moderatorId, resolvedAt: new Date() },
    });
  }
}
