import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ModerationActionType } from '@forum/database';

export class ModerationActionDto {
  targetUserId?: string;
  action: ModerationActionType;
  reason: string;
  duration?: number;
}

@Injectable()
export class ModerationService {
  constructor(private prisma: PrismaService) {}

  async takeAction(moderatorId: string, dto: ModerationActionDto) {
    const action = await this.prisma.moderationAction.create({
      data: {
        moderatorId,
        targetUserId: dto.targetUserId,
        action: dto.action,
        reason: dto.reason,
        duration: dto.duration,
      },
    });

    if (dto.targetUserId) {
      switch (dto.action) {
        case ModerationActionType.SUSPEND:
          await this.prisma.user.update({
            where: { id: dto.targetUserId },
            data: {
              isSuspended: true,
              suspendedUntil: dto.duration
                ? new Date(Date.now() + dto.duration * 1000)
                : null,
            },
          });
          break;
        case ModerationActionType.BAN:
          await this.prisma.user.update({
            where: { id: dto.targetUserId },
            data: { isBanned: true },
          });
          break;
        case ModerationActionType.UNBAN:
          await this.prisma.user.update({
            where: { id: dto.targetUserId },
            data: { isBanned: false, isSuspended: false },
          });
          break;
        case ModerationActionType.UNMUTE:
          await this.prisma.user.update({
            where: { id: dto.targetUserId },
            data: { isSuspended: false, suspendedUntil: null },
          });
          break;
      }
    }

    return action;
  }

  async getAuditLog(page = 1, limit = 20) {
    const [actions, total] = await Promise.all([
      this.prisma.moderationAction.findMany({
        include: {
          moderator: { select: { id: true, username: true } },
          targetUser: { select: { id: true, username: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.moderationAction.count(),
    ]);
    return { data: actions, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }
}
