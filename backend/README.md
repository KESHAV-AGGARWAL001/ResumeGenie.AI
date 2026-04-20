# Backend (Node.js + Express)

## Setup

1. Copy `.env.example` to `.env` and adjust values
2. Install dependencies:
   ```sh
   npm install
   ```
3. Start the server:
   ```sh
   npm start
   ```

## Tech Stack

- **Node.js 20** + **Express 5**
- **Gemini 2.5 Flash** via `@google/genai` SDK
- **Firebase Admin SDK** for JWT auth + Firestore
- **Stripe** for subscription payments + webhooks
- **Docker** (`blang/latex:ctanfull`) for XeLaTeX compilation
- **helmet** + **hpp** for security headers
- **express-rate-limit** for tiered rate limiting

## API Endpoints

### Compilation
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/compile` | Required | Compile LaTeX source to PDF |

### Templates
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/template/list` | Optional | List available templates |
| POST | `/template/generate` | Optional | Generate LaTeX from resumeData + templateId |

### Resume
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/resume/generate-latex` | Required | Generate LaTeX from structured data |
| POST | `/resume/validate` | Required | Validate resumeData schema |
| GET/POST | `/resume/save` | Required | Save/load resume data from Firestore |

### AI Analysis
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/ai/analyze` | Required | Full AI resume analysis |
| POST | `/ai/roast` | Public | Humorous resume roast (rate-limited per IP) |

### Career AI (all require auth)
| Method | Path | Description |
|---|---|---|
| POST | `/career/gap-analysis` | Career gap detection for target role |
| POST | `/career/optimize` | JD-specific resume optimization suggestions |
| POST | `/career/ats-scan` | Full ATS keyword scan by category |
| POST | `/career/tailor` | AI-powered resume tailoring for JD fit |
| POST | `/career/cover-letter` | Cover letter generation (text + LaTeX) |
| POST | `/career/networking-email` | Cold outreach email drafting |
| POST | `/career/rewrite-bullet` | Bullet point rewriting (3 STAR/XYZ versions) |
| POST | `/career/quick-ats` | Quick ATS score (0-100) + keyword gaps |
| POST | `/career/interview-prep` | Interview question generation with answers |
| POST | `/career/parse-linkedin` | LinkedIn profile text → structured resumeData |
| POST | `/career/salary-estimate` | Salary range estimation with factors |

### Payments
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/payments/create-checkout` | Required | Create Stripe checkout session |
| POST | `/payments/create-portal` | Required | Create Stripe billing portal session |
| POST | `/payments/webhook` | Public | Stripe webhook handler (raw body) |

### Upload
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/upload` | Required | Upload PDF file |
| GET | `/upload/extract` | Required | Extract text from uploaded PDF |

### Health
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/health` | Public | System health + service stats |

## Middleware Stack

```
Request → Request ID → Logging → Rate Limit Headers → CORS → Global Rate Limit
→ Request Timeout (60s/120s) → Body Parsing → Route Matching
→ Auth (requireAuth/optionalAuth) → Tier Attachment → Route-specific Rate Limit
→ Usage Check → Handler → Response Logging
```

## Production Infrastructure

- **LRU Cache** — In-memory with TTL and eviction (`lib/cache.js`)
- **Circuit Breaker** — CLOSED/OPEN/HALF_OPEN for Gemini API (`lib/circuitBreaker.js`)
- **Job Queue** — Concurrency-limited async queue for Docker compilations (`lib/jobQueue.js`)
- **Content Hashing** — SHA-256 cache keys (`lib/hashUtil.js`)
- **Structured Logging** — JSON logs with request IDs (`lib/logger.js`)
- **Env Validator** — Startup validation of required env vars (`lib/envValidator.js`)

## Security

- Input validation: type checks + string length truncation on all endpoints
- Error sanitization: generic messages in production, detailed in development
- LaTeX escaping: all user input escaped via `escapeLaTeX()` in templates
- Rate limiting: per-user (auth) and per-IP (public) limits
- CORS: strict origin whitelist, no wildcard patterns
- Helmet + HPP for HTTP security headers

## Testing

```sh
npm test          # 21 tests, zero external dependencies
npm run check     # Syntax check all .js files
```
