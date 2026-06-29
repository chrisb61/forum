import { PrismaClient, Role } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const adminPassword = await argon2.hash('Admin@12345');
  const admin = await prisma.user.upsert({
    where: { email: 'admin@forum.local' },
    update: {},
    create: {
      username: 'admin',
      email: 'admin@forum.local',
      passwordHash: adminPassword,
      displayName: 'Administrator',
      role: Role.ADMINISTRATOR,
      isEmailVerified: true,
    },
  });

  const modPassword = await argon2.hash('Mod@12345');
  const mod = await prisma.user.upsert({
    where: { email: 'moderator@forum.local' },
    update: {},
    create: {
      username: 'moderator',
      email: 'moderator@forum.local',
      passwordHash: modPassword,
      displayName: 'Moderator',
      role: Role.MODERATOR,
      isEmailVerified: true,
    },
  });

  const memberPassword = await argon2.hash('Member@12345');
  const member = await prisma.user.upsert({
    where: { email: 'member@forum.local' },
    update: {},
    create: {
      username: 'member1',
      email: 'member@forum.local',
      passwordHash: memberPassword,
      displayName: 'Test Member',
      role: Role.MEMBER,
      isEmailVerified: true,
    },
  });

  const generalCategory = await prisma.category.upsert({
    where: { id: 'cat-general' },
    update: {},
    create: {
      id: 'cat-general',
      name: 'General',
      description: 'General discussion topics',
      displayOrder: 1,
    },
  });

  const supportCategory = await prisma.category.upsert({
    where: { id: 'cat-support' },
    update: {},
    create: {
      id: 'cat-support',
      name: 'Support',
      description: 'Get help and support',
      displayOrder: 2,
    },
  });

  const generalForum = await prisma.forum.upsert({
    where: { slug: 'general-discussion' },
    update: {},
    create: {
      categoryId: generalCategory.id,
      name: 'General Discussion',
      description: 'Talk about anything and everything',
      slug: 'general-discussion',
      displayOrder: 1,
    },
  });

  const announcementsForum = await prisma.forum.upsert({
    where: { slug: 'announcements' },
    update: {},
    create: {
      categoryId: generalCategory.id,
      name: 'Announcements',
      description: 'Official platform announcements',
      slug: 'announcements',
      displayOrder: 2,
    },
  });

  const helpForum = await prisma.forum.upsert({
    where: { slug: 'help-support' },
    update: {},
    create: {
      categoryId: supportCategory.id,
      name: 'Help & Support',
      description: 'Ask questions and get help',
      slug: 'help-support',
      displayOrder: 1,
    },
  });

  const welcomeThread = await prisma.thread.upsert({
    where: { slug: 'welcome-to-the-forum' },
    update: {},
    create: {
      forumId: announcementsForum.id,
      authorId: admin.id,
      title: 'Welcome to the Forum!',
      slug: 'welcome-to-the-forum',
      type: 'ANNOUNCEMENT',
      isPinned: true,
    },
  });

  await prisma.post.upsert({
    where: { id: 'post-welcome-1' },
    update: {},
    create: {
      id: 'post-welcome-1',
      threadId: welcomeThread.id,
      authorId: admin.id,
      content: `# Welcome to our Community Forum!\n\nWe're thrilled to have you here. This is a place to discuss, share, and connect.\n\n## Community Guidelines\n\n- Be respectful and kind\n- No spam or self-promotion\n- Keep discussions on-topic\n- Help others when you can\n\nHappy posting!`,
    },
  });

  const tags = ['general', 'help', 'announcement', 'question', 'discussion'];
  for (const tagName of tags) {
    await prisma.tag.upsert({
      where: { slug: tagName },
      update: {},
      create: {
        name: tagName.charAt(0).toUpperCase() + tagName.slice(1),
        slug: tagName,
      },
    });
  }

  const badges = [
    { name: 'New Member', description: 'Joined the community', icon: '🌱', color: '#22c55e' },
    { name: 'Contributor', description: 'Made 10 posts', icon: '✍️', color: '#3b82f6' },
    { name: 'Expert', description: 'Made 100 posts', icon: '🏆', color: '#f59e0b' },
    { name: 'Founder', description: 'Early community member', icon: '⭐', color: '#8b5cf6' },
    { name: 'Moderator', description: 'Community moderator', icon: '🛡️', color: '#ef4444' },
  ];

  for (const badge of badges) {
    await prisma.badge.upsert({
      where: { name: badge.name },
      update: {},
      create: badge,
    });
  }

  const founderBadge = await prisma.badge.findUnique({ where: { name: 'Founder' } });
  if (founderBadge) {
    await prisma.userBadge.upsert({
      where: { userId_badgeId: { userId: admin.id, badgeId: founderBadge.id } },
      update: {},
      create: { userId: admin.id, badgeId: founderBadge.id },
    });
  }

  await prisma.siteSettings.upsert({
    where: { key: 'general' },
    update: {},
    create: {
      key: 'general',
      value: {
        siteName: 'Forum Platform',
        siteDescription: 'A modern community discussion forum',
        allowRegistration: true,
        requireEmailVerification: false,
        maintenanceMode: false,
      },
    },
  });

  console.log('Seed complete:', { admin: admin.id, mod: mod.id, member: member.id });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
