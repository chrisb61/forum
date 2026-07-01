import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOpportunityDto } from './dto/create-opportunity.dto';

@Injectable()
export class OpportunitiesService {
  constructor(private prisma: PrismaService) {}

  async findAll(type?: string, sector?: string, page = 1, limit = 20) {
    const where: any = { status: 'OPEN' };
    if (type) where.type = type;
    if (sector) where.sectors = { has: sector };

    const [items, total] = await Promise.all([
      this.prisma.boardOpportunity.findMany({
        where,
        include: {
          postedBy: { select: { id: true, username: true, displayName: true, avatar: true } },
          _count: { select: { expressions: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.boardOpportunity.count({ where }),
    ]);

    return { items, total, page, limit, pages: Math.ceil(total / limit) };
  }

  async findOne(id: string, userId?: string) {
    const opp = await this.prisma.boardOpportunity.findUnique({
      where: { id },
      include: {
        postedBy: { select: { id: true, username: true, displayName: true, avatar: true } },
        _count: { select: { expressions: true } },
      },
    });
    if (!opp) throw new NotFoundException('Opportunity not found');

    let hasExpressed = false;
    if (userId) {
      const expr = await this.prisma.opportunityExpression.findUnique({
        where: { opportunityId_userId: { opportunityId: id, userId } },
      });
      hasExpressed = !!expr;
    }

    return { ...opp, hasExpressed };
  }

  async create(userId: string, dto: CreateOpportunityDto) {
    return this.prisma.boardOpportunity.create({
      data: {
        postedById: userId,
        title: dto.title,
        organisation: dto.organisation,
        type: dto.type as any,
        description: dto.description,
        requirements: dto.requirements,
        sectors: dto.sectors ?? [],
        location: dto.location,
        remuneration: dto.remuneration,
        timeCommitment: dto.timeCommitment,
        closingDate: dto.closingDate ? new Date(dto.closingDate) : undefined,
        isAnonymous: dto.isAnonymous ?? false,
      },
    });
  }

  async expressInterest(opportunityId: string, userId: string, message?: string) {
    const opp = await this.prisma.boardOpportunity.findUnique({ where: { id: opportunityId } });
    if (!opp) throw new NotFoundException('Opportunity not found');
    if (opp.postedById === userId) throw new ForbiddenException('Cannot express interest in your own opportunity');

    return this.prisma.opportunityExpression.upsert({
      where: { opportunityId_userId: { opportunityId, userId } },
      create: { opportunityId, userId, message },
      update: { message },
    });
  }

  async withdrawInterest(opportunityId: string, userId: string) {
    await this.prisma.opportunityExpression.deleteMany({
      where: { opportunityId, userId },
    });
  }

  async close(id: string, userId: string) {
    const opp = await this.prisma.boardOpportunity.findUnique({ where: { id } });
    if (!opp) throw new NotFoundException('Opportunity not found');
    if (opp.postedById !== userId) throw new ForbiddenException();
    return this.prisma.boardOpportunity.update({ where: { id }, data: { status: 'CLOSED' } });
  }

  async getMyOpportunities(userId: string) {
    return this.prisma.boardOpportunity.findMany({
      where: { postedById: userId },
      include: { _count: { select: { expressions: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getExpressions(opportunityId: string, userId: string) {
    const opp = await this.prisma.boardOpportunity.findUnique({ where: { id: opportunityId } });
    if (!opp) throw new NotFoundException();
    if (opp.postedById !== userId) throw new ForbiddenException();

    return this.prisma.opportunityExpression.findMany({
      where: { opportunityId },
      include: {
        user: {
          select: { id: true, username: true, displayName: true, avatar: true, reputation: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }
}
