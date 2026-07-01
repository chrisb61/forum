import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export const ENDORSEMENT_SKILLS = [
  'GOVERNANCE', 'STRATEGIC_THINKING', 'LEADERSHIP', 'ESG_KNOWLEDGE',
  'DIGITAL_EXPERTISE', 'FINANCIAL_EXPERTISE', 'RISK_MANAGEMENT',
  'STAKEHOLDER_ENGAGEMENT', 'TRANSFORMATION', 'INVESTOR_RELATIONS',
];

@Injectable()
export class EndorsementsService {
  constructor(private prisma: PrismaService) {}

  async endorse(endorserId: string, endorseeId: string, skill: string, comment?: string) {
    if (endorserId === endorseeId) throw new ForbiddenException('Cannot endorse yourself');
    if (!ENDORSEMENT_SKILLS.includes(skill)) throw new BadRequestException('Invalid skill');

    const endorsee = await this.prisma.user.findUnique({ where: { id: endorseeId } });
    if (!endorsee) throw new NotFoundException('User not found');

    return this.prisma.endorsement.upsert({
      where: { endorserId_endorseeId_skill: { endorserId, endorseeId, skill: skill as any } },
      create: { endorserId, endorseeId, skill: skill as any, comment },
      update: { comment },
    });
  }

  async removeEndorsement(endorserId: string, endorseeId: string, skill: string) {
    await this.prisma.endorsement.deleteMany({
      where: { endorserId, endorseeId, skill: skill as any },
    });
  }

  async getForUser(endorseeId: string, requesterId?: string) {
    const endorsements = await this.prisma.endorsement.findMany({
      where: { endorseeId },
      include: {
        endorser: { select: { id: true, username: true, displayName: true, avatar: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Group by skill with counts and endorser list
    const grouped: Record<string, { skill: string; count: number; endorsers: any[]; myEndorsement: boolean }> = {};
    for (const e of endorsements) {
      if (!grouped[e.skill]) {
        grouped[e.skill] = { skill: e.skill, count: 0, endorsers: [], myEndorsement: false };
      }
      grouped[e.skill].count++;
      grouped[e.skill].endorsers.push(e.endorser);
      if (requesterId && e.endorserId === requesterId) grouped[e.skill].myEndorsement = true;
    }

    return Object.values(grouped).sort((a, b) => b.count - a.count);
  }

  async getGiven(endorserId: string) {
    return this.prisma.endorsement.findMany({
      where: { endorserId },
      include: {
        endorsee: { select: { id: true, username: true, displayName: true, avatar: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
