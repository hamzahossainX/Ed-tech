# LearnX

LearnX creates a personal learning roadmap from a short goal such as "Learn Python in three months." Groq returns a structured plan, the application stores it in Neon Postgres, and the learner tracks each milestone from a shareable roadmap page.

The current version does not require an account. This keeps the demo flow short, but it also means that anyone with a roadmap URL can view and update that roadmap. See [Security model](#security-model) before using the project with private data.

## Features

- Generate a structured learning plan from a natural-language prompt
- Store roadmaps and ordered milestones in Postgres
- Attach one or two AI-suggested documentation links to each milestone
- Claim a named certificate after completing every milestone
- Export the certificate as a client-generated PDF
- Open a roadmap directly at `/roadmap/[id]`
- Mark milestones complete with optimistic UI updates
- Simplify technical milestones into four or five child-friendly ELI5 points
- Track completion with a progress bar and completion confetti
- Export a complete roadmap as a multi-page PDF or Notion-ready Markdown
- Run the same application locally or on Vercel

## Technology

| Area | Choice |
| --- | --- |
| Application | Next.js 15 App Router, React 19, TypeScript |
| Backend | Next.js Server Actions |
| Styling | Tailwind CSS 4, Shadcn UI conventions |
| Animation | Framer Motion |
| Database | Neon serverless Postgres |
| ORM and migrations | Drizzle ORM, Drizzle Kit |
| AI | Groq SDK with strict JSON Schema output |
| Validation | Zod |
| Deployment | Vercel |

## How it works

1. The landing page reveals the roadmap prompt form.
2. `generateRoadmap` validates the prompt and requests a strict JSON response from Groq.
3. One SQL statement inserts the roadmap and its ordered milestones. This prevents a partially saved roadmap.
4. The Server Action redirects to `/roadmap/{id}`.
5. The dynamic route reads the roadmap and milestones from Neon.
6. Checkbox changes use an optimistic client update while `toggleMilestone` writes the new state to Postgres.

## Project structure

```text
app/
├── actions/
│   ├── generate-roadmap.ts       # Groq request and atomic database insert
│   ├── simplify-milestone.ts     # Cached ELI5 explanation generation
│   └── toggle-milestone.ts       # Milestone completion mutation
├── roadmap/[id]/page.tsx         # Public roadmap page
├── globals.css
├── layout.tsx
└── page.tsx                      # Landing page
components/
├── landing/                      # Landing-page interaction
├── roadmap/                      # Prompt and tracker components
└── ui/                           # Shared Shadcn-style primitives
db/
├── index.ts                      # Neon and Drizzle client
└── schema.ts                     # Tables, types, and relations
drizzle/                          # Versioned SQL migrations and snapshots
lib/                              # Groq, Cloudinary, and shared utilities
```

## Database model

The roadmap flow uses two tables:

- `ai_roadmaps` stores the prompt, generated title, description, and estimated duration.
- `roadmap_milestones` stores ordered steps, resource links, completion state, and completion time. Resource links are typed JSONB objects with a title and HTTPS URL.

Deleting a roadmap deletes its milestones through the database foreign key. The roadmap still has no user foreign key, so a roadmap is not owned by the learner who generated it. Generation and every mutation now require a session, but ownership checks need that column before they can be added.

Per-learner generation usage lives on `users` as `daily_generation_count` and `last_generation_date`.

## Prerequisites

- Node.js 20.9 or newer
- npm
- A Neon Postgres database
- A Groq API key
- A GitHub OAuth App
- `bcryptjs`, `react-hook-form`, and `@hookform/resolvers` for credentials authentication
- A Cloudinary account only if you plan to use the upload action

## Local setup

Clone the repository and install its dependencies:

```bash
git clone https://github.com/hamzahossainX/Ed-tech.git
cd Ed-tech
npm install
```

The certificate exporter depends on `html2canvas` and `jspdf`. They are already
listed in `package.json`; for a manual installation, run:

```bash
npm install html2canvas jspdf @radix-ui/react-dialog
```

Create the local environment file:

```bash
cp .env.example .env.local
```

Set the required variables in `.env.local`:

```dotenv
DATABASE_URL=postgresql://user:password@host/database?sslmode=require
GROQ_API_KEY_1=your_primary_groq_api_key
GROQ_API_KEY_2=your_secondary_groq_api_key
GROQ_API_KEY_3=your_tertiary_groq_api_key
GROQ_MODEL=openai/gpt-oss-20b
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-3.8-flash
GITHUB_ID=your_github_oauth_client_id
GITHUB_SECRET=your_github_oauth_client_secret
AUTH_SECRET=generate_with_npx_auth_secret
ADMIN_EMAILS=["admin@example.com"]
```

Create the secret with `npx auth secret`. In your GitHub OAuth App, set the
local homepage URL to `http://localhost:3000` (or the port printed by Next.js)
and the authorization callback URL to
`http://localhost:3000/api/auth/callback/github`. Create a separate OAuth App
for production with `https://your-domain.com/api/auth/callback/github`.

### GitHub sign-in on Vercel

Deployed at `https://ed-tech-beryl-rho.vercel.app`. To make GitHub sign-in work
there:

1. **Set the environment variables in the Vercel project** (Settings →
   Environment Variables, Production scope), not in `.env.local` — that file is
   gitignored and never reaches the deployment: `DATABASE_URL`, `AUTH_SECRET`,
   `GITHUB_ID`, `GITHUB_SECRET`, the `GROQ_API_KEY_*` keys, `GEMINI_API_KEY`,
   and `ADMIN_EMAILS`.
2. **Register the production callback URL** on a GitHub OAuth App:
   `https://ed-tech-beryl-rho.vercel.app/api/auth/callback/github`, with the
   homepage URL set to `https://ed-tech-beryl-rho.vercel.app`. GitHub matches
   this exactly, so a trailing slash or an `http://` scheme will fail.
3. **Leave `AUTH_URL` unset on Vercel**, or set it to
   `https://ed-tech-beryl-rho.vercel.app`. `trustHost` is enabled, so the origin
   is detected from the request. Never copy the localhost value into Vercel.
4. **Redeploy** after adding variables. Vercel bakes them in at build time, so
   existing deployments do not pick them up.

Preview deployments get a different URL on every push, which will not match the
registered callback, so GitHub sign-in only works on production and on
`localhost` unless you register those URLs too.

If `GITHUB_ID` or `GITHUB_SECRET` is missing, the GitHub provider is skipped and
the sign-in page shows email/password only. Auth.js validates every registered
provider when `/api/auth` boots, so registering GitHub with empty credentials
would return 500 for *every* auth route and break email/password sign-in too.

Email/password accounts use bcrypt hashes with a cost factor of 12. Passwords
must be 8–72 characters and contain an uppercase letter, number, and special
character. Install the credentials dependencies with:

```bash
npm install bcryptjs zod react-hook-form @hookform/resolvers
npm install --save-dev @types/bcryptjs
```

Apply the committed migrations and start the development server:

```bash
npm run db:migrate
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment variables

| Variable | Required | Used for |
| --- | --- | --- |
| `DATABASE_URL` | Yes | Neon database connection and Drizzle migrations |
| `GROQ_API_KEY_1` | Yes | Primary Groq roadmap provider |
| `GROQ_API_KEY_2` | Recommended | First Groq fallback provider |
| `GROQ_API_KEY_3` | Recommended | Second Groq fallback provider |
| `GROQ_MODEL` | No | Groq model override; defaults to `openai/gpt-oss-20b` |
| `GEMINI_API_KEY` | Recommended | Final roadmap provider fallback |
| `GEMINI_MODEL` | No | Gemini model override; defaults to `gemini-3.8-flash` |
| `GITHUB_ID` | Yes for sign-in | GitHub OAuth App client ID |
| `GITHUB_SECRET` | Yes for sign-in | GitHub OAuth App client secret |
| `AUTH_SECRET` | Yes | Encrypts and signs Auth.js cookies and tokens |
| `ADMIN_EMAILS` | No | Server-only JSON array or comma-separated emails that bypass generation and share limits |
| `CLOUDINARY_CLOUD_NAME` | For uploads | Cloudinary account identifier |
| `CLOUDINARY_API_KEY` | For uploads | Signed upload generation |
| `CLOUDINARY_API_SECRET` | For uploads | Server-side upload signing |

Never expose database, Groq, or Cloudinary secrets through variables prefixed with `NEXT_PUBLIC_`. Do not commit `.env.local`.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the local Turbopack development server |
| `npm run build` | Create and validate a production build |
| `npm run start` | Run the compiled production server |
| `npm run vercel-build` | Build command used by Vercel |
| `npm run db:generate` | Generate a migration after a schema change |
| `npm run db:migrate` | Apply pending migrations |
| `npm run db:studio` | Open Drizzle Studio |

## Deploy to Vercel

1. Import the GitHub repository into Vercel.
2. Add `DATABASE_URL`, `GROQ_API_KEY_1`, `GROQ_API_KEY_2`, `GROQ_API_KEY_3`, `GROQ_MODEL`, `GEMINI_API_KEY`, and `GEMINI_MODEL` under Project Settings, then Environment Variables.
3. Add the Cloudinary variables only if uploads are part of the deployment.
4. Deploy the project.

Vercel reads [vercel.json](./vercel.json) and runs `npm run vercel-build`. The Neon schema must already contain the committed migrations. Apply them from a trusted local or CI environment before deploying code that depends on a new schema.

## Schema changes

Update `db/schema.ts`, generate a migration, inspect the SQL, and apply it:

```bash
npm run db:generate
npm run db:migrate
```

Commit the schema file, generated SQL, and Drizzle metadata together. Do not edit a migration after it has been applied to a shared database.

## Access and limits

Generating a roadmap requires a signed-in learner. The hero form blocks a
signed-out submit before the button can enter its loading state and opens a
dialog offering sign-in, but that is only there to avoid a pointless round
trip: the Server Action checks the session itself, before it parses the prompt
or reaches a provider. There is no guest allowance.

A signed-in learner may generate **5 roadmaps per day**. The count and the date
live on the `users` row, and one atomic `UPDATE ... RETURNING` reads the count,
checks the cap, and increments it in a single statement, so two concurrent
submits cannot both slip past the fifth. The day boundary is Asia/Dhaka, and a
generation that fails before a roadmap is saved hands its slot back.

Emails listed in `ADMIN_EMAILS`, and users whose row has the `admin` role,
bypass the cap.

## Security model

Roadmaps are public by UUID, and possession of the URL grants read access.

Every Server Action requires a session, because a Server Action is a public
HTTP endpoint whether or not the UI calls it. What is **not** yet enforced is
ownership: `ai_roadmaps` has no user column, so any signed-in learner who knows
a roadmap UUID can toggle its milestones or claim its certificate.

Before using LearnX for private or multi-user data:

- add a user column to `ai_roadmaps` and check ownership inside every mutation;
- validate upload type and size if Cloudinary uploads are enabled;
- rotate any credential that has been copied into logs, chat, or source control.

## Verification

Run the production build before opening a pull request:

```bash
npm run build
```

For roadmap changes, test this sequence locally:

1. Submit a learning goal from `/`.
2. Confirm the response redirects to `/roadmap/{id}`.
3. Refresh the roadmap and check that milestones remain ordered.
4. Open a resource and confirm it loads in a new tab.
5. Toggle a milestone, refresh again, and confirm the completion state persisted.
6. Open Focus Mode and confirm the ELI5 explanation is generated and cached.
7. Complete a milestone and confirm the progress bar and confetti respond.
8. Export the roadmap and verify both the PDF and Notion-ready Markdown options.

## License

No license has been added yet. Until one is provided, the repository remains all rights reserved by default.
