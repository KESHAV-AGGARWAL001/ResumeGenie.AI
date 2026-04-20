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

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies (Next.js)
cd ../frontend-next
npm install

# Return to project root
cd ..
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

### Backend (`backend/.env`)

```bash
cp backend/.env.example backend/.env
```

Open `backend/.env` and fill in your values:

```env
# ─── Firebase (REQUIRED) ────────────────────────────────────────────
FIREBASE_PROJECT_ID=your-project-id
# Option A: Service account JSON (recommended for production)
# FIREBASE_SERVICE_ACCOUNT_PATH=./config/serviceAccountKey.json
# Option B: Just project ID (works for development)

# ─── Gemini AI (REQUIRED) ───────────────────────────────────────────
# Get from: https://aistudio.google.com/apikey
GOOGLE_GENAI_API_KEY=your_gemini_api_key

# ─── Stripe (OPTIONAL for dev, REQUIRED for payments) ──────────────
STRIPE_SECRET_KEY=sk_test_xxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxx
STRIPE_PRO_PRICE_ID=price_xxxx
STRIPE_ENTERPRISE_PRICE_ID=price_xxxx

# ─── App Config ─────────────────────────────────────────────────────
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
DOCKER_IMAGE=latex-editor-custom

# ─── CORS (Production only) ─────────────────────────────────────────
# Set this to your Vercel deployment domain (without https://)
# VERCEL_APP_DOMAIN=your-app.vercel.app
```

### Frontend (`frontend-next/.env.local`)

```bash
cp frontend-next/.env.example frontend-next/.env.local
```

Open `frontend-next/.env.local` and fill in:

```env
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=000000000000
NEXT_PUBLIC_FIREBASE_APP_ID=1:000000000000:web:xxxxxxxx

# Backend URL
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000

# Stripe price IDs (publishable — safe to expose)
NEXT_PUBLIC_STRIPE_PRO_PRICE_ID=price_xxxx
NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID=price_xxxx
```

### Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project (or use existing)
3. **Enable Authentication:**
   - Go to Authentication → Sign-in method
   - Enable **Google** sign-in provider
   - Add your domain to Authorized domains
4. **Enable Firestore:**
   - Go to Firestore Database → Create database
   - Start in **test mode** (for development)
5. **Get Config Values:**
   - Go to Project Settings → General → Your apps → Web app
   - Copy the `firebaseConfig` values into your `.env` files
6. **(Production) Generate Service Account Key:**
   - Go to Project Settings → Service accounts
   - Click "Generate new private key"
   - Save as `backend/config/serviceAccountKey.json`
   - Set `FIREBASE_SERVICE_ACCOUNT_PATH=./config/serviceAccountKey.json` in `backend/.env`

### Stripe Setup (Optional)

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Get your **Secret Key** from Developers → API keys
3. Create two subscription products:
   - **Pro** ($9.99/month) — copy the Price ID
   - **Enterprise** ($29.99/month) — copy the Price ID
4. Set up webhook endpoint:
   - Go to Developers → Webhooks → Add endpoint
   - URL: `https://your-domain.com/payments/webhook`
   - Events: `checkout.session.completed`, `invoice.paid`, `customer.subscription.deleted`, `customer.subscription.updated`
   - Copy the Webhook Signing Secret

---

## 4. Build the LaTeX Docker Image

The application uses Docker to compile LaTeX into PDFs. You must build the image before PDF compilation will work.

```bash
# From the project root
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

---

## 5. Running Locally (Development)

You need **two terminal windows** — one for the backend, one for the frontend.

### Terminal 1: Start Backend

```bash
cd backend
npm run dev
```

You should see:
```json
{"timestamp":"...","level":"info","message":"Server started","port":5000,"features":["rate-limiting","circuit-breaker","caching","job-queue","structured-logging"]}
```

### Terminal 2: Start Frontend (Next.js)

```bash
cd frontend-next
npm run dev
```

You should see:
```
  ▲ Next.js 15.x.x
  - Local:        http://localhost:3000
```

### Open the App

Navigate to **http://localhost:3000** in your browser.

You should see the landing page. Click "Get Started Free" to sign in with Google.

### Verify Everything Works

1. **Sign in** with Google — should redirect to the builder
2. **Fill the resume form** — go through all 8 steps
3. **Try AI Bullet Rewriting** — click the sparkle icon next to any bullet point
4. **Pick a template** and click "Generate Resume" — should generate a PDF in the preview
5. **Check the ATS Score Widget** — floating button at bottom-right of builder/editor
6. **Try AI Interview Prep** — navigate to Interview tab in the top nav
7. **Try Career Insights** — navigate to Career tab and explore all 7 AI tabs
8. **Check the health endpoint** — open `http://localhost:5000/health` in browser

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

### Syntax Check All Files

```bash
cd backend
npm run check
```

---

## 7. Running with Docker Compose (Production)

This starts everything in containers: API server + Nginx reverse proxy + LaTeX image.

### Step 1: Make sure your `.env` is configured

```bash
# backend/.env must exist with production values
# Set NODE_ENV=production and FRONTEND_URL=https://your-domain.com
```

### Step 2: Start all services

```bash
# From the project root
docker compose up -d
```

This will:
1. Build the API server image (multi-stage, ~200MB)
2. Build the LaTeX compiler image (~4GB)
3. Start the API server on port 5000
4. Start Nginx on port 80

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

### Option A: Vercel (Frontend) + Railway/Render (Backend)

**Frontend (Vercel):**
1. Go to [vercel.com](https://vercel.com/) and import your GitHub repo
2. Set root directory to `frontend-next`
3. Add environment variables (`NEXT_PUBLIC_*`) in Vercel dashboard
4. Deploy — Vercel handles SSR, SSG, edge, SSL, and domains

**Backend (Railway):**
1. Go to [railway.app](https://railway.app/) and connect your GitHub repo
2. Set root directory to `backend`
3. Add environment variables in the Railway dashboard
4. Set `VERCEL_APP_DOMAIN=your-app.vercel.app` for CORS

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

Returns cache stats, circuit breaker states, queue depth, and uptime.

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
  "timestamp": "2026-04-20T12:00:00.000Z",
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

### CORS errors in browser

```
Access to fetch has been blocked by CORS policy
```

**Fix:**
- Development: Make sure `FRONTEND_URL=http://localhost:3000` is in `backend/.env`
- Production: Set `FRONTEND_URL=https://your-actual-domain.com` and `VERCEL_APP_DOMAIN=your-app.vercel.app` in `backend/.env`

### Firebase auth fails

```
Error: Firebase ID token has invalid signature
```

**Fix:**
1. Make sure `FIREBASE_PROJECT_ID` in `backend/.env` matches your Firebase project
2. For production, use a service account key file (see [Firebase Setup](#firebase-setup))
3. Check that your Firebase project has Google Authentication enabled

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
| `cd backend && npm run dev` | Start backend (development) |
| `cd frontend-next && npm run dev` | Start frontend (development) |
| `cd backend && npm test` | Run all 21 tests |
| `cd backend && npm run check` | Syntax check all JS files |
| `docker build -t latex-editor-custom .` | Build LaTeX compiler image |
| `docker compose up -d` | Start production (Docker) |
| `docker compose down` | Stop production |
| `docker compose logs -f api` | View backend logs |
| `docker stack deploy -c docker-stack.yml resumegenie` | Deploy with Swarm (scaled) |
| `curl http://localhost:5000/health` | Check system health |
