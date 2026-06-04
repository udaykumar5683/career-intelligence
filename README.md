# AI Placement Risk & Career Intelligence Platform

An AI-powered career analysis platform that evaluates your resume using **7 specialized AI agents** working together to provide comprehensive career intelligence — from placement risk prediction to salary estimation and a personalized learning roadmap.

---

## ✨ Features

- **Resume Parsing** — Extracts skills, education, experience, and more from PDF, DOCX, or TXT resumes using AI (LLM + VLM)
- **Job Role Recommendations** — Suggests 4-5 best-fit job roles with match scores and growth potential
- **Job Market Research** — Real-time web search + AI analysis of hiring trends, demand levels, and top employers
- **Skill Gap Analysis** — Identifies missing skills categorized by importance with learning resources
- **Placement Risk Prediction** — Calculates your probability of getting placed within 3, 6, and 12 months
- **Salary Estimation** — Entry/Mid/Senior salary ranges based on live market data
- **Career Roadmap** — A phased improvement plan with actionable tasks and milestones
- **My Reports Dashboard** — Save and manage all your past career intelligence reports in your personal dashboard
- **Download Report** — Export your full career intelligence report as a JSON or self-contained HTML file

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | **Next.js 16** (App Router) |
| Language | **TypeScript 5** |
| Styling | **Tailwind CSS 4** + **shadcn/ui** |
| Charts | **Recharts** |
| Animations | **Framer Motion** |
|- AI SDK | **z-ai-web-dev-sdk** (LLM, VLM, Web Search) |
- Database | **Prisma ORM** (Supabase PostgreSQL) |
- Auth | **Supabase Auth** (@supabase/ssr) |
- Package Manager | **Bun** |

---

## 📂 Project Structure

```
my-project/
├── prisma/
│   └── schema.prisma              # Database schema
├── public/
│   ├── hero-bg.png                # Hero background image
│   └── sample-resume.txt          # Sample resume for testing
├── src/
│   ├── app/
│   │   ├── page.tsx               # Main page (hero → upload → analysis → results)
│   │   ├── layout.tsx             # Root layout
│   │   └── api/
│   │       └── analyze/
│   │           └── route.ts       # POST /api/analyze — SSE streaming endpoint
│   ├── components/
│   │   ├── career/
│   │   │   ├── hero-section.tsx       # Animated hero with CTA
│   │   │   ├── resume-upload.tsx      # Drag & drop file upload
│   │   │   ├── analysis-progress.tsx  # 7-step pipeline progress tracker
│   │   │   ├── results-dashboard.tsx  # Tab-based results + download report
│   │   │   ├── profile-card.tsx       # Parsed resume profile display
│   │   │   ├── job-roles-card.tsx     # Sortable job role recommendations
│   │   │   ├── market-research-card.tsx # Market trends & hiring companies
│   │   │   ├── skill-gap-card.tsx     # Skill gap chart + categories
│   │   │   ├── placement-risk-card.tsx  # Donut gauge + probability bars
│   │   │   ├── salary-card.tsx        # Entry/Mid/Senior salary ranges
│   │   │   └── roadmap-card.tsx       # Animated career roadmap timeline
│   │   └── ui/                    # shadcn/ui components
│   ├── lib/
│   │   ├── analysis-engine.ts     # Main orchestrator — runs all 7 agents
│   │   ├── db.ts                  # Prisma client
│   │   └── agents/
│   │       ├── resume-parser.ts       # Agent 1: VLM + LLM resume parsing
│   │       ├── job-role-analyzer.ts   # Agent 2: LLM role recommendations
│   │       ├── market-researcher.ts   # Agent 3: Web Search + LLM market data
│   │       ├── skill-gap-analyzer.ts  # Agent 4: LLM skill gap identification
│   │       ├── placement-risk.ts      # Agent 5: LLM placement risk prediction
│   │       ├── salary-estimator.ts    # Agent 6: Web Search + LLM salary ranges
│   │       └── career-roadmap.ts      # Agent 7: LLM career roadmap builder
│   └── types/
│       └── analysis.ts            # TypeScript type definitions
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **Bun** (recommended) or npm/yarn/pnpm

### 1. Install Dependencies

```bash
bun install
```

> If you don't have Bun installed: `curl -fsSL https://bun.sh/install | bash`

### 2. Set Up Environment Variables

Create a `.env` file in the root directory and add your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-anon-key
DATABASE_URL=your-postgresql-connection-string
DIRECT_URL=your-postgresql-direct-connection-string
```

### 3. Set Up the Database

```bash
bun run db:push
```

This creates the PostgreSQL tables in Supabase based on the Prisma schema.

### 4. Start the Development Server

```bash
bun run dev
```

The app will be running at **http://localhost:3000**

### 4. Open the App

Open your browser and navigate to `http://localhost:3000`

---

## 📖 How to Use

### Upload a Resume

1. **Drag & drop** a resume file (PDF, DOCX, or TXT) onto the upload zone, or **click to browse**
2. Alternatively, click **"Try with a sample resume"** to test with a built-in example
3. Click **"Analyze My Career"** to start the AI analysis pipeline

### Watch the Analysis

The platform runs 7 AI agents sequentially with real-time progress updates:

| # | Agent | What It Does |
|---|-------|-------------|
| 1 | Resume Parser | Extracts your skills, education, experience, certifications |
| 2 | Job Role Analyzer | Recommends best-fit roles with match scores |
| 3 | Market Researcher | Searches the web for live hiring trends & demand |
| 4 | Skill Gap Analyzer | Identifies missing skills with learning resources |
| 5 | Placement Risk Predictor | Calculates placement probability at 3/6/12 months |
| 6 | Salary Estimator | Estimates salary ranges using live market data |
| 7 | Career Roadmap Builder | Creates a phased improvement plan |

### View Results

Results are organized into 4 tabs:

- **Overview** — Profile summary + Placement risk assessment
- **Job Roles & Market** — Recommended roles + Market research data
- **Skill Analysis** — Skill gaps with importance, difficulty, and resources
- **Salary & Roadmap** — Salary ranges + Career improvement roadmap

### Download Report

Click the **"Download Report"** button to export your full analysis as a self-contained HTML file that opens in any browser.

---

## 🔧 Available Scripts

| Command | Description |
|---------|------------|
| `bun run dev` | Start development server on port 3000 |
| `bun run build` | Build for production |
| `bun run start` | Start production server |
| `bun run lint` | Run ESLint to check code quality |
| `bun run db:push` | Push Prisma schema to database |
| `bun run db:generate` | Generate Prisma client |
| `bun run db:migrate` | Run database migrations |
| `bun run db:reset` | Reset the database |

---

## 🤖 AI Agents Architecture

Each agent is designed to be **resilient** with built-in fallbacks:

```
Resume Upload
     │
     ▼
┌─────────────────┐
│  Resume Parser   │  VLM (PDF/DOCX) → LLM fallback → Hardcoded fallback
└────────┬────────┘
         ▼
┌─────────────────┐
│ Job Role Analyzer│  LLM → Default roles fallback
└────────┬────────┘
         ▼
┌─────────────────┐
│ Market Researcher│  Web Search + LLM → LLM-only → Hardcoded fallback
└────────┬────────┘
         ▼
┌─────────────────┐
│ Skill Gap Analyzer│  LLM → Computed fallback from required skills
└────────┬────────┘
         ▼
┌─────────────────┐
│ Placement Risk   │  LLM → Score-based computed fallback
└────────┬────────┘
         ▼
┌─────────────────┐
│ Salary Estimator │  Web Search + LLM → LLM-only → Hardcoded fallback
└────────┬────────┘
         ▼
┌─────────────────┐
│ Career Roadmap   │  LLM → Default 4-phase roadmap fallback
└─────────────────┘
```

**Key resilience features:**
- Rate limit (429) detection with fast fail and LLM-only fallback
- VLM 500 errors handled with text extraction + LLM fallback
- Every agent has a hardcoded fallback that never fails
- Top-level try/catch ensures the pipeline **never throws**
- Inter-stage delays (2.5s) to avoid API rate limiting

---

## 🎨 UI Design

- **Color scheme**: Teal/Emerald primary + Amber accents
- **Responsive**: Mobile-first design with breakpoints at sm/md/lg/xl
- **Animations**: Framer Motion for page transitions, hover effects, and loading states
- **Components**: Built with shadcn/ui (New York style) + Lucide icons
- **Charts**: Recharts for skill gap visualization and placement risk gauge
- **Dark mode**: Supported via next-themes

---

## 📝 Notes

- The platform uses the **z-ai-web-dev-sdk** for all AI capabilities (LLM, VLM, Web Search). No API keys are needed in this environment as they are pre-configured.
- For **PDF/DOCX resumes**, the parser attempts text extraction first before falling back to VLM, which avoids common VLM errors.
- The analysis typically takes **60-90 seconds** to complete all 7 agents.
- All data is processed in real-time — nothing is stored in the database after analysis.

---

## License

MIT
