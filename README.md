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
- Track completion as a percentage
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

Deleting a roadmap deletes its milestones through the database foreign key. The roadmap has no user foreign key because the application does not currently have authentication.

## Prerequisites

- Node.js 20.9 or newer
- npm
- A Neon Postgres database
- A Groq API key
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
GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=openai/gpt-oss-20b
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
| `GROQ_API_KEY` | Yes | Roadmap generation |
| `GROQ_MODEL` | No | Groq model override; defaults to `openai/gpt-oss-20b` |
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
2. Add `DATABASE_URL`, `GROQ_API_KEY`, and `GROQ_MODEL` under Project Settings, then Environment Variables.
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

## Security model

Roadmaps are public by UUID. There is no separate edit credential, so possession of the URL grants read and update access. This is deliberate for the hackathon demo.

Before using LearnX for private or multi-user data:

- add authentication or a separate hashed edit token;
- enforce authorization inside every mutation;
- add rate limiting to roadmap generation;
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

## License

No license has been added yet. Until one is provided, the repository remains all rights reserved by default.
