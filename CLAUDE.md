# Forum Platform

A modern, production-ready discussion forum built with Next.js, NestJS, PostgreSQL, and Prisma.

## Project Structure

```
Forum/
├── apps/
│   ├── api/          # NestJS REST API (port 4000)
│   └── web/          # Next.js frontend (port 3000)
├── packages/
│   └── database/     # Prisma schema, migrations, seed data
├── docker-compose.yml          # Full production stack
└── docker-compose.dev.yml      # Infrastructure only (for local dev)
```

## Quick Start

### One-command setup (Docker)

```bash
docker compose up --build
```

Then visit http://localhost:3000

### Local development

```bash
# Start infrastructure
docker compose -f docker-compose.dev.yml up -d

# Install dependencies
npm install

# Set up environment files
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local

# Generate Prisma client and run migrations
npm run db:generate
npm run db:migrate

# Seed the database
npm run db:seed

# Start dev servers
npm run dev
```

## Default Credentials (seeded)

| User | Email | Password | Role |
|------|-------|----------|------|
| admin | admin@forum.local | Admin@12345 | ADMINISTRATOR |
| moderator | moderator@forum.local | Mod@12345 | MODERATOR |
| member1 | member@forum.local | Member@12345 | MEMBER |

## API Documentation

When the API is running, visit: http://localhost:4000/api/docs

## Email (Development)

MailHog is included for email testing:
- SMTP: localhost:1025
- Web UI: http://localhost:8025

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, shadcn/ui, TanStack Query
- **Backend**: NestJS, TypeScript, Passport JWT, Swagger
- **Database**: PostgreSQL, Prisma ORM
- **Cache**: Redis
- **Auth**: JWT (7-day tokens), Argon2 hashing
- **Email**: Nodemailer + MailHog (dev)

## Key Commands

```bash
npm run dev              # Start both API and web in development
npm run build            # Build all packages
npm run test             # Run all tests
npm run db:generate      # Regenerate Prisma client after schema changes
npm run db:migrate       # Apply migrations
npm run db:seed          # Seed development data
```
