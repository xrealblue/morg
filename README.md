# Morg

AI-powered GitHub code analysis platform. Get instant summaries of commits, ask questions about your codebase, and onboard to new projects faster.

## Tech Stack

- **Framework**: Next.js 15 (App Router) + React 19
- **API**: tRPC v11 (type-safe)
- **Database**: PostgreSQL + Prisma 6 + pgvector
- **Auth**: better-auth (GitHub OAuth)
- **AI**: Google Gemini 2.0 Flash + text-embedding-004
- **Styling**: Tailwind CSS v4
- **Testing**: Vitest + Playwright
- **Package Manager**: Bun

## Getting Started

```bash
# Install dependencies
bun install

# Set up environment variables
cp .env.example .env
# Edit .env with your credentials

# Push database schema
bun run db:push

# Start dev server
bun run dev
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string (with pgvector extension) |
| `BETTER_AUTH_SECRET` | Auth encryption secret (min 32 chars) |
| `BETTER_AUTH_URL` | App base URL |
| `GITHUB_CLIENT_ID` | GitHub OAuth App client ID |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth App client secret |
| `GITHUB_TOKEN` | Personal access token for GitHub API |
| `GEMINI_API_KEY` | Google AI Studio API key |

## Features

- GitHub authentication via better-auth
- Link GitHub repositories for analysis
- AI-summarized commit history (Gemini 2.0 Flash)
- Semantic code search with pgvector embeddings
- Ask questions about your codebase with RAG
- Streaming AI responses
- Responsive sidebar navigation

## Scripts

```bash
bun run dev          # Start development server
bun run build        # Production build
bun run typecheck    # TypeScript check
bun run test         # Run unit tests
bun run test:e2e     # Run E2E tests
bun run db:push      # Push schema to database
bun run db:studio    # Open Prisma Studio
bun run analyze      # Bundle analysis
```
