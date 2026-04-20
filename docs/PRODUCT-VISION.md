# ResumeGenie.AI — Product Vision

ResumeGenie.AI is an **AI-powered career optimization platform** designed to help job seekers **create better resumes, understand their career gaps, and improve their chances of getting interviews**.

The platform brings together:

- Structured resume creation  
- LaTeX-quality resume rendering  
- AI-driven resume analysis and bullet rewriting  
- Job-description alignment and ATS optimization  
- Career insights, interview preparation, and salary estimation  
- LinkedIn profile import for quick resume setup  

The long-term goal is to build **an AI Career Assistant**, not just a resume builder.

---

## Core Product Capabilities (Today)

The system currently supports the following main workflows.

### 1. Structured Resume Builder

Users create resumes using a structured, guided form instead of writing LaTeX.

Sections include:

- Personal Information  
- Social Links  
- Experience (with inline AI bullet rewriting)  
- Projects (with inline AI bullet rewriting)  
- Skills  
- Education  
- Achievements  
- Certifications  

The platform converts structured data into **LaTeX templates**, allowing users to generate **high-quality professional PDFs automatically**.

This lets users produce **LaTeX-quality resumes without any LaTeX expertise**.

**AI Bullet Rewriter** — Each bullet point in experience and project sections has a sparkle icon that generates 3 improved versions using STAR/XYZ methodology with explanations of what was improved.

**LinkedIn Import** — Users can paste their LinkedIn profile text and auto-fill resume sections. The AI parses the unstructured text into structured resume data with a confidence score and preview before import.

### 2. Multi-Template Resume Rendering

Users can choose from several professional resume templates:

- Deedy  
- Jakes  
- Modern  
- ModernCV  
- ModernDeedy  

The template system dynamically generates LaTeX based on `resumeData` and `templateId`, then compiles via a **Dockerized XeLaTeX environment**.

This ensures:

- Consistent formatting  
- Reproducible builds  
- Compatibility with modern fonts and document classes  

### 3. Real-Time Resume Editing

Users can switch between two editing modes:

- **Form Mode** — Structured input for each resume section.  
- **Code Mode** — Advanced users can edit the **LaTeX source** directly in a Monaco editor.  

Both modes share the same compilation pipeline:

```text
LaTeX → Docker XeLaTeX → PDF
```

The generated PDF is displayed in a **real-time preview panel** with download support.

### 4. AI Resume Analysis

Users can:

- Upload an existing resume PDF for analysis.  
- Analyze the resume created inside the platform against specific job descriptions.  

The system uses **Gemini 2.5 Flash** (via `@google/genai` SDK):

1. Extracts plain text from PDFs using `pdf-parse`.  
2. Performs deterministic scoring (rule-based) for numeric scores.  
3. Uses AI for qualitative analysis, suggestions, and rewrites.  

AI analysis provides:

- Overall resume score  
- Score breakdown (technical depth, engineering impact, technology relevance, project complexity, role alignment)  
- Structural issues and suggested fixes  
- Bullet-level improvements (rewritten bullets)  
- Missing keywords and skill gaps  
- Job-description similarity score (when a JD is provided)  

### 5. Real-Time ATS Score Widget

A floating widget on builder and editor pages that provides quick ATS compatibility feedback:

- Enter a target job description  
- Get a score (0-100) with color coding (green/amber/red)  
- See top 3 missing keywords  
- Get the highest-impact suggestion  
- Collapsible and dismissible — stays out of the way until needed  

### 6. Career Insights (7 AI Tabs)

| Feature | Description |
|---|---|
| **Career Gap Detection** | Identifies missing skills/experience for a target role with action plans |
| **JD Optimization** | Suggests specific resume modifications to maximize JD alignment |
| **ATS Keyword Scan** | Analyzes keyword matches/gaps by category (technical, soft skills, tools) |
| **Resume Tailoring** | Rewrites resume content to maximize JD fit while preserving structure |
| **Cover Letter Generation** | Generates plain text + compilable LaTeX cover letters |
| **Networking Email Draft** | Drafts cold outreach emails with formal/conversational/brief tone options |
| **Salary Estimator** | Estimates salary range (low/median/high) with factors analysis and negotiation tips |

### 7. AI Interview Preparation

Full interview prep page accessible from the top navigation:

- Select interview type: **Behavioral**, **Technical**, or **Situational**  
- Enter a job description for targeted questions  
- AI generates 8-10 tailored questions based on the user's resume  
- Each question includes a model answer and a preparation tip  
- Collapsible cards for easy review  

### 8. Free Resume Roast (Public)

A public, no-authentication-required page at `/roast` for viral growth:

- Paste resume text — no sign-up needed  
- AI delivers brutally honest, humorous feedback  
- Roast score (0-100) with flame rating  
- Specific improvement suggestions  
- Meme-style verdict  
- CTA to convert roast users into full platform users  

### 9. Subscription & Payments

Three-tier system powered by **Stripe Checkout + Webhooks**:

| Tier | Compilations | AI Analyses | Templates | Price |
|---|---|---|---|---|
| **Starter** | 3/day | 1/day | 2 | Free |
| **Pro** | Unlimited | 10/day | 5 | $9.99/mo |
| **Enterprise** | Unlimited | Unlimited | 5 + custom | $29.99/mo |

---

## Long-Term Product Direction

ResumeGenie.AI is evolving towards a **full AI Career Assistant** with capabilities beyond resume generation.

### 1. Job Matching

AI will recommend jobs based on:

- User skills and experience  
- Resume content  
- Location preferences / remote preference  
- Target seniority and compensation bands  

Over time, the system can:

- Track which jobs users apply to.  
- Learn which profiles get callbacks.  
- Improve its matching and scoring models.  

### 2. Application Tracking

Users will be able to track their job applications inside the platform:

- Companies and roles applied to  
- Stages (Applied / Phone Screen / Technical / Onsite / Offer)  
- Outcomes and feedback  

This history will power:

- Personalized suggestions (e.g., "You often lose at System Design rounds — focus on those skills").  
- Better AI guidance for future applications.  

### 3. Recruiter Integration (Future Phase)

In a later phase, companies may:

- Post job openings directly on ResumeGenie.AI.  
- Search candidate profiles (based on anonymized or opt-in data).  

AI can:

- Rank candidates based on job requirements.  
- Highlight best-fit candidates and explain *why* they match.  

This creates a **two-sided marketplace** where:

- Candidates improve their profiles using AI.  
- Recruiters efficiently discover great matches.  

---

## Technical Architecture (High Level)

### Frontend

- **Next.js 15** (App Router) + **React 19** + **TypeScript**  
- **TailwindCSS 4** for styling  
- **Monaco Editor** for LaTeX editing  
- **Zustand** for state management  
- **Firebase Authentication** (Google sign-in)  
- **Firestore** for data persistence  

Route groups:
- `(app)` — Authenticated: builder, editor, analyzer, career, interview-prep  
- `(marketing)` — Public: landing, pricing, templates, blog, roast  

### Backend

- **Node.js 20** + **Express 5**  
- **Gemini 2.5 Flash** via `@google/genai` SDK  
- **Firebase Admin SDK** for auth + Firestore  
- **Stripe** for payments  
- Built-in LRU Cache, Circuit Breaker, Job Queue, Structured Logging  

### Security

- Content Security Policy headers  
- CORS strict origin whitelist  
- Input validation and length truncation  
- LaTeX escaping for all user input  
- Error sanitization in production  
- Iframe sandbox on PDF preview  
- Redirect URL validation for Stripe  
- Error boundaries in both route groups  

---

## Product Philosophy

Three core principles guide ResumeGenie.AI:

1. **Professional output**  
   Resumes must look and read like those from top-performing candidates at leading tech companies and competitive roles.

2. **AI-driven insights**  
   The platform should not just "generate content", but **explain weaknesses**, highlight gaps, and provide actionable improvements.

3. **Career optimization**  
   The north star metric is **improved interview and offer rates**, not just the number of PDFs generated.

Over time, the AI Career Assistant should help users move from:

> "I need a resume" → "I have a clear, data-driven plan to grow my career."
