# ResumeGenie.AI

> **ResumeGenie.AI is an AI-powered career assistant that helps job seekers create optimized resumes, understand their career gaps, and improve their chances of getting interviews.**

ResumeGenie.AI is an **AI-powered career optimization platform**. It combines structured resume creation, LaTeX-quality rendering, AI-driven resume analysis, job-description alignment, and career insights. The long-term goal is to build a **full AI Career Assistant**, not just a resume builder.

---

## Product Vision

ResumeGenie.AI aims to become a **central workspace for career development and job preparation**. Users can:

1. Build professional resumes easily without knowing LaTeX.
2. Generate multiple resume versions optimized for different job roles.
3. Analyze existing resumes and identify weaknesses.
4. Align resumes with specific job descriptions.
5. Track and improve their career readiness using AI insights.
6. Get AI-powered interview preparation tailored to their resume.
7. Import professional profiles from LinkedIn in seconds.
8. Estimate competitive salary ranges based on their skills and location.

---

## Core Product Capabilities

### 1. Structured Resume Builder

Users create resumes through a guided, multi-step form instead of writing LaTeX directly.

Supported sections:

- Personal Information  
- Social Links  
- Experience (with AI bullet point rewriting)  
- Projects (with AI bullet point rewriting)  
- Skills  
- Education  
- Achievements  
- Certifications  

The structured `resumeData` object is converted into LaTeX using a template engine, then compiled into **high-quality professional PDFs**. This delivers **LaTeX-quality output without requiring LaTeX knowledge**.

### 2. Multi-Template Resume Rendering

Users can choose from multiple professional templates:

- Deedy  
- Jakes  
- Modern  
- ModernCV  
- ModernDeedy  

Templates are selected via a `templateId`. The backend pipeline is:

```text
resumeData + templateId
→ Template Engine
→ LaTeX
→ Docker XeLaTeX
→ PDF
```

This ensures:

- Consistent formatting  
- Reproducible builds  
- Compatibility with modern fonts (Lato, Raleway)  

### 3. Real-Time Resume Editing

Users can switch between two editing modes:

- **Form Mode** — Structured stepper UI for each resume section.  
- **Code Mode** — Advanced users can edit the **raw LaTeX source** in a Monaco editor.

Both modes share the same compilation pipeline:

```text
LaTeX → Docker XeLaTeX → PDF
```

The compiled PDF is shown in a **real-time preview panel** with download support.

### 4. AI Resume Analysis

Two analysis entry points:

- **Resume PDF Analyzer** — Upload a PDF, extract text via `pdf-parse`, then analyze.
- **In-app AI Consultant** — Analyze structured resume data against a job description.

The backend uses **Gemini 2.5 Flash** (via `@google/genai` SDK) with:

- **Deterministic scoring** (rule-based, reproducible) for numeric scores
- **AI-powered qualitative analysis** for suggestions, rewrites, and strategy

AI analysis provides:

- Overall resume score (deterministic: technical depth, engineering impact, technology relevance, project complexity, role alignment)
- Structural issues and suggested fixes
- Bullet-level rewrites with stronger action verbs and quantification
- Missing or weak keywords
- Job-description similarity score (when a JD is provided)

### 5. AI Career Insights (12 Features)

| Feature | Endpoint | Description |
|---|---|---|
| **Career Gap Detection** | `POST /career/gap-analysis` | Identifies missing skills/experience for a target role with action plans |
| **JD Optimization** | `POST /career/optimize` | Suggests specific resume modifications to maximize JD alignment |
| **ATS Keyword Scan** | `POST /career/ats-scan` | Analyzes keyword matches/gaps by category (technical, soft skills, tools) |
| **Resume Tailoring** | `POST /career/tailor` | Rewrites resume content to maximize JD fit while preserving structure |
| **Cover Letter Generation** | `POST /career/cover-letter` | Generates plain text + compilable LaTeX cover letters |
| **Networking Email Draft** | `POST /career/networking-email` | Drafts cold outreach emails with formal/conversational/brief tone options |
| **AI Bullet Rewriter** | `POST /career/rewrite-bullet` | Rewrites individual bullet points using STAR/XYZ methodology — 3 improved versions |
| **Quick ATS Score** | `POST /career/quick-ats` | Lightweight ATS scan returning score (0-100) + keyword gaps + top suggestion |
| **AI Interview Prep** | `POST /career/interview-prep` | Generates 8-10 tailored interview questions (behavioral/technical/situational) with model answers |
| **LinkedIn Import** | `POST /career/parse-linkedin` | Parses pasted LinkedIn profile text into structured resume data |
| **Salary Estimator** | `POST /career/salary-estimate` | Estimates salary range (low/median/high) based on skills, experience, and location |
| **Free Resume Roast** | `POST /ai/roast` | Brutally honest, humorous AI critique of a resume (public, no auth required) |

### 6. Subscription & Payments

Three-tier system powered by **Stripe Checkout + Webhooks**:

| Tier | Compilations | AI Analyses | Templates | Price |
|---|---|---|---|---|
| **Starter** | 3/day | 1/day | 2 | Free |
| **Pro** | Unlimited | 10/day | 5 | $9.99/mo |
| **Enterprise** | Unlimited | Unlimited | 5 + custom | $29.99/mo |

For a deeper product vision, see [`docs/PRODUCT-VISION.md`](docs/PRODUCT-VISION.md).

---

## Technical Architecture

### Frontend

Built with:

- **Next.js 15** (App Router) + **React 19** + **TypeScript**  
- **TailwindCSS 4** for styling  
- **Monaco Editor** for LaTeX editing  
- **Zustand** for state management (auth-store, resume-store)  
- **Firebase** for:
  - Google Authentication (`onAuthStateChanged`)  
  - Firestore persistence of `resumeData` and LaTeX per user  

Route groups:

- `(app)` — Authenticated pages: builder, editor, analyzer, career insights, interview prep  
- `(marketing)` — Public pages: landing, pricing, templates, blog, resume roast  

Key features:

- Structured resume form interface (multi-step FormBuilder)  
- AI bullet point rewriter inline in experience/project forms  
- Real-time ATS score widget (floating, bottom-right on builder/editor)  
- LinkedIn-to-resume import modal  
- Template selection and preview gallery  
- Real-time PDF preview and download  
- LaTeX editor mode for power users  
- AI analysis UI (AI Consultant + PDF Resume Analyzer)  
- Career insights with 7 AI tabs (gap analysis, JD optimization, ATS scan, tailoring, cover letter, networking email, salary estimation)  
- Interview prep page with behavioral/technical/situational question generation  
- Free resume roast (public, no authentication required)  
- SSG marketing pages with full SEO (sitemap, robots, OpenGraph, JSON-LD)  
- Error boundaries for both route groups  

### Backend

Built with:

- **Node.js 20** + **Express 5**
- **Joi** for validating `resumeData`
- **multer** for PDF uploads, **pdf-parse** for text extraction
- **Firebase Admin SDK** for auth (JWT verification) + Firestore
- **Stripe** for subscription payments + webhooks
- **helmet** + **hpp** for security headers
- **express-rate-limit** for tiered rate limiting

Production infrastructure (zero external dependencies):

- **LRU Cache** with TTL (`lib/cache.js`)
- **Circuit Breaker** for Gemini API resilience (`lib/circuitBreaker.js`)
- **Job Queue** with concurrency control (`lib/jobQueue.js`)
- **Content Hashing** for cache keys (`lib/hashUtil.js`)
- **Structured JSON Logging** with request IDs (`lib/logger.js`)
- **Request Logger** middleware (`middleware/requestLogger.js`)
- **Env Validator** on startup (`lib/envValidator.js`)
- **Webhook Idempotency** via TTL cache (`routes/payments.js`)

Responsibilities:

- Validating and transforming structured resume data
- LaTeX template rendering across 5 templates
- Orchestrating XeLaTeX compilation via Docker (max 3 concurrent)
- 12 AI career analysis endpoints with caching and circuit breaking
- Subscription management and usage tracking with Firestore caching
- PDF upload and text extraction
- Public resume roast endpoint (rate-limited per IP, no auth)

### AI Layer

Current model:

- **Gemini 2.5 Flash** (via `@google/genai` SDK)

Responsibilities:

- Resume scoring (deterministic rule-based) and qualitative analysis (AI)
- Bullet rewriting with STAR/XYZ methodology (3 improved versions per bullet)
- Keyword and skills gap analysis  
- Job description alignment (similarity scoring)
- Career gap detection and action plans
- JD-optimized resume tailoring
- Cover letter generation (plain text + LaTeX)
- Networking email drafting
- Interview question generation with model answers
- LinkedIn profile text parsing into structured data
- Salary estimation with negotiation tips
- Humorous resume roasting with improvement suggestions

### LaTeX Rendering System

Rendering uses a **Dockerized LaTeX compiler**:

- Base image: `blang/latex:ctanfull`  
- Engine: **XeLaTeX**  
- Custom fonts: **Lato**, **Raleway**  
- Custom templates and document classes for resumes  

Pipeline:

```text
Resume Data
→ Template Engine
→ LaTeX Source
→ Docker XeLaTeX
→ Compiled PDF
```

This provides a reproducible, font-stable, and OS-independent build environment.

---

## Security

### Backend Security

| Feature | Implementation |
|---|---|
| **Authentication** | Firebase Admin SDK JWT verification on all protected routes |
| **CORS** | Strict origin whitelist — production uses `FRONTEND_URL` + `VERCEL_APP_DOMAIN` only |
| **Rate limiting** | Tiered per-user rate limits (global, compile, AI, upload, template) |
| **Roast rate limiting** | 5 requests/24h per IP for public roast endpoint |
| **Security headers** | `helmet` + `hpp` for HTTP header hardening |
| **Input validation** | Type checking, string length truncation (10k JD, 50k resume text), `resumeData` object validation |
| **Error sanitization** | Generic error messages in production — no stack traces or internal details leaked |
| **Request timeout** | 60s default, 120s for compile — kills hung requests |
| **Env validation** | Fails fast on startup if required env vars are missing |
| **LaTeX escaping** | All user-provided text (names, URLs, bullet points) escaped via `escapeLaTeX()` before template rendering |
| **Graceful shutdown** | Drains connections on `SIGTERM`/`SIGINT`, 10s forced exit |

### Frontend Security

| Feature | Implementation |
|---|---|
| **Content Security Policy** | Comprehensive CSP header in `next.config.ts` — restricts script, style, image, connect, frame, and object sources |
| **X-Frame-Options** | `SAMEORIGIN` — prevents clickjacking |
| **X-Content-Type-Options** | `nosniff` — prevents MIME sniffing |
| **Referrer-Policy** | `strict-origin-when-cross-origin` |
| **Permissions-Policy** | Camera, microphone, geolocation disabled |
| **PDF iframe sandbox** | `sandbox="allow-same-origin"` on PDF preview iframe — prevents script execution |
| **Redirect URL validation** | Stripe checkout/portal URLs validated against `https://checkout.stripe.com/` and `https://billing.stripe.com/` before redirect |
| **Error boundaries** | `error.tsx` in both `(app)` and `(marketing)` route groups — graceful error handling without exposing internals |
| **Auth middleware** | Next.js middleware matcher protects `/builder`, `/editor`, `/analyzer`, `/career`, `/interview-prep` routes |
| **Robots.txt** | App routes disallowed from search engine crawling |

---

## System Workflows

### Resume Creation Flow

```text
User Form Input
→ resumeData
→ Template Generator (templateId)
→ LaTeX Source
→ Docker XeLaTeX Compile
→ PDF Output (Preview + Download)
```

### Resume Analysis Flow (PDF)

```text
PDF Upload
→ Text Extraction (pdf-parse)
→ Cache Check (SHA-256 hash of text + JD)
→ Circuit Breaker Check
→ Deterministic Scoring (rule-based)
→ AI Analysis (Gemini 2.5 Flash, 30s timeout)
→ Cache Result (10 min TTL)
→ Resume Score + Suggestions + Bullet Rewrites
```

### Real-Time Editing Flow (LaTeX)

```text
LaTeX Editor (Monaco)
→ Compile Request
→ XeLaTeX Docker Container
→ PDF Preview
```

---

## Production Infrastructure

### System Design (Zero External Dependencies)

All scalability infrastructure is built using Node.js built-ins (`node:crypto`, `Map`, `setTimeout`) — no Redis, no RabbitMQ, no extra npm packages.

| Component | File | Purpose |
|---|---|---|
| **LRU Cache** | `backend/lib/cache.js` | In-memory cache with TTL and LRU eviction. Used for subscription tier caching (5min), usage caching (30s), AI response caching (10min), PDF caching (1hr). |
| **Circuit Breaker** | `backend/lib/circuitBreaker.js` | CLOSED → OPEN → HALF_OPEN state machine. Wraps all Gemini API calls — fails fast when the AI service is down instead of queuing timeouts. |
| **Job Queue** | `backend/lib/jobQueue.js` | Async job queue with configurable concurrency (default 3). Prevents thread starvation from concurrent Docker LaTeX compilations. |
| **Content Hashing** | `backend/lib/hashUtil.js` | SHA-256 hashing for cache keys. Identical LaTeX or AI inputs return cached results instantly. |
| **Structured Logger** | `backend/lib/logger.js` | JSON-formatted logs with `timestamp`, `level`, `requestId`, `userId`, `method`, `path`, `duration`. |
| **Request Logger** | `backend/middleware/requestLogger.js` | Logs every HTTP request/response with status code, duration, and user context. |
| **Env Validator** | `backend/lib/envValidator.js` | Validates required environment variables on startup. Fails fast with clear error messages instead of crashing at runtime. |

### Where Caching is Applied

| Service | What's Cached | TTL | Cache Key |
|---|---|---|---|
| `subscriptionService.js` | User subscription tier | 5 min | `sub:{uid}` |
| `subscriptionService.js` | Daily usage counts | 30 sec | `usage:{uid}` |
| `aiService.js` | AI resume analysis results | 10 min | SHA-256(resumeText + JD) |
| `careerService.js` | All 12 career AI responses | 10 min | SHA-256(inputs + type) |
| `routes/compile.js` | Compiled PDF buffers | 1 hr | SHA-256(LaTeX source) |

### Circuit Breaker Coverage

| Service | Threshold | Reset Timeout |
|---|---|---|
| AI Service (resume analysis + roast) | 5 failures | 60 seconds |
| Career Service (all 11 endpoints) | 5 failures | 60 seconds |

### Request Flow

```text
Client Request
→ Request ID (UUID)
→ Structured Logging
→ Rate Limit Headers
→ CORS (production-hardened)
→ Request Timeout (60s / 120s for compile)
→ Auth (Firebase JWT)
→ Tier Attachment
→ Rate Limiting (express-rate-limit)
→ Usage Check
→ Route Handler
  → Input Validation (type + length)
  → Cache Check (hit? return cached)
  → Circuit Breaker (open? fail fast)
  → Job Queue (compile only, max 3 concurrent)
  → External Service (Gemini AI / Docker XeLaTeX)
  → Cache Result
→ Response Logging (status, duration)
```

### Webhook Idempotency

Stripe webhook events are deduplicated using a TTL cache (1hr) keyed by `event.id`. Duplicate deliveries are acknowledged without reprocessing.

---

## Product Philosophy

ResumeGenie.AI is built on three principles:

1. **Professional output** — LaTeX-quality resumes that look credible for top tech companies and competitive roles.  
2. **AI-driven insights** — Go beyond formatting to explain *why* a resume is weak or strong.  
3. **Career optimization** — Help users steadily improve their interview chances, not just generate a PDF.  

---

## Long-Term Direction

ResumeGenie.AI is evolving toward a **full AI Career Assistant**.

Already implemented:
- Career Gap Detection
- Resume Tailoring & JD Optimization
- ATS Keyword Scanning (full + quick score widget)
- Cover Letter & Networking Email Generation
- AI Bullet Point Rewriting (STAR/XYZ methodology)
- AI Interview Prep (behavioral, technical, situational)
- LinkedIn Profile Import
- Salary Estimation
- Free Resume Roast (public, viral)
- Subscription tiers with Stripe

Planned:
- **Job Matching** — Recommend jobs based on skills, experience, and preferences; score resume fit per role.
- **Application Tracking** — Track applications, interview pipelines, and outcomes inside the platform.
- **Recruiter Integration** — Allow companies to post roles and search candidate profiles with AI ranking.
- **Redis-backed caching** — For horizontal scaling across multiple instances.
- **Kubernetes deployment** — For auto-scaling and multi-region availability.

See [`docs/PRODUCT-VISION.md`](docs/PRODUCT-VISION.md) for a deeper roadmap.

---

## DevOps

### CI/CD Pipelines (GitHub Actions)

| Workflow | Trigger | Steps |
|---|---|---|
| **CI** (`.github/workflows/ci.yml`) | Push / PR to `main` | Install → Syntax check → **Run tests** → Secret scan → Frontend build |
| **CD** (`.github/workflows/cd.yml`) | Push to `main` | Test → Build → Deploy (Railway / Render / Fly.io / SSH — uncomment your platform) |

### Automated Testing

21 tests using Node.js built-in `node:test` (zero test dependencies):

```bash
cd backend && npm test
```

| Suite | Tests | Coverage |
|---|---|---|
| TieredCache | 8 | set/get, TTL expiry, LRU eviction, stats |
| hashContent | 3 | consistency, uniqueness, object serialization |
| CircuitBreaker | 4 | state transitions, failure threshold, recovery |
| JobQueue | 4 | execution, concurrency limits, error propagation |
| envValidator | 2 | required vars, missing vars → exit(1) |

### Pre-commit Hooks

Installed at `.git/hooks/pre-commit` (source: `scripts/pre-commit`):

1. **Syntax check** — `node --check` on all staged `.js` files
2. **Secret scan** — blocks commits containing Stripe live keys, AWS keys, private keys
3. **`.env` guard** — prevents `.env` files from being committed

Install manually: `cp scripts/pre-commit .git/hooks/pre-commit && chmod +x .git/hooks/pre-commit`

### Docker

**Multi-stage build** (`backend/Dockerfile.api`):

- Stage 1: Install dependencies (cached layer)
- Stage 2: Production image with non-root user, `tini` for signal handling, health check with start period

**Docker Compose** (`docker-compose.yml`):

```bash
docker compose up -d
```

Starts: API server + Nginx reverse proxy + LaTeX compiler image build.

**Docker Swarm** (`docker-stack.yml`) — for zero-downtime deploys:

```bash
docker stack deploy -c docker-stack.yml resumegenie
```

- 2 API replicas with rolling updates (`start-first` order)
- Automatic rollback on health check failure
- Resource limits: 1 CPU, 512MB per container

### Nginx Reverse Proxy

`nginx/nginx.conf` provides:

- **Gzip compression** (6 content types, level 6)
- **Rate limiting** (10 req/s general, 1 req/s compile)
- **Security headers** (X-Frame-Options, X-Content-Type-Options, X-XSS-Protection, Referrer-Policy)
- **Request ID forwarding** (`X-Request-ID` header → backend logging)
- **Keepalive connections** to upstream
- **Separate timeout** for compile endpoint (120s) vs general (60s)

### Environment Separation

| Environment | Config File | Key Differences |
|---|---|---|
| `development` | `backend/config/environments/development.js` | Short TTLs, debug logging, localhost CORS |
| `staging` | `backend/config/environments/staging.js` | Inherits production + debug logs, shorter cache |
| `production` | `backend/config/environments/production.js` | Strict TTLs, info-only logs, FRONTEND_URL-only CORS |

Auto-loaded based on `NODE_ENV` via `backend/config/environments/index.js`.

### Production Hardening

| Feature | Implementation |
|---|---|
| **Env validation** | Fails fast on startup if `GOOGLE_GENAI_API_KEY` or `FIREBASE_PROJECT_ID` missing |
| **Trust proxy** | Enabled in production for correct client IP behind Nginx/load balancer |
| **Production CORS** | Localhost origins stripped when `NODE_ENV=production`; exact domain match only |
| **Request timeout** | 60s default, 120s for compile — kills hung requests |
| **404 handler** | Returns JSON `{ error: "Not Found" }` — no path leakage |
| **Error sanitization** | Generic messages in production; detailed errors only in development |
| **Graceful shutdown** | Drains connections on `SIGTERM`/`SIGINT`, 10s forced exit |
| **Non-root Docker** | Runs as `app:app` user inside container |
| **CSP headers** | Comprehensive Content-Security-Policy on all frontend responses |
| **Input truncation** | All text inputs capped at safe maximums (10k JD, 50k resume, 1k bullet, 200 role/location) |

### Health Check Endpoint

`GET /health` returns:

```json
{
  "status": "ok",
  "uptime": 12345.678,
  "services": {
    "subscription": { "hits": 42, "misses": 3, "hitRate": "93.3%" },
    "ai": { "circuit": { "state": "CLOSED", "failures": 0 }, "cache": { "size": 5 } },
    "career": { "circuit": { "state": "CLOSED" }, "cache": { "size": 12 } },
    "compile": { "queue": { "running": 1, "queued": 0 }, "cache": { "size": 8 } }
  }
}
```

---

## Setup

> **For a complete step-by-step guide**, see [`docs/SETUP-GUIDE.md`](docs/SETUP-GUIDE.md) — covers prerequisites, Firebase/Stripe configuration, Docker, testing, deployment, monitoring, and troubleshooting.

### Prerequisites

- Node.js 20+
- Docker (for LaTeX compilation)
- Git

### Installation

```bash
# Clone
git clone https://github.com/KESHAV-AGGARWAL001/ResumeGenie.AI.git
cd ResumeGenie.AI

# Install dependencies
cd backend && npm install && cd ..
cd frontend-next && npm install && cd ..

# Configure environment
cp backend/.env.example backend/.env         # Fill in your keys
cp frontend-next/.env.example frontend-next/.env  # Fill in your keys

# Build LaTeX Docker image
docker build -t latex-editor-custom .

# Install pre-commit hooks
cp scripts/pre-commit .git/hooks/pre-commit && chmod +x .git/hooks/pre-commit
```

### Running Locally

```bash
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Frontend (Next.js)
cd frontend-next && npm run dev
```

Open `http://localhost:3000`. Backend runs at `http://localhost:5000`.

### Running with Docker Compose (Production)

```bash
docker compose up -d
```

This starts the API server (port 5000) + Nginx reverse proxy (port 80) + builds the LaTeX image.

### Running Tests

```bash
cd backend && npm test
```

---

## Docker LaTeX Compilation

This project uses a custom Docker image based on `blang/latex:ctanfull` for LaTeX compilation. The image includes:

- Full TeX Live distribution  
- Custom fonts (Lato and Raleway)  
- Custom document class and templates for resumes  

The Docker image is built using the `Dockerfile` in the project root and is referenced in the backend code as `latex-editor-custom` (or via the `DOCKER_IMAGE` environment variable).

---

## Troubleshooting

### Font Issues

If you encounter font-related errors during LaTeX compilation:

1. Make sure the Docker image is built correctly.  
2. Verify that the fonts directory contains all required font files.  
3. Check the LaTeX logs for specific font-related errors.  

### Class / Template File Issues

If you see errors related to the document class or templates:

1. Ensure the `Deedy_reversed_resume.cls` (and other template assets) are in the `backend/templates` directory.  
2. Verify that the Docker image was built with the class file and templates.  
3. Check that the templates directory is correctly mounted in the Docker container.  

---

## License

MIT
