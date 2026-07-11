import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TalentService {
  constructor(private prisma: PrismaService) {}

  async listProfiles(filters: {
    graduationYear?: number;
    placementAvailable?: boolean;
    esgInterest?: string;
    location?: string;
    search?: string;
  }) {
    return this.prisma.studentProfile.findMany({
      where: {
        talentVisible: true,
        user: { memberType: 'STUDENT' },
        ...(filters.graduationYear ? { graduationYear: filters.graduationYear } : {}),
        ...(filters.placementAvailable !== undefined ? { placementAvailable: filters.placementAvailable } : {}),
        ...(filters.esgInterest ? { esgInterests: { has: filters.esgInterest } } : {}),
        ...(filters.location ? { location: { contains: filters.location, mode: 'insensitive' } } : {}),
        ...(filters.search ? {
          OR: [
            { university: { contains: filters.search, mode: 'insensitive' } },
            { degree: { contains: filters.search, mode: 'insensitive' } },
            { bio: { contains: filters.search, mode: 'insensitive' } },
            { studyArea: { contains: filters.search, mode: 'insensitive' } },
            { user: { displayName: { contains: filters.search, mode: 'insensitive' } } },
          ],
        } : {}),
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
            email: true,
          },
        },
        _count: { select: { talentExpressions: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getProfile(username: string) {
    const user = await this.prisma.user.findUnique({
      where: { username },
      include: {
        studentProfile: {
          include: {
            _count: { select: { talentExpressions: true } },
          },
        },
      },
    });

    if (!user || !user.studentProfile) throw new NotFoundException('Talent profile not found');
    if (!user.studentProfile.talentVisible) throw new ForbiddenException('This profile is not publicly visible');

    return {
      ...user.studentProfile,
      user: {
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        avatar: user.avatar,
        email: user.studentProfile.showEmail ? user.email : undefined,
      },
    };
  }

  async expressInterest(studentUsername: string, corporateId: string, message?: string) {
    const student = await this.prisma.user.findUnique({
      where: { username: studentUsername },
      include: { studentProfile: true },
    });

    if (!student?.studentProfile) throw new NotFoundException('Student profile not found');
    if (!student.studentProfile.talentVisible) throw new ForbiddenException('This profile is not visible');

    const corporate = await this.prisma.user.findUnique({ where: { id: corporateId } });
    if (!corporate || !['CORPORATE', 'PROFESSIONAL', 'ADMINISTRATOR'].includes(corporate.memberType as string)) {
      throw new ForbiddenException('Only Corporate and Professional members can express interest in candidates.');
    }

    const existing = await this.prisma.talentExpression.findUnique({
      where: { studentId_corporateId: { studentId: student.id, corporateId } },
    });
    if (existing) throw new BadRequestException('You have already expressed interest in this candidate.');

    return this.prisma.talentExpression.create({
      data: { studentId: student.id, corporateId, message },
    });
  }

  async myInterestReceived(studentUserId: string) {
    return this.prisma.talentExpression.findMany({
      where: { studentId: studentUserId },
      include: {
        corporate: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
            memberType: true,
            corporateProfile: {
              select: { companyName: true, sector: true, headquarters: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async myInterestGiven(corporateId: string) {
    return this.prisma.talentExpression.findMany({
      where: { corporateId },
      include: {
        student: {
          include: {
            user: {
              select: { id: true, username: true, displayName: true, avatar: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async upsertMyProfile(userId: string, data: any) {
    return this.prisma.studentProfile.upsert({
      where: { userId },
      create: {
        userId,
        university: data.university,
        degree: data.degree,
        graduationYear: data.graduationYear ? Number(data.graduationYear) : undefined,
        studyArea: data.studyArea,
        dissertationTopic: data.dissertationTopic,
        placementAvailable: data.placementAvailable ?? true,
        availableFrom: data.availableFrom,
        linkedIn: data.linkedIn,
        portfolioUrl: data.portfolioUrl,
        location: data.location,
        bio: data.bio,
        esgInterests: data.esgInterests ?? [],
        skills: data.skills ?? [],
        showEmail: data.showEmail ?? false,
        talentVisible: data.talentVisible ?? true,
      },
      update: {
        university: data.university,
        degree: data.degree,
        graduationYear: data.graduationYear ? Number(data.graduationYear) : undefined,
        studyArea: data.studyArea,
        dissertationTopic: data.dissertationTopic,
        placementAvailable: data.placementAvailable ?? true,
        availableFrom: data.availableFrom,
        linkedIn: data.linkedIn,
        portfolioUrl: data.portfolioUrl,
        location: data.location,
        bio: data.bio,
        esgInterests: data.esgInterests ?? [],
        skills: data.skills ?? [],
        showEmail: data.showEmail ?? false,
        talentVisible: data.talentVisible ?? true,
      },
    });
  }

  async getMyProfile(userId: string) {
    return this.prisma.studentProfile.findUnique({ where: { userId } });
  }
}
