# ResumeGenie.AI — Complete Setup & Run Guide

This guide covers everything from cloning the repo to running in production.

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Clone & Install](#2-clone--install)
3. [Environment Configuration](#3-environment-configuration)
4. [Build the LaTeX Docker Image](#4-build-the-latex-docker-image)
5. [Running Locally (Development)](#5-running-locally-development)
6. [Running Tests](#6-running-tests)
7. [Running with Docker Compose (Production)](#7-running-with-docker-compose-production)
8. [Running with Docker Swarm (Scaled)](#8-running-with-docker-swarm-scaled)
9. [CI/CD Pipeline Setup](#9-cicd-pipeline-setup)
10. [Deploying to Cloud Platforms](#10-deploying-to-cloud-platforms)
11. [Monitoring & Health Checks](#11-monitoring--health-checks)
12. [Troubleshooting](#12-troubleshooting)

---

## 1. Prerequisites

Install these before starting:

| Tool | Version | Purpose | Install |
|---|---|---|---|
| **Node.js** | 20+ | Backend + Frontend runtime | [nodejs.org](https://nodejs.org/) |
| **npm** | 10+ | Package manager (comes with Node) | Included with Node.js |
| **Docker** | 24+ | LaTeX compilation + deployment | [docker.com](https://docs.docker.com/get-docker/) |
| **Git** | 2.40+ | Version control | [git-scm.com](https://git-scm.com/) |

Verify installation:

```bash
node --version    # Should show v20.x.x or higher
npm --version     # Should show 10.x.x or higher
docker --version  # Should show Docker version 24.x.x or higher
git --version     # Should show git version 2.40.x or higher
```

### External Services (accounts needed)

| Service | Purpose | Setup URL |
|---|---|---|
| **Firebase** | Authentication (Google Sign-In) + Firestore database | [console.firebase.google.com](https://console.firebase.google.com/) |
| **Google AI Studio** | Gemini 2.5 Flash API key for AI features | [aistudio.google.com](https://aistudio.google.com/apikey) |
| **Stripe** | Subscription payments (optional for dev) | [dashboard.stripe.com](https://dashboard.stripe.com/) |

---

## 2. Clone & Install

```bash
# Clone the repository
git clone https://github.com/KESHAV-AGGARWAL001/ResumeGenie.AI.git
cd ResumeGenie.AI
```

Install dependencies for **both** backend and frontend:

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies (Next.js)
cd ../frontend-next
npm install

# Return to project root
cd ..
```

### Project Structure

```
ResumeGenie.AI/
├── backend/                  # Express API server (Node.js 20)
│   ├── server.js             # Entry point
│   ├── routes/               # API route handlers
│   ├── services/             # Business logic (AI, career, compile)
│   ├── middleware/            # Auth, rate limiting, logging
│   ├── templates/            # LaTeX resume templates (5 templates)
│   ├── lib/                  # Infrastructure (cache, circuit breaker, queue)
│   ├── tests/                # 21 automated tests
│   └── .env.example          # Environment variable template
│
├── frontend-next/            # Next.js 15 frontend (React 19 + TypeScript)
│   ├── src/
│   │   ├── app/              # App Router pages
│   │   │   ├── (app)/        # Authenticated pages (builder, editor, career, etc.)
│   │   │   └── (marketing)/  # Public pages (landing, pricing, roast, blog)
│   │   ├── components/       # React components
│   │   ├── stores/           # Zustand state management
│   │   └── lib/              # Utilities, types, API helpers
│   └── .env.example          # Frontend env template
│
├── Dockerfile                # LaTeX compiler Docker image
├── docker-compose.yml        # Production container setup
├── docker-stack.yml          # Docker Swarm deployment
└── nginx/                    # Nginx reverse proxy config
```

### Install Pre-commit Hooks (recommended)

```bash
# Linux / macOS
cp scripts/pre-commit .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit

# Windows (Git Bash)
cp scripts/pre-commit .git/hooks/pre-commit
```

This blocks commits that contain syntax errors, leaked secrets, or `.env` files.

---

## 3. Environment Configuration

You need to create **two** `.env` files — one for the backend and one for the frontend.

### Step 1: Backend (`backend/.env`)

```bash
cp backend/.env.example backend/.env
```

Open `backend/.env` and fill in your values:

```env
# ─── Firebase Admin (REQUIRED) ─────────────────────────────────────
FIREBASE_PROJECT_ID=your-project-id
# For production, generate a service account key from Firebase Console:
# FIREBASE_SERVICE_ACCOUNT_PATH=./config/serviceAccountKey.json

# ─── Gemini AI (REQUIRED) ──────────────────────────────────────────
# Get from: https://aistudio.google.com/apikey
GOOGLE_GENAI_API_KEY=your_gemini_api_key

# ─── Stripe (OPTIONAL for dev, REQUIRED for payments) ──────────────
STRIPE_SECRET_KEY=sk_test_xxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxx
STRIPE_PRO_PRICE_ID=price_xxxx
STRIPE_ENTERPRISE_PRICE_ID=price_xxxx

# ─── App Config ────────────────────────────────────────────────────
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
DOCKER_IMAGE=latex-editor-custom

# ─── CORS (Production only) ────────────────────────────────────────
# Set this to your Vercel deployment domain (without https://)
# VERCEL_APP_DOMAIN=your-app.vercel.app
```

> **Minimum to run:** You need `FIREBASE_PROJECT_ID` and `GOOGLE_GENAI_API_KEY`. Without Stripe keys, payments won't work but everything else will.

### Step 2: Frontend (`frontend-next/.env.local`)

```bash
cp frontend-next/.env.example frontend-next/.env.local
```

Open `frontend-next/.env.local` and fill in:

```env
# Firebase (public — exposed to browser, this is normal)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=000000000000
NEXT_PUBLIC_FIREBASE_APP_ID=1:000000000000:web:xxxxxxxx

# Backend URL (where the Express API runs)
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000

# Stripe price IDs (publishable — safe to expose)
NEXT_PUBLIC_STRIPE_PRO_PRICE_ID=price_xxxx
NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID=price_xxxx
```

> **Minimum to run:** You need all `NEXT_PUBLIC_FIREBASE_*` values and `NEXT_PUBLIC_BACKEND_URL`. Without Stripe price IDs, the pricing page won't work but the app will.

### Where to Get Firebase Config Values

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project (or use existing)
3. **Enable Authentication:**
   - Go to Authentication → Sign-in method
   - Enable **Google** sign-in provider
   - Add `localhost` to Authorized domains (for development)
4. **Enable Firestore:**
   - Go to Firestore Database → Create database
   - Start in **test mode** (for development)
5. **Get Config Values:**
   - Go to Project Settings → General → Your apps → Add app → Web
   - Copy the `firebaseConfig` object — it contains all the `NEXT_PUBLIC_FIREBASE_*` values
   - The `FIREBASE_PROJECT_ID` for the backend is the same as `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
6. **(Production only) Generate Service Account Key:**
   - Go to Project Settings → Service accounts
   - Click "Generate new private key"
   - Save as `backend/config/serviceAccountKey.json`
   - Set `FIREBASE_SERVICE_ACCOUNT_PATH=./config/serviceAccountKey.json` in `backend/.env`

### Where to Get Stripe Config Values (Optional)

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Get your **Secret Key** from Developers → API keys → copy `sk_test_...`
3. Create two subscription products:
   - **Pro** ($9.99/month) → copy the Price ID (`price_...`)
   - **Enterprise** ($29.99/month) → copy the Price ID (`price_...`)
4. Set up webhook endpoint (for production):
   - Go to Developers → Webhooks → Add endpoint
   - URL: `https://your-domain.com/payments/webhook`
   - Events: `checkout.session.completed`, `invoice.paid`, `customer.subscription.deleted`, `customer.subscription.updated`
   - Copy the Webhook Signing Secret (`whsec_...`)

---

## 4. Build the LaTeX Docker Image

The application uses Docker to compile LaTeX into PDFs. **You must build the image before PDF compilation will work.**

```bash
# From the project root (where the Dockerfile is)
docker build -t latex-editor-custom .
```

This builds a Docker image with:
- Full TeX Live distribution
- XeLaTeX engine
- Custom fonts (Lato, Raleway)
- Custom resume document classes

**Verify it built:**

```bash
docker images | grep latex-editor-custom
```

You should see something like:
```
latex-editor-custom   latest   abc123def456   ...   ~4GB
```

> **Note:** The first build takes 10-15 minutes and downloads ~4GB. Subsequent builds use Docker cache and are fast.

> **Can I skip this step?** Yes, but PDF compilation won't work. Everything else (AI features, form builder, career insights) will work without Docker.

---

## 5. Running Locally (Development)

### Quick Start (3 commands)

Open **two terminal windows** and run:

**Terminal 1 — Backend API:**
```bash
cd backend
npm run dev
```

**Terminal 2 — Frontend (Next.js):**
```bash
cd frontend-next
npm run dev
```

**Open your browser:** Navigate to **http://localhost:3000**

That's it. The backend runs at `http://localhost:5000`, the frontend at `http://localhost:3000`.

---

### What Each Command Does

#### `npm run dev` (backend)

Starts the Express API server with `nodemon` (auto-restarts on file changes).

**Successful startup looks like:**
```json
{"timestamp":"...","level":"info","message":"Server started","port":5000,"features":["rate-limiting","circuit-breaker","caching","job-queue","structured-logging"]}
```

**If it fails immediately** with "GOOGLE_GENAI_API_KEY is missing" or "FIREBASE_PROJECT_ID is missing", your `backend/.env` file is not configured. See [Step 1: Backend](#step-1-backend-backendenv).

The backend serves:
- `POST /compile` — LaTeX to PDF compilation (requires Docker)
- `POST /career/*` — 11 AI career endpoints (requires Gemini API key)
- `POST /ai/*` — AI analysis + resume roast
- `POST /payments/*` — Stripe checkout + webhooks (requires Stripe keys)
- `GET /health` — System health check

#### `npm run dev` (frontend-next)

Starts Next.js 15 dev server with **Turbopack** (fast refresh).

**Successful startup looks like:**
```
   ▲ Next.js 15.x.x (Turbopack)
   - Local:        http://localhost:3000
   - Network:      http://192.168.x.x:3000
```

**If the page loads but shows Firebase errors**, your `frontend-next/.env.local` is not configured. See [Step 2: Frontend](#step-2-frontend-frontend-nextenvlocal).

The frontend serves:
- `/` — Landing page (marketing)
- `/builder` — Resume form builder (requires login)
- `/editor` — LaTeX code editor (requires login)
- `/analyzer` — PDF resume analyzer (requires login)
- `/career` — AI career insights with 7 tabs (requires login)
- `/interview-prep` — AI interview preparation (requires login)
- `/roast` — Free resume roast (public, no login)
- `/pricing` — Subscription plans
- `/templates` — Template gallery
- `/blog` — Blog with MDX posts

---

### Step-by-Step: Full Feature Walkthrough

After both servers are running, verify each feature:

#### 1. Landing Page & Auth
- Open `http://localhost:3000` → you should see the marketing landing page
- Click **"Get Started Free"** → Google sign-in popup appears
- After signing in → you are redirected to `/builder`

#### 2. Resume Builder (Form Mode)
- You should see a multi-step form with 8 sections
- Step through: Personal Info → Social Profiles → Experience → Projects → Skills → Education → Achievements → Certifications
- At the bottom navigation, the progress bar fills as you advance

#### 3. AI Bullet Point Rewriter
- Go to the **Experience** step (step 3)
- Add an experience entry with at least one bullet point
- Click the **sparkle icon** (✨) next to any bullet point
- You should see 3 AI-rewritten versions with methodology badges (STAR, XYZ, etc.)
- Click a rewrite to replace the original bullet

#### 4. LinkedIn Import
- In the FormBuilder, click the blue **"Import"** button (with LinkedIn icon) in the step navigation bar
- A modal opens with instructions
- Paste LinkedIn profile text → click **"Parse LinkedIn Data"**
- Preview the parsed data → click **"Confirm Import"** to fill the form

#### 5. PDF Generation
- Fill in at least Personal Info and one Experience entry
- Click **"Generate Resume"** on the last step (Certifications)
- A template selection panel appears → pick a template (Deedy, Jakes, Modern, etc.)
- Click **"Compile PDF"** → the PDF appears in the preview panel
- Click the download button to save the PDF

> **Note:** PDF compilation requires Docker and the `latex-editor-custom` image. If Docker isn't running, you'll see a "PDF compilation failed" error.

#### 6. LaTeX Editor (Code Mode)
- Switch to the **Editor** tab in the top navigation
- You should see a Monaco code editor with the generated LaTeX source
- Edit the LaTeX directly → click **"Compile"** → see the updated PDF preview

#### 7. ATS Score Widget
- On the **Builder** or **Editor** page, look at the **bottom-right corner**
- You should see a floating circular button (purple with a scan icon)
- Click it → the widget expands with a textarea for a job description
- Paste a JD → click **"Scan ATS Score"** → see score (0-100), missing keywords, and a suggestion
- Click the chevron to collapse, or X to dismiss

#### 8. AI Career Insights
- Switch to the **Career** tab in the top navigation
- You should see 7 AI tabs:
  1. **Gap Analysis** — Enter a target role → get skill gap analysis
  2. **JD Optimization** — Paste a JD → get optimization suggestions
  3. **ATS Scan** — Full ATS keyword scan by category
  4. **Tailor Resume** — AI rewrites your resume for a specific JD
  5. **Cover Letter** — Generate a cover letter for a specific company + JD
  6. **Networking** — Draft a cold outreach email
  7. **Salary** — Enter target role + location → get salary range estimate

#### 9. AI Interview Prep
- Switch to the **Interview** tab in the top navigation
- Select an interview type: **Behavioral**, **Technical**, or **Situational**
- Paste a job description → click **"Generate Questions"**
- You should see 8-10 Q&A cards with collapsible sample answers and tips

#### 10. Free Resume Roast (Public)
- Open `http://localhost:3000/roast` (no login needed)
- Paste any resume text → click **"Roast My Resume"**
- See the roast score (0-100 with flame rating), roast text, improvements, and meme verdict

#### 11. Health Check
- Open `http://localhost:5000/health` in your browser
- You should see JSON with `"status": "ok"`, cache stats, circuit breaker states, and queue info

---

### Available npm Scripts

#### Backend (`backend/`)

| Command | Purpose |
|---|---|
| `npm run dev` | Start with auto-reload (nodemon) |
| `npm start` | Start without auto-reload (production) |
| `npm test` | Run all 21 tests |
| `npm run test:ci` | Run tests with detailed spec output |
| `npm run check` | Syntax-check all `.js` files |

#### Frontend (`frontend-next/`)

| Command | Purpose |
|---|---|
| `npm run dev` | Start dev server with Turbopack |
| `npm run build` | Create production build |
| `npm start` | Serve production build |
| `npm run lint` | Run ESLint |
| `npm run type-check` | Run TypeScript compiler (no emit) |

---

### Running Without Docker (Limited Mode)

If you don't have Docker installed or don't want to build the LaTeX image, the app still works for everything except PDF compilation:

```bash
# Just start both servers — skip the Docker build step
cd backend && npm run dev      # Terminal 1
cd frontend-next && npm run dev  # Terminal 2
```

Everything works in limited mode:
- Resume form builder (data is saved to Firestore)
- All 12 AI features (bullet rewriting, ATS scoring, career insights, interview prep, roast, etc.)
- LinkedIn import
- Template preview gallery

What doesn't work without Docker:
- PDF compilation ("Generate Resume" / "Compile" buttons will fail)
- PDF download

---

## 6. Running Tests

```bash
cd backend

# Run all tests
npm test

# Run with detailed output
npm run test:ci

# Run a specific test file
node --test tests/lib.test.js
```

Expected output:
```
▶ TieredCache
  ✔ stores and retrieves values
  ✔ returns undefined for missing keys
  ✔ expires entries after TTL
  ...
▶ hashContent
  ✔ produces consistent SHA-256 hashes
  ...
▶ CircuitBreaker
  ✔ stays CLOSED on success
  ...
▶ JobQueue
  ✔ executes jobs and returns results
  ...

ℹ tests 21
ℹ pass 21
ℹ fail 0
```

All tests are self-contained — they don't need Docker, Firebase, Gemini, or any running services. If tests fail, it's likely a Node.js version issue (need 20+).

### Frontend Type Check

```bash
cd frontend-next
npm run type-check
```

This runs `tsc --noEmit` to catch TypeScript errors without building.

### Syntax Check All Backend Files

```bash
cd backend
npm run check
```

---

## 7. Running with Docker Compose (Production)

This starts everything in containers: API server + Nginx reverse proxy + LaTeX image.

### Step 1: Configure environment for production

```bash
# Edit backend/.env with production values
# MUST change these:
NODE_ENV=production
FRONTEND_URL=https://your-domain.com
# VERCEL_APP_DOMAIN=your-app.vercel.app   # if frontend is on Vercel
```

### Step 2: Start all services

```bash
# From the project root
docker compose up -d
```

This will:
1. Build the API server image from `backend/Dockerfile.api` (multi-stage, ~200MB)
2. Build the LaTeX compiler image from `./Dockerfile` (~4GB)
3. Start the API server on port 5000
4. Start Nginx reverse proxy on port 80

### Step 3: Verify

```bash
# Check running containers
docker compose ps

# Check logs
docker compose logs -f api

# Test health endpoint
curl http://localhost/health
```

### Step 4: Stop

```bash
docker compose down
```

### Rebuild after code changes

```bash
docker compose build --no-cache api
docker compose up -d api
```

---

## 8. Running with Docker Swarm (Scaled)

Docker Swarm provides **zero-downtime deployments** with rolling updates and multiple replicas.

### Initialize Swarm (one-time)

```bash
docker swarm init
```

### Build images first

```bash
docker compose build
```

### Deploy the stack

```bash
docker stack deploy -c docker-stack.yml resumegenie
```

This starts:
- **2 API replicas** with rolling updates
- **Nginx** reverse proxy
- Automatic rollback on health check failure

### Monitor the stack

```bash
# List services
docker stack services resumegenie

# Check replicas
docker service ls

# View logs
docker service logs resumegenie_api -f

# Check health of individual tasks
docker service ps resumegenie_api
```

### Update after code changes (zero-downtime)

```bash
# Rebuild
docker compose build api

# Update (rolling — one replica at a time)
docker service update --image resumegenie-api:latest resumegenie_api
```

### Remove the stack

```bash
docker stack rm resumegenie
```

---

## 9. CI/CD Pipeline Setup

### GitHub Actions CI (Automatic)

The CI pipeline at `.github/workflows/ci.yml` runs automatically on every push and pull request to `main`. It:

1. Installs backend dependencies
2. Runs syntax checks on all `.js` files
3. **Runs the 21 automated tests**
4. Scans for leaked secrets
5. Builds the frontend

No setup needed — it works as soon as you push to GitHub.

### GitHub Actions CD (Requires Configuration)

The CD pipeline at `.github/workflows/cd.yml` deploys on push to `main`. You need to:

1. **Go to your GitHub repo → Settings → Environments**
2. Create an environment called `production`
3. **Add secrets** (Settings → Secrets → Actions):

| Secret | Value |
|---|---|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Your Firebase API key |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | your-project.firebaseapp.com |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | your-project-id |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | your-project.firebasestorage.app |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Your sender ID |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Your app ID |
| `NEXT_PUBLIC_BACKEND_URL` | https://api.your-domain.com |
| `NEXT_PUBLIC_STRIPE_PRO_PRICE_ID` | price_xxxx |
| `NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID` | price_xxxx |

4. **Uncomment the deploy step** in `cd.yml` for your platform (Railway, Render, Fly.io, or SSH)

5. **Add platform-specific secret:**

| Platform | Secret to Add |
|---|---|
| Railway | `RAILWAY_TOKEN` |
| Render | `RENDER_DEPLOY_HOOK_URL` |
| Fly.io | `FLY_API_TOKEN` |
| SSH | `DEPLOY_HOST`, `DEPLOY_USER`, `DEPLOY_SSH_KEY` |

---

## 10. Deploying to Cloud Platforms

### Option A: Vercel (Frontend) + Railway/Render (Backend) — Recommended

This is the recommended setup. Frontend on Vercel (free tier, great for Next.js), backend on Railway or Render.

**Frontend on Vercel:**

1. Go to [vercel.com](https://vercel.com/) and click "Import Project"
2. Connect your GitHub repo
3. **Set root directory** to `frontend-next`
4. **Framework Preset** will auto-detect Next.js
5. Add environment variables in the Vercel dashboard:
   - All `NEXT_PUBLIC_FIREBASE_*` values
   - `NEXT_PUBLIC_BACKEND_URL` = `https://your-backend.railway.app` (or wherever your backend is)
   - `NEXT_PUBLIC_STRIPE_PRO_PRICE_ID` and `NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID`
6. Click Deploy

Vercel handles SSR, SSG, edge functions, SSL, and custom domains automatically.

**Backend on Railway:**

1. Go to [railway.app](https://railway.app/) and connect your GitHub repo
2. **Set root directory** to `backend`
3. Add all `backend/.env` values as environment variables in Railway dashboard
4. **Important:** Set these production values:
   - `NODE_ENV=production`
   - `FRONTEND_URL=https://your-app.vercel.app`
   - `VERCEL_APP_DOMAIN=your-app.vercel.app`
5. Railway auto-detects Node.js and runs `npm start`

### Option B: Render (Full Stack)

1. Go to [render.com](https://render.com/)
2. Create a new **Web Service** from your GitHub repo
3. Set build command: `cd backend && npm install`
4. Set start command: `cd backend && node server.js`
5. Add environment variables
6. Render provides free SSL and custom domains

### Option C: Fly.io

```bash
# Install flyctl
curl -L https://fly.io/install.sh | sh

# Login
fly auth login

# Launch (from project root)
fly launch

# Deploy
fly deploy
```

### Option D: Self-hosted (VPS)

```bash
# On your server
git clone https://github.com/KESHAV-AGGARWAL001/ResumeGenie.AI.git
cd ResumeGenie.AI

# Configure environment
cp backend/.env.example backend/.env
nano backend/.env  # Fill in production values

# Start with Docker Compose
docker compose up -d

# Or with Swarm for zero-downtime
docker swarm init
docker stack deploy -c docker-stack.yml resumegenie
```

---

## 11. Monitoring & Health Checks

### Health Endpoint

```bash
curl http://localhost:5000/health | jq .
```

Returns:

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

### What to Monitor

| Metric | Where to Find | Alert If |
|---|---|---|
| **API uptime** | `/health` returns 200 | Response fails or status != "ok" |
| **Circuit breaker** | `/health` → `services.ai.circuit.state` | State is "OPEN" |
| **Compile queue** | `/health` → `services.compile.queue.queued` | Queued > 10 |
| **Cache hit rate** | `/health` → `services.subscription.subscription.hitRate` | Below 50% |
| **Response times** | Structured logs → `duration` field | p95 > 5s |
| **Error rate** | Structured logs → `status >= 500` | More than 1% of requests |

### Log Format

All backend logs are structured JSON:

```json
{
  "timestamp": "2026-04-28T12:00:00.000Z",
  "level": "info",
  "requestId": "a1b2c3d4-...",
  "method": "POST",
  "path": "/compile",
  "status": 200,
  "duration": "1234ms",
  "userId": "firebase-uid-here",
  "message": "Request completed"
}
```

Use `jq` to filter logs:

```bash
# Show only errors
docker compose logs api | grep '"level":"error"'

# Show slow requests (>5s)
docker compose logs api | jq 'select(.duration | gsub("ms";"") | tonumber > 5000)'
```

---

## 12. Troubleshooting

### "GOOGLE_GENAI_API_KEY is missing"

The server exits immediately with this error if required env vars are missing.

**Fix:** Make sure `backend/.env` exists and contains `GOOGLE_GENAI_API_KEY` and `FIREBASE_PROJECT_ID`.

### "Cannot find module" or "Module not found"

**Fix:** You haven't installed dependencies.

```bash
cd backend && npm install
cd ../frontend-next && npm install
```

### PDF compilation fails

```
Error: PDF compilation failed
```

**Check:**
1. Docker is running: `docker ps`
2. LaTeX image exists: `docker images | grep latex-editor-custom`
3. If not, rebuild: `docker build -t latex-editor-custom .`
4. Docker socket is accessible (for Docker-in-Docker): check `docker.sock` mount in `docker-compose.yml`

### "Circuit breaker is OPEN"

The Gemini API has failed too many times and the circuit breaker tripped.

**Fix:** Wait 60 seconds — the circuit breaker auto-recovers to HALF_OPEN and tests the API again. If the issue persists, check your `GOOGLE_GENAI_API_KEY` is valid and you haven't exceeded Gemini API quotas.

### Port already in use

```
Error: listen EADDRINUSE :::5000
```

**Fix:**
```bash
# Find what's using port 5000
lsof -i :5000    # Linux/macOS
netstat -ano | findstr :5000  # Windows

# Kill the process or use a different port
PORT=5001 npm run dev
```

### Port 3000 already in use (frontend)

```bash
# Next.js will auto-detect and use the next available port (3001, 3002, etc.)
# Or kill the process using port 3000:
lsof -i :3000    # Linux/macOS
netstat -ano | findstr :3000  # Windows
```

### CORS errors in browser

```
Access to fetch has been blocked by CORS policy
```

**Fix:**
- Development: Make sure `FRONTEND_URL=http://localhost:3000` is in `backend/.env`
- Production: Set `FRONTEND_URL=https://your-actual-domain.com` in `backend/.env`
- If frontend is on Vercel: Also set `VERCEL_APP_DOMAIN=your-app.vercel.app` in `backend/.env`

### Firebase auth fails

```
Error: Firebase ID token has invalid signature
```

**Fix:**
1. Make sure `FIREBASE_PROJECT_ID` in `backend/.env` matches `NEXT_PUBLIC_FIREBASE_PROJECT_ID` in `frontend-next/.env.local`
2. For production, use a service account key file (see [Firebase Setup](#where-to-get-firebase-config-values))
3. Check that your Firebase project has Google Authentication enabled

### Frontend loads but API calls fail

**Check:**
1. Is the backend running? Open `http://localhost:5000/health` — should return JSON
2. Is `NEXT_PUBLIC_BACKEND_URL=http://localhost:5000` in `frontend-next/.env.local`?
3. Check browser DevTools → Network tab for specific error codes

### Docker build fails (network issues)

```
Error: failed to fetch ...
```

**Fix:** If behind a corporate proxy:
```bash
docker build --network=host -t latex-editor-custom .
```

### Tests fail

```bash
# Run with verbose output to see which test fails
node --test --test-reporter=spec tests/lib.test.js
```

All tests are self-contained and don't need external services — if they fail, it's likely a Node.js version issue (need 20+).

---

## Quick Reference

| Command | Purpose |
|---|---|
| `cd backend && npm run dev` | Start backend (development, auto-reload) |
| `cd frontend-next && npm run dev` | Start frontend (development, Turbopack) |
| `cd backend && npm test` | Run all 21 backend tests |
| `cd backend && npm run check` | Syntax check all `.js` files |
| `cd frontend-next && npm run type-check` | TypeScript type check |
| `cd frontend-next && npm run build` | Production build (Next.js) |
| `docker build -t latex-editor-custom .` | Build LaTeX compiler image |
| `docker compose up -d` | Start production (Docker Compose) |
| `docker compose down` | Stop production |
| `docker compose logs -f api` | View backend logs |
| `docker stack deploy -c docker-stack.yml resumegenie` | Deploy with Swarm (scaled) |
| `curl http://localhost:5000/health` | Check system health |

---

## Environment Variable Reference

### Backend (`backend/.env`)

| Variable | Required | Description |
|---|---|---|
| `FIREBASE_PROJECT_ID` | Yes | Firebase project ID for admin auth |
| `FIREBASE_SERVICE_ACCOUNT_PATH` | Prod only | Path to service account JSON |
| `GOOGLE_GENAI_API_KEY` | Yes | Gemini 2.5 Flash API key |
| `STRIPE_SECRET_KEY` | For payments | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | For payments | Stripe webhook signing secret |
| `STRIPE_PRO_PRICE_ID` | For payments | Stripe Pro plan price ID |
| `STRIPE_ENTERPRISE_PRICE_ID` | For payments | Stripe Enterprise plan price ID |
| `PORT` | No (default 5000) | Server port |
| `NODE_ENV` | No (default development) | `development`, `staging`, or `production` |
| `FRONTEND_URL` | Yes | Frontend origin for CORS |
| `DOCKER_IMAGE` | No (default latex-editor-custom) | Docker image name for LaTeX compilation |
| `VERCEL_APP_DOMAIN` | Prod only | Vercel domain for CORS (without `https://`) |

### Frontend (`frontend-next/.env.local`)

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Yes | Firebase Web API key |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Yes | Firebase auth domain |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Yes | Firebase project ID |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Yes | Firebase storage bucket |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Yes | Firebase messaging sender ID |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Yes | Firebase app ID |
| `NEXT_PUBLIC_BACKEND_URL` | Yes | Backend API URL (`http://localhost:5000` for dev) |
| `NEXT_PUBLIC_STRIPE_PRO_PRICE_ID` | For pricing | Stripe Pro plan price ID |
| `NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID` | For pricing | Stripe Enterprise plan price ID |
