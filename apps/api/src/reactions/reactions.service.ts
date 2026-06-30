import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ReactionType } from '@forum/database';
import { ReputationService, POINTS } from '../reputation/reputation.service';

@Injectable()
export class ReactionsService {
  constructor(
    private prisma: PrismaService,
    private reputation: ReputationService,
  ) {}

  async toggle(userId: string, postId: string, type: ReactionType) {
    const existing = await this.prisma.reaction.findUnique({
      where: { userId_postId_type: { userId, postId, type } },
    });

    if (existing) {
      await this.prisma.reaction.delete({ where: { id: existing.id } });
      return { action: 'removed', type };
    }

    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post || post.isDeleted) throw new NotFoundException('Post not found');

    await this.prisma.reaction.create({ data: { userId, postId, type } });

    if (post.authorId !== userId) {
      const pointsMap: Record<ReactionType, number> = {
        LIKE: POINTS.REACTION_LIKE,
        HELPFUL: POINTS.REACTION_HELPFUL,
        INSIGHTFUL: POINTS.REACTION_INSIGHTFUL,
        FUNNY: POINTS.REACTION_FUNNY,
      };
      await this.reputation.awardPoints(
        post.authorId,
        pointsMap[type],
        `reaction ${type} received`,
      );
    }

    return { action: 'added', type };
  }

  async getForPost(postId: string) {
    const reactions = await this.prisma.reaction.groupBy({
      by: ['type'],
      where: { postId },
      _count: { type: true },
    });
    return reactions.reduce(
      (acc, r) => ({ ...acc, [r.type]: r._count.type }),
      {} as Record<ReactionType, number>,
    );
  }
}
