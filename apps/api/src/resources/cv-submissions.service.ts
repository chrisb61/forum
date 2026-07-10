import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CvSubmissionsService {
  constructor(private prisma: PrismaService) {}

  async submit(userId: string, file: Express.Multer.File, notes?: string) {
    return this.prisma.cvSubmission.create({
      data: {
        userId,
        fileUrl: `/uploads/cv-submissions/${file.filename}`,
        filename: file.originalname,
        notes,
        status: 'RECEIVED',
      },
    });
  }

  async mySubmissions(userId: string) {
    return this.prisma.cvSubmission.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async listAll() {
    return this.prisma.cvSubmission.findMany({
      include: { user: { select: { id: true, username: true, displayName: true, email: true, memberType: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateStatus(id: string, status: string, reviewerNote?: string) {
    const submission = await this.prisma.cvSubmission.findUnique({ where: { id } });
    if (!submission) throw new NotFoundException('Submission not found');
    return this.prisma.cvSubmission.update({
      where: { id },
      data: { status: status as any, reviewerNote },
    });
  }
}
