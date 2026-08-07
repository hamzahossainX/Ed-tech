# LearnX

LearnX turns a plain-language learning goal into an AI-generated, trackable roadmap. It runs on Next.js 15, Groq, Neon Postgres, and Drizzle ORM, with no authentication required for the hackathon flow.

## Run locally

1. Copy `.env.example` to `.env.local` and fill in `DATABASE_URL` and `GROQ_API_KEY`.
2. Run `npm install`.
3. Run `npm run db:migrate`.
4. Run `npm run dev` and open `http://localhost:3000`.

## Deploy to Vercel

1. Push this repository to GitHub, GitLab, or Bitbucket and import it into Vercel.
2. Add these variables under **Project Settings → Environment Variables**:
   - `DATABASE_URL`
   - `GROQ_API_KEY`
   - `GROQ_MODEL` (recommended: `openai/gpt-oss-20b`)
   - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` only if uploads are used
3. Deploy. Vercel uses `npm run vercel-build`; the existing Neon migrations are already applied.

Do not commit or upload `.env.local`. Vercel production secrets must be configured in its dashboard.

## Architecture

- `app/page.tsx` — frictionless AI roadmap generator
- `app/roadmap/[id]` — shareable roadmap tracker
- `app/actions` — Groq generation and milestone Server Actions
- `components/landing` and `components/roadmap` — interactive UI
- `db` and `drizzle` — Neon connection, schema, and migrations

Roadmaps are public by UUID. Anyone with the URL can view and update milestones; add authentication or an edit token before storing private data.
