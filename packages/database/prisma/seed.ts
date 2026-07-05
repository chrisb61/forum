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

  // ── Clean up old placeholder categories ─────────────────────────────────────
  await prisma.category.deleteMany({
    where: { id: { in: ['cat-general', 'cat-support'] } },
  });

  // ── Categories & Forums ─────────────────────────────────────────────────────

  const CATEGORIES = [
    { id: 'cat-governance', name: 'Governance & Board', description: 'Board effectiveness, NED practice, audit, risk, and executive governance', displayOrder: 1 },
    { id: 'cat-esg', name: 'ESG Strategy & Sustainability', description: 'ESG as business value, sustainability reporting, net zero, and circular economy', displayOrder: 2 },
    { id: 'cat-ai', name: 'AI & Transformational Change', description: 'AI governance, digital transformation, data-driven decision making, and AI in ESG', displayOrder: 3 },
    { id: 'cat-finance', name: 'Sustainable Finance', description: 'Green bonds, ESG investing, access to capital, and blended finance', displayOrder: 4 },
    { id: 'cat-talent', name: 'University & Emerging Professionals', description: 'Graduate ESG careers, research collaboration, placements, and mentorship', displayOrder: 5 },
    { id: 'cat-sectors', name: 'Sector Verticals', description: 'Industry-specific ESG and governance discussion by sector', displayOrder: 6 },
    { id: 'cat-knowledge', name: 'Knowledge Exchange', description: 'Case studies, regulatory watch, tools, frameworks, and global perspectives', displayOrder: 7 },
    { id: 'cat-network', name: 'Network & Platform', description: 'Platform announcements, introductions, and community guidelines', displayOrder: 8 },
  ];

  for (const cat of CATEGORIES) {
    await prisma.category.upsert({ where: { id: cat.id }, update: { name: cat.name, description: cat.description, displayOrder: cat.displayOrder }, create: cat });
  }

  const FORUMS = [
    // Governance & Board
    { categoryId: 'cat-governance', name: 'Board Effectiveness & NED Practice', description: 'Best practice in non-executive directorship, board dynamics, and governance standards', slug: 'board-effectiveness-ned', displayOrder: 1 },
    { categoryId: 'cat-governance', name: 'Audit, Risk & Internal Controls', description: 'Audit committee practice, enterprise risk management, and internal control frameworks', slug: 'audit-risk-controls', displayOrder: 2 },
    { categoryId: 'cat-governance', name: 'Executive Remuneration & Fairness', description: 'Pay equity, remuneration committee practice, and fair reward frameworks', slug: 'executive-remuneration', displayOrder: 3 },
    { categoryId: 'cat-governance', name: 'Succession Planning & Board Diversity', description: 'Building diverse, effective boards and planning for leadership continuity', slug: 'succession-diversity', displayOrder: 4 },
    // ESG Strategy & Sustainability
    { categoryId: 'cat-esg', name: 'ESG as Business Value', description: 'Making the commercial case for ESG — cost reduction, performance, and competitive advantage', slug: 'esg-business-value', displayOrder: 1 },
    { categoryId: 'cat-esg', name: 'Sustainability Reporting', description: 'CSRD, TCFD, GRI, ISSB — navigating the reporting landscape', slug: 'sustainability-reporting', displayOrder: 2 },
    { categoryId: 'cat-esg', name: 'Net Zero & Decarbonisation', description: 'Science-based targets, transition plans, and practical decarbonisation pathways', slug: 'net-zero-decarbonisation', displayOrder: 3 },
    { categoryId: 'cat-esg', name: 'Circular Economy & Supply Chain', description: 'Circular business models, responsible sourcing, and supply chain sustainability', slug: 'circular-economy', displayOrder: 4 },
    // AI & Transformational Change
    { categoryId: 'cat-ai', name: 'AI Governance & Responsible Deployment', description: 'Ethics, accountability, and governance frameworks for AI in organisations', slug: 'ai-governance', displayOrder: 1 },
    { categoryId: 'cat-ai', name: 'Digital Transformation for Sustainability', description: 'How digital tools and platforms accelerate sustainability outcomes', slug: 'digital-transformation', displayOrder: 2 },
    { categoryId: 'cat-ai', name: 'Data-Driven Decision Making', description: 'Using data, analytics, and AI to inform board and executive decisions', slug: 'data-driven-decisions', displayOrder: 3 },
    { categoryId: 'cat-ai', name: 'AI in ESG Measurement & Reporting', description: 'Applying AI to ESG data collection, analysis, and disclosure', slug: 'ai-esg-measurement', displayOrder: 4 },
    // Sustainable Finance
    { categoryId: 'cat-finance', name: 'Green & Sustainable Bonds', description: 'Green, social, sustainability-linked bonds and the debt capital markets', slug: 'green-bonds', displayOrder: 1 },
    { categoryId: 'cat-finance', name: 'ESG Investing & Portfolio Strategy', description: 'Responsible investment, ESG integration, and portfolio construction', slug: 'esg-investing', displayOrder: 2 },
    { categoryId: 'cat-finance', name: 'Access to Capital for SMEs', description: 'How smaller organisations access sustainable finance and ESG-linked funding', slug: 'capital-smes', displayOrder: 3 },
    { categoryId: 'cat-finance', name: 'Blended Finance & Impact Investment', description: 'Combining public and private capital to achieve social and environmental outcomes', slug: 'blended-finance', displayOrder: 4 },
    // University & Emerging Professionals
    { categoryId: 'cat-talent', name: 'Graduate ESG Careers', description: 'Career pathways, CV advice, and opportunities for graduates entering ESG and sustainability', slug: 'graduate-esg-careers', displayOrder: 1 },
    { categoryId: 'cat-talent', name: 'Research Collaboration', description: 'Connecting academics and practitioners on ESG and sustainability research', slug: 'research-collaboration', displayOrder: 2 },
    { categoryId: 'cat-talent', name: 'Placement & Internship Opportunities', description: 'University placement functions connecting students with corporate members', slug: 'placements-internships', displayOrder: 3 },
    { categoryId: 'cat-talent', name: 'Mentorship & Professional Development', description: 'Senior practitioners offering guidance to emerging ESG professionals', slug: 'mentorship', displayOrder: 4 },
    // Sector Verticals
    { categoryId: 'cat-sectors', name: 'Real Estate & Built Environment', description: 'ESG in property, construction, infrastructure, and the built environment', slug: 'real-estate-esg', displayOrder: 1 },
    { categoryId: 'cat-sectors', name: 'Financial Services & Banking', description: 'ESG and governance in banking, insurance, and financial services', slug: 'financial-services-esg', displayOrder: 2 },
    { categoryId: 'cat-sectors', name: 'Healthcare & Life Sciences', description: 'Sustainability and governance in health, pharma, and life sciences', slug: 'healthcare-esg', displayOrder: 3 },
    { categoryId: 'cat-sectors', name: 'Infrastructure & Energy', description: 'ESG in energy transition, utilities, transport, and major infrastructure', slug: 'infrastructure-energy', displayOrder: 4 },
    // Knowledge Exchange
    { categoryId: 'cat-knowledge', name: 'Case Studies & Evidence Base', description: 'Real-world examples of ESG and governance in practice — what worked and what did not', slug: 'case-studies', displayOrder: 1 },
    { categoryId: 'cat-knowledge', name: 'Regulatory Watch', description: 'Live updates and discussion on ESG regulation, policy, and compliance globally', slug: 'regulatory-watch', displayOrder: 2 },
    { categoryId: 'cat-knowledge', name: 'Tools, Frameworks & Templates', description: 'Practical resources — frameworks, templates, and methodologies for practitioners', slug: 'tools-frameworks', displayOrder: 3 },
    { categoryId: 'cat-knowledge', name: 'Global Perspectives', description: 'ESG and governance through a global lens — regional insights and international practice', slug: 'global-perspectives', displayOrder: 4 },
    // Network & Platform
    { categoryId: 'cat-network', name: 'Announcements', description: 'Official platform announcements and updates from the ESG Intelligence Network team', slug: 'announcements', displayOrder: 1 },
    { categoryId: 'cat-network', name: 'Introductions', description: 'Introduce yourself to the network — who you are, what you do, and what brought you here', slug: 'introductions', displayOrder: 2 },
  ];

  for (const forum of FORUMS) {
    await prisma.forum.upsert({ where: { slug: forum.slug }, update: { name: forum.name, description: forum.description }, create: forum });
  }

  // Welcome thread in Announcements
  const announcementsForum = await prisma.forum.findUnique({ where: { slug: 'announcements' } });
  if (announcementsForum) {
    const welcomeThread = await prisma.thread.upsert({
      where: { slug: 'welcome-to-the-esg-intelligence-network' },
      update: {},
      create: {
        forumId: announcementsForum.id,
        authorId: admin.id,
        title: 'Welcome to the ESG Intelligence Network',
        slug: 'welcome-to-the-esg-intelligence-network',
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
        content: `# Welcome to the ESG Intelligence Network\n\nThe intelligence network where ESG expertise, AI-assisted collaboration, and Change Leadership converge.\n\nThis is a governed, private professional community for non-executive directors, board advisors, ESG strategists, emerging talent, and the organisations that need them.\n\n## Community Standards\n\n- All members are here in a professional capacity — treat each other accordingly\n- Contributions should add value: insight, evidence, experience, or challenge\n- No unsolicited promotion or cold outreach\n- Respect confidentiality — what is shared here, stays here\n- Disagreement is welcome; disrespect is not\n\nWe are glad you are here.`,
      },
    });
  }

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
