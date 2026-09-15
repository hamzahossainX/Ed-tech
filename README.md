# 🎓 LearnX — Next-Gen AI Learning Roadmap Platform

> **LearnX** is an AI-powered EdTech platform that generates personalized, structured learning roadmaps from natural language goals, featuring real-time progress tracking, AI mentorship, interactive ELI5 breakdowns, and verified PDF certificates.

---

## 📸 Screenshots & UI Showcase

<div align="center">
  <img src="public/assets/hero_preview.png" alt="LearnX Hero & Dashboard UI" width="800"/>
  <p><em>Figure 1: AI Prompt Input & Interactive Dashboard Interface</em></p>
  <br/>
  <img src="public/assets/roadmap_preview.png" alt="LearnX Roadmap Tracker & AI Mentor" width="800"/>
  <p><em>Figure 2: Milestone Tracker with Progress Indicators & Floating AI Mentor Chat</em></p>
</div>

---

## ✨ Core Features

- **🚀 AI Roadmap Generation:** Instant creation of week-by-week learning paths from simple natural-language prompts.
- **💬 Context-Aware AI Mentor:** Floating RAG-lite AI chat widget that answers questions grounded specifically in your active roadmap.
- **⚡ ELI5 Milestone Simplification:** Breakdown complex technical concepts into child-friendly micro-steps using AI.
- **🏆 Verified PDF Certificates:** Mint downloadable, custom-styled completion certificates upon completing all milestones.
- **📊 Real-time Progress Tracker:** Interactive checkboxes with optimistic UI state updates and completion celebration confetti.
- **💰 Monetization & Tier Plans:** Built-in SaaS subscription pricing (`/pricing`) and manual bKash / Nagad transaction verification flow.
- **🔒 Rate Limiting & Access Control:** Daily generation caps (5/day) enforced via atomic database counters with admin bypass rules.
- **📥 Multi-Format Export:** Export roadmaps directly to multi-page PDFs or Notion-ready Markdown.

---

## 🛠️ Technology Stack

| Area | Technologies |
| :--- | :--- |
| **Framework** | Next.js 15 (App Router), React 19, TypeScript |
| **Styling & UI** | Tailwind CSS v4, Shadcn UI primitives, Framer Motion |
| **Database & ORM** | Neon Serverless Postgres, Drizzle ORM, Drizzle Kit |
| **AI Providers** | Groq SDK (`openai/gpt-oss-20b`), Google Gemini 3.8 Flash |
| **Auth & Security** | NextAuth.js (Auth.js v5), GitHub OAuth, Bcryptjs credentials |
| **Validation** | Zod (strict schema parsing) |
| **Deployment** | Vercel Platform |

---

## 📐 Software Engineering & Architectural Principles

To ensure high maintainability, fault tolerance, and developer productivity, **LearnX** adheres to strict software engineering standards:

### 1. Separation of Concerns & Clean Layering
- **Server Actions (`app/actions/`):** Dedicated pure backend functions handling data fetching, validation, and mutations.
- **UI Components (`components/`):** Presentation components isolated from raw database queries.
- **Schema & Persistence (`db/schema.ts`):** Centralized Drizzle schema acting as the single source of truth for database tables and relations.

### 2. Single Source of Truth (SSOT) & Strict Typing
- Types are inferred directly from Drizzle ORM schemas and Zod validation objects.
- Zero manual TypeScript type duplicates across client and server logic.

### 3. Multi-Provider AI Fallback Architecture
- **Resilient AI Chains:** Roadmap and mentor chat queries execute through a primary Groq API key, automatically failing over to secondary/tertiary Groq keys and Google Gemini on rate limits or API outages.
- **Structured JSON Schema Constraints:** All AI responses enforce strict JSON Schema validation (`response_format: { type: "json_schema" }`), completely eliminating hallucinated output structures.

### 4. Atomic Database Mutations & Concurrency Guards
- Multi-row insertions (e.g., roadmap header + milestone steps) execute within atomic SQL transactions.
- Rate-limiting updates use single atomic `UPDATE ... RETURNING` queries to prevent race conditions during concurrent user submissions.

### 5. Security-First API Boundaries
- Every Server Action independently validates session authorization using a unified security guard, preventing unauthorized parameter mutations on public endpoints.

---

## 🤝 Contribution Guidelines

We welcome contributions from the community! Please follow these engineering rules when contributing to **LearnX**:

### 1. Branch Strategy
- `main`: Production baseline (**Version 1.0.0**). All commits must pass full CI checks.
- `feature/*`: Dedicated branches for new features or major enhancements.
- `fix/*`: Bug fixes and hotfixes.

### 2. Commit Message Conventions
Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:
- `feat(...)`: A new user-facing feature
- `fix(...)`: A bug fix
- `refactor(...)`: Code restructuring without functional changes
- `docs(...)`: Documentation updates
- `style(...)`: Formatting or CSS adjustments

### 3. Pre-Pull Request Checklist
Before submitting a Pull Request, run the following verification pipeline locally:

```bash
# 1. Type check
npx tsc --noEmit

# 2. Production build verification
npm run build
```

---

## ⚙️ Getting Started Locally

### Prerequisites
- Node.js 20.9+
- npm 10+
- Neon Postgres database URL
- Groq API key

### Installation

```bash
# Clone the repository
git clone https://github.com/hamzahossainX/Ed-tech.git
cd Ed-tech

# Install dependencies
npm install

# Create environment configuration
cp .env.example .env.local
```

### Environment Setup (`.env.local`)
```dotenv
DATABASE_URL=postgresql://user:password@host/database?sslmode=require
GROQ_API_KEY_1=your_groq_key
GROQ_API_KEY_2=your_backup_groq_key
GEMINI_API_KEY=your_gemini_key
GITHUB_ID=your_github_client_id
GITHUB_SECRET=your_github_client_secret
AUTH_SECRET=generate_with_npx_auth_secret
```

### Database Migration & Development

```bash
# Apply migrations to database
npm run db:migrate

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 📜 License

This project is licensed under the **MIT License**. See the [LICENSE](./LICENSE) file for details.

Developed with ❤️ by [Hamza Hossain](https://github.com/hamzahossainX).
