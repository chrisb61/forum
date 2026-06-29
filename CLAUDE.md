# Forum Platform

A modern discussion forum built with Next.js, NestJS, PostgreSQL, and Prisma.

## Prerequisites (no Docker needed)

- **Node.js v18+** — https://nodejs.org
- **PostgreSQL 14+** — https://www.postgresql.org/download/windows/
  - During install, set the password for the `postgres` user (default used here: `postgres`)

## Quick Start (Windows)

```powershell
# 1. Run the automated setup script
cd C:\Dev\Forum
.\setup.ps1
```

That script installs dependencies, creates the database, runs migrations, and seeds demo data.

Then start the app:
```powershell
npm run dev
```

- Web → http://localhost:3000  
- API → http://localhost:4000  
- API docs → http://localhost:4000/api/docs

## Manual Setup

If you prefer step-by-step:

```powershell
# Install npm packages
npm install

# Create the PostgreSQL database (open psql or pgAdmin and run):
# CREATE DATABASE forum;

# Generate Prisma client
npm run db:generate

# Run migrations (creates all tables)
npm run db:migrate

# Seed demo data
npm run db:seed

# Start both servers
npm run dev
```

## Default Credentials (seeded)

| User | Email | Password | Role |
|------|-------|----------|------|
| admin | admin@forum.local | Admin@12345 | ADMINISTRATOR |
| moderator | moderator@forum.local | Mod@12345 | MODERATOR |
| member1 | member@forum.local | Member@12345 | MEMBER |

## Environment Files

- `apps/api/.env` — API config (DATABASE_URL, JWT_SECRET, etc.)
- `apps/web/.env.local` — Frontend config (NEXT_PUBLIC_API_URL)

Edit `apps/api/.env` if your PostgreSQL credentials differ from the defaults:
```
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/forum
```

## Email in Development

With `SMTP_HOST` left blank in `.env`, emails are printed to the **API console** instead of sent. This means:
- Email verification links appear in the terminal running the API
- Password reset links appear there too

## Project Structure

```
Forum/
├── apps/
│   ├── api/          # NestJS REST API (port 4000)
│   └── web/          # Next.js 14 frontend (port 3000)
├── packages/
│   └── database/     # Prisma schema, migrations, seed data
├── setup.ps1         # One-shot Windows setup script
└── docker-compose.yml  # Optional: Docker deployment
```

## Key Commands

```powershell
npm run dev              # Start API + web in development
npm run dev:api          # API only
npm run dev:web          # Web only
npm run build            # Build for production
npm run test             # Run tests
npm run db:generate      # Regenerate Prisma client after schema changes
npm run db:migrate       # Run new migrations
npm run db:seed          # Re-seed demo data
npm run db:studio        # Open Prisma Studio (database browser)
```

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, shadcn/ui, TanStack Query
- **Backend**: NestJS, TypeScript, Passport JWT
- **Database**: PostgreSQL, Prisma ORM
- **Auth**: JWT (7-day tokens), Argon2 hashing
