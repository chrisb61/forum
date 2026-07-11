import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UpgradeService {
  constructor(private prisma: PrismaService) {}

  async apply(
    userId: string,
    currentMemberType: string,
    data: {
      jobTitle?: string;
      employer?: string;
      yearsExperience?: number;
      qualifications?: string;
      linkedIn?: string;
      statement?: string;
      targetType: string;
    },
  ) {
    if (currentMemberType !== 'STUDENT') {
      throw new BadRequestException('Only Student members can submit an upgrade application.');
    }

    const existing = await this.prisma.upgradeApplication.findFirst({
      where: { userId, status: 'PENDING' },
    });
    if (existing) {
      throw new BadRequestException('You already have a pending upgrade application. Please wait for it to be reviewed.');
    }

    return this.prisma.upgradeApplication.create({
      data: {
        userId,
        currentType: currentMemberType,
        targetType: data.targetType || 'PROFESSIONAL',
        jobTitle: data.jobTitle,
        employer: data.employer,
        yearsExperience: data.yearsExperience ? Number(data.yearsExperience) : undefined,
        qualifications: data.qualifications,
        linkedIn: data.linkedIn,
        statement: data.statement,
        status: 'PENDING',
      },
    });
  }

  async myApplications(userId: string) {
    return this.prisma.upgradeApplication.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async listPending() {
    return this.prisma.upgradeApplication.findMany({
      where: { status: 'PENDING' },
      orderBy: { createdAt: 'asc' },
    });
  }

  async listAll() {
    const applications = await this.prisma.upgradeApplication.findMany({
      orderBy: { createdAt: 'desc' },
    });

    // Enrich with user data
    const userIds = [...new Set(applications.map((a) => a.userId))];
    const users = await this.prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, username: true, displayName: true, email: true, memberType: true },
    });
    const userMap = Object.fromEntries(users.map((u) => [u.id, u]));

    return applications.map((a) => ({ ...a, user: userMap[a.userId] }));
  }

  async review(
    applicationId: string,
    action: 'APPROVED' | 'REJECTED',
    reviewerNote?: string,
  ) {
    const application = await this.prisma.upgradeApplication.findUnique({
      where: { id: applicationId },
    });
    if (!application) throw new NotFoundException('Application not found');
    if (application.status !== 'PENDING') {
      throw new BadRequestException('Application has already been reviewed');
    }

    await this.prisma.upgradeApplication.update({
      where: { id: applicationId },
      data: { status: action, reviewerNote },
    });

    if (action === 'APPROVED') {
      await this.prisma.user.update({
        where: { id: application.userId },
        data: { memberType: application.targetType as any },
      });
    }

    return { ok: true, action };
  }
}
