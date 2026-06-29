import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MessagesService {
  constructor(private prisma: PrismaService) {}

  async send(senderId: string, recipientId: string, content: string) {
    const block = await this.prisma.userBlock.findFirst({
      where: {
        OR: [
          { blockerId: recipientId, blockedId: senderId },
          { blockerId: senderId, blockedId: recipientId },
        ],
      },
    });
    if (block) throw new ForbiddenException('Cannot send message');

    return this.prisma.directMessage.create({
      data: { senderId, recipientId, content },
    });
  }

  async getConversations(userId: string) {
    const messages = await this.prisma.directMessage.findMany({
      where: {
        OR: [{ senderId: userId }, { recipientId: userId }],
        isDeleted: false,
      },
      include: {
        sender: { select: { id: true, username: true, displayName: true, avatar: true } },
        recipient: { select: { id: true, username: true, displayName: true, avatar: true } },
      },
      orderBy: { createdAt: 'desc' },
      distinct: ['senderId', 'recipientId'],
    });
    return messages;
  }

  async getConversation(userId: string, otherId: string, page: number, limit: number) {
    const [messages, total] = await Promise.all([
      this.prisma.directMessage.findMany({
        where: {
          OR: [
            { senderId: userId, recipientId: otherId },
            { senderId: otherId, recipientId: userId },
          ],
          isDeleted: false,
        },
        orderBy: { createdAt: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.directMessage.count({
        where: {
          OR: [
            { senderId: userId, recipientId: otherId },
            { senderId: otherId, recipientId: userId },
          ],
          isDeleted: false,
        },
      }),
    ]);

    await this.prisma.directMessage.updateMany({
      where: { recipientId: userId, senderId: otherId, isRead: false },
      data: { isRead: true },
    });

    return { data: messages, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async block(blockerId: string, blockedId: string) {
    return this.prisma.userBlock.upsert({
      where: { blockerId_blockedId: { blockerId, blockedId } },
      update: {},
      create: { blockerId, blockedId },
    });
  }

  async unblock(blockerId: string, blockedId: string) {
    return this.prisma.userBlock.deleteMany({ where: { blockerId, blockedId } });
  }
}
