import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MemberType } from '@prisma/client';

@Injectable()
export class GroupsService {
  constructor(private prisma: PrismaService) {}

  async create(ownerId: string, ownerMemberType: MemberType, data: {
    name: string;
    description?: string;
    isDiscoverable?: boolean;
  }) {
    if (ownerMemberType === MemberType.STUDENT) {
      throw new ForbiddenException('Students cannot create groups. Upgrade your membership to Professional to unlock this feature.');
    }

    return this.prisma.group.create({
      data: {
        name: data.name,
        description: data.description,
        ownerId,
        isDiscoverable: data.isDiscoverable ?? true,
        members: {
          create: {
            userId: ownerId,
            role: 'OWNER',
            status: 'ACTIVE',
          },
        },
      },
      include: {
        owner: { select: { id: true, username: true, displayName: true } },
        _count: { select: { members: true, resources: true } },
      },
    });
  }

  async listDiscoverable() {
    return this.prisma.group.findMany({
      where: { isDiscoverable: true },
      include: {
        owner: { select: { id: true, username: true, displayName: true, avatar: true } },
        _count: { select: { members: true, resources: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async myGroups(userId: string) {
    return this.prisma.group.findMany({
      where: {
        members: { some: { userId, status: 'ACTIVE' } },
      },
      include: {
        owner: { select: { id: true, username: true, displayName: true } },
        _count: { select: { members: true, resources: true } },
        members: {
          where: { userId },
          select: { role: true, status: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(groupId: string, userId: string) {
    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
      include: {
        owner: { select: { id: true, username: true, displayName: true, avatar: true } },
        members: {
          where: { status: 'ACTIVE' },
          include: {
            user: { select: { id: true, username: true, displayName: true, avatar: true, memberType: true } },
          },
        },
        _count: { select: { resources: true } },
      },
    });
    if (!group) throw new NotFoundException('Group not found');

    const isMember = group.members.some((m) => m.user.id === userId);
    if (!group.isDiscoverable && !isMember) {
      throw new ForbiddenException('This group is private');
    }

    return { ...group, isMember, isOwner: group.ownerId === userId };
  }

  async requestJoin(groupId: string, userId: string) {
    const group = await this.prisma.group.findUnique({ where: { id: groupId } });
    if (!group) throw new NotFoundException('Group not found');

    const existing = await this.prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId, userId } },
    });
    if (existing) throw new BadRequestException('Already a member or request pending');

    return this.prisma.groupMember.create({
      data: { groupId, userId, role: 'MEMBER', status: 'PENDING' },
    });
  }

  async invite(groupId: string, ownerId: string, inviteeUsername: string) {
    const group = await this.prisma.group.findUnique({ where: { id: groupId } });
    if (!group) throw new NotFoundException('Group not found');
    if (group.ownerId !== ownerId) throw new ForbiddenException('Only the group owner can invite members');

    const invitee = await this.prisma.user.findUnique({ where: { username: inviteeUsername } });
    if (!invitee) throw new NotFoundException(`User "${inviteeUsername}" not found`);

    const existing = await this.prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId, userId: invitee.id } },
    });
    if (existing) throw new BadRequestException('User is already a member or has a pending request');

    return this.prisma.groupMember.create({
      data: { groupId, userId: invitee.id, role: 'MEMBER', status: 'ACTIVE' },
    });
  }

  async approveOrReject(groupId: string, ownerId: string, memberId: string, action: 'ACTIVE' | 'REJECTED') {
    const group = await this.prisma.group.findUnique({ where: { id: groupId } });
    if (!group) throw new NotFoundException('Group not found');
    if (group.ownerId !== ownerId) throw new ForbiddenException('Only the group owner can manage members');

    return this.prisma.groupMember.update({
      where: { groupId_userId: { groupId, userId: memberId } },
      data: { status: action },
    });
  }

  async removeMember(groupId: string, ownerId: string, memberId: string) {
    const group = await this.prisma.group.findUnique({ where: { id: groupId } });
    if (!group) throw new NotFoundException('Group not found');
    if (group.ownerId !== ownerId && ownerId !== memberId) {
      throw new ForbiddenException('Only the group owner can remove members');
    }

    return this.prisma.groupMember.delete({
      where: { groupId_userId: { groupId, userId: memberId } },
    });
  }

  async pendingRequests(groupId: string, ownerId: string) {
    const group = await this.prisma.group.findUnique({ where: { id: groupId } });
    if (!group) throw new NotFoundException('Group not found');
    if (group.ownerId !== ownerId) throw new ForbiddenException('Only the group owner can view pending requests');

    return this.prisma.groupMember.findMany({
      where: { groupId, status: 'PENDING' },
      include: {
        user: { select: { id: true, username: true, displayName: true, avatar: true, memberType: true } },
      },
    });
  }

  async groupResources(groupId: string, userId: string) {
    const isMember = await this.prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId, userId } },
    });
    if (!isMember || isMember.status !== 'ACTIVE') throw new ForbiddenException('You are not a member of this group');

    return this.prisma.resource.findMany({
      where: { groupId, status: 'APPROVED' },
      include: {
        uploader: { select: { id: true, username: true, displayName: true } },
        _count: { select: { downloads: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
