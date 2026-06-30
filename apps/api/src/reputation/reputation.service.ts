import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export const POINTS = {
  POST_CREATED: 5,
  THREAD_CREATED: 10,
  REACTION_LIKE: 2,
  REACTION_HELPFUL: 5,
  REACTION_INSIGHTFUL: 8,
  REACTION_FUNNY: 1,
};

export const LEVELS = [
  { name: 'Newcomer',    min: 0 },
  { name: 'Contributor', min: 100 },
  { name: 'Established', min: 500 },
  { name: 'Expert',      min: 1500 },
  { name: 'Authority',   min: 5000 },
  { name: 'Luminary',   min: 10000 },
];

export function getLevel(reputation: number) {
  let level = LEVELS[0];
  for (const l of LEVELS) {
    if (reputation >= l.min) level = l;
  }
  const idx = LEVELS.indexOf(level);
  const next = LEVELS[idx + 1] ?? null;
  return { level, next, idx };
}

const BADGE_CHECKS: {
  name: string;
  description: string;
  icon: string;
  color: string;
  check: (stats: { postCount: number; reputation: number; insightfulCount: number; helpfulCount: number }) => boolean;
}[] = [
  {
    name: 'First Contribution',
    description: 'Made your first post in the network.',
    icon: '✍️',
    color: '#2dd4bf',
    check: (s) => s.postCount >= 1,
  },
  {
    name: 'Conversation Starter',
    description: 'Started your first discussion thread.',
    icon: '💬',
    color: '#2dd4bf',
    check: (s) => s.postCount >= 1,
  },
  {
    name: 'Prolific Voice',
    description: 'Made 50 contributions to the network.',
    icon: '📢',
    color: '#f59e0b',
    check: (s) => s.postCount >= 50,
  },
  {
    name: 'Insightful',
    description: 'Received 10 Insightful reactions from peers.',
    icon: '💡',
    color: '#8b5cf6',
    check: (s) => s.insightfulCount >= 10,
  },
  {
    name: 'Trusted Advisor',
    description: 'Received 25 Helpful reactions from the community.',
    icon: '🤝',
    color: '#10b981',
    check: (s) => s.helpfulCount >= 25,
  },
  {
    name: 'Rising Authority',
    description: 'Reached 500 reputation points.',
    icon: '⭐',
    color: '#f59e0b',
    check: (s) => s.reputation >= 500,
  },
  {
    name: 'Expert Voice',
    description: 'Reached 1,500 reputation points.',
    icon: '🏆',
    color: '#ef4444',
    check: (s) => s.reputation >= 1500,
  },
];

@Injectable()
export class ReputationService {
  private readonly logger = new Logger(ReputationService.name);

  constructor(private prisma: PrismaService) {}

  async awardPoints(userId: string, points: number, reason: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { reputation: { increment: points } },
    });
    this.logger.log(`+${points} pts to user ${userId} (${reason})`);
    await this.checkAndAwardBadges(userId);
  }

  async checkAndAwardBadges(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { reputation: true, postCount: true, badges: { select: { badgeId: true } } },
    });
    if (!user) return;

    const insightfulCount = await this.prisma.reaction.count({
      where: { post: { authorId: userId }, type: 'INSIGHTFUL' },
    });
    const helpfulCount = await this.prisma.reaction.count({
      where: { post: { authorId: userId }, type: 'HELPFUL' },
    });

    const stats = {
      postCount: user.postCount,
      reputation: user.reputation,
      insightfulCount,
      helpfulCount,
    };

    const earnedBadgeIds = new Set(user.badges.map((b) => b.badgeId));

    for (const def of BADGE_CHECKS) {
      if (!def.check(stats)) continue;

      let badge = await this.prisma.badge.findFirst({ where: { name: def.name } });
      if (!badge) {
        badge = await this.prisma.badge.create({
          data: {
            name: def.name,
            description: def.description,
            icon: def.icon,
            color: def.color,
          },
        });
      }

      if (!earnedBadgeIds.has(badge.id)) {
        await this.prisma.userBadge.create({
          data: { userId, badgeId: badge.id },
        });
        await this.prisma.notification.create({
          data: {
            userId,
            type: 'BADGE_AWARDED',
            payload: { badgeName: def.name, badgeIcon: def.icon },
          },
        });
        this.logger.log(`Badge "${def.name}" awarded to user ${userId}`);
      }
    }
  }

  async getLeaderboard(limit = 20) {
    const users = await this.prisma.user.findMany({
      where: { isBanned: false, isSuspended: false },
      select: {
        id: true,
        username: true,
        displayName: true,
        avatar: true,
        reputation: true,
        postCount: true,
        badges: {
          include: { badge: true },
          orderBy: { awardedAt: 'asc' },
        },
      },
      orderBy: { reputation: 'desc' },
      take: limit,
    });

    return users.map((u, i) => ({
      ...u,
      rank: i + 1,
      level: getLevel(u.reputation).level.name,
    }));
  }

  async getUserReputation(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        reputation: true,
        postCount: true,
        badges: { include: { badge: true }, orderBy: { awardedAt: 'asc' } },
      },
    });
    if (!user) return null;

    const { level, next, idx } = getLevel(user.reputation);
    const progress = next
      ? Math.round(((user.reputation - level.min) / (next.min - level.min)) * 100)
      : 100;

    return {
      reputation: user.reputation,
      postCount: user.postCount,
      level: level.name,
      levelIndex: idx,
      nextLevel: next?.name ?? null,
      nextLevelAt: next?.min ?? null,
      progress,
      badges: user.badges,
    };
  }
}
