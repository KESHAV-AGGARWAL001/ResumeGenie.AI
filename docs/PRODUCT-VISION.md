# ResumeGenie.AI — Product Vision

ResumeGenie.AI is an **AI-powered career optimization platform** designed to help job seekers **create better resumes, understand their career gaps, and improve their chances of getting interviews**.

The platform brings together:

- Structured resume creation  
- LaTeX-quality resume rendering  
- AI-driven resume analysis  
- Job-description alignment  
- Career insights and (future) career gap detection  

The long-term goal is to build **an AI Career Assistant**, not just a resume builder.

---

## Core Product Capabilities (Today)

The system currently supports four main workflows.

### 1. Structured Resume Builder

Users create resumes using a structured, guided form instead of writing LaTeX.

Sections include:

- Personal Information  
- Social Links  
- Experience  
- Projects  
- Skills  
- Education  
- Achievements  
- Certifications  

The platform converts structured data into **LaTeX templates**, allowing users to generate **high-quality professional PDFs automatically**.

This lets users produce **LaTeX-quality resumes without any LaTeX expertise**.

### 2. Multi-Template Resume Rendering

Users can choose from several professional resume templates:

- Deedy  
- Jakes  
- Modern  
- ModernCV  
- ModernDeedy  

The template system dynamically generates LaTeX based on:

```text
resumeData
templateId
```

Then the system compiles the LaTeX into a PDF using a **Dockerized XeLaTeX environment**.

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
- (Future refinement) Analyze the resume created inside the platform against specific job descriptions.  

The system:

1. Extracts plain text from PDFs using `pdf-parse`.  
2. Sends it to the AI analysis service (currently GPT-4o-mini via OpenAI).  

AI analysis provides:

- Overall resume score  
- Score breakdown (structure, bullet quality, quantification, skill relevance, chronology consistency)  
- Structural issues and suggested fixes  
- Bullet-level improvements (rewritten bullets)  
- Missing keywords and skill gaps  
- Job-description similarity score (when a JD is provided)  

---

## Long-Term Product Direction

ResumeGenie.AI is evolving towards a **full AI Career Assistant** with capabilities beyond resume generation.

### 1. Career Gap Detection

AI will identify missing skills or experience for specific job roles and provide concrete improvement plans.

Example insight:

```text
Your profile currently matches Backend Engineer roles at 62%.

To increase your chances:
• Add hands-on experience with distributed systems or message queues.
• Demonstrate API scalability (through performance metrics or benchmarks).
• Include experience with caching (Redis/Memcached) or event-driven architectures.
```

### 2. Resume Personalization

Automatically generate multiple resume versions tailored for:

- Backend roles  
- Frontend roles  
- Full-stack roles  
- DevOps / SRE roles  
- ML / Data roles (future)  

Each version would:

- Re-weight sections (e.g., projects vs experience).  
- Emphasize different bullet points.  
- Reorder skills by relevance to the target role.  

### 3. Job Matching

AI will recommend jobs based on:

- User skills and experience  
- Resume content  
- Location preferences / remote preference  
- Target seniority and compensation bands  

Over time, the system can:

- Track which jobs users apply to.  
- Learn which profiles get callbacks.  
- Improve its matching and scoring models.  

### 4. Application Tracking

Users will be able to track their job applications inside the platform:

- Companies and roles applied to  
- Stages (Applied / Phone Screen / Technical / Onsite / Offer)  
- Outcomes and feedback  

This history will power:

- Personalized suggestions (e.g., “You often lose at System Design rounds — focus on those skills”).  
- Better AI guidance for future applications.  

### 5. Recruiter Integration (Future Phase)

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

Frameworks and tools:

- **React 19**  
- **Vite 7**  
- **TailwindCSS 4**  
- **Monaco Editor** for LaTeX editing  

Services:

- **Firebase Authentication** (Google sign-in)  
- **Firestore** for:
  - Saving `resumeData`  
  - Saving LaTeX source per user  

Primary responsibilities:

- Structured resume form builder (multi-step)  
- Template selection UI and preview cards  
- Real-time PDF preview (via backend compile endpoint)  
- LaTeX editor experience for power users  
- AI suggestion and analysis UIs:
  - AI Consultant (form-based resume + JD)  
  - Resume PDF Analyzer (uploaded PDF + JD)  

### Backend

Framework:

- **Node.js**  
- **Express 5**  

Key libraries:

- **Joi** — Input validation for `resumeData`.  
- **multer** — PDF file uploads.  
- **pdf-parse** — PDF text extraction.  
- **uuid** — Per-compilation work directories.  

Primary responsibilities:

- Expose REST endpoints for:
  - Compiling LaTeX to PDF (`/compile`)  
  - Generating LaTeX from structured data (`/template/generate`, `/resume/generate-latex`)  
  - Validating `resumeData` (`/resume/validate`)  
  - Uploading PDFs and extracting text (`/upload`, `/upload/extract`)  
  - AI resume analysis (`/ai/analyze`)  
- Enforce schema validation for structured resume data.  
- Orchestrate Docker-based LaTeX compilation with custom fonts and templates.  

### AI Layer

Model:

- **GPT-4o-mini** (via OpenAI SDK)

Responsibilities:

- Evaluate resume quality and assign an overall score.  
- Break down scores into dimensions (structure, bullet quality, quantification, relevance, chronology).  
- Suggest improvements and rewrite bullet points.  
- Identify missing or weak keywords based on job descriptions.  
- Compute similarity / match scores between resumes and job descriptions.  

The AI layer is stateless per request, but can be combined with user history (Firestore) in future iterations.

### LaTeX Rendering System

Environment:

```text
blang/latex:ctanfull
XeLaTeX
Custom fonts (Lato / Raleway)
Custom resume templates and classes
```

Pipeline:

```text
Resume Data
→ Template Engine (templateId)
→ LaTeX Source
→ Docker XeLaTeX
→ Compiled PDF
```

This design:

- Isolates LaTeX complexity behind a stable API.  
- Keeps fonts and classes consistent across machines.  
- Simplifies future template additions.  

---

## System Workflows (Detailed)

### Resume Creation Flow

```text
User Form Input
→ Build resumeData in frontend state
→ User selects template (templateId)
→ POST /template/generate (resumeData + templateId)
→ Backend template engine generates LaTeX
→ Frontend updates LaTeX editor
→ POST /compile (latex)
→ Docker XeLaTeX compiles PDF
→ Frontend displays PDF preview + download button
```

### Resume Analysis Flow (PDF Upload)

```text
User uploads PDF
→ POST /upload
→ Backend stores file and returns URL
→ GET /upload/extract?filename=...
→ Backend runs pdf-parse to get plain text
→ Frontend sends { resumeText, jobDescription? } to /ai/analyze
→ AI layer returns scores, issues, rewritten bullets, missing keywords
→ Frontend displays analysis across tabs (summary, scores, issues, bullets)
```

### Real-Time Editing Flow (LaTeX)

```text
User edits LaTeX in Monaco editor
→ Clicks "Compile"
→ Frontend sends current LaTeX to /compile
→ Backend runs Docker XeLaTeX
→ PDF stream is sent back
→ Frontend updates preview iframe
```

---

## Product Philosophy

Three core principles guide ResumeGenie.AI:

1. **Professional output**  
   Resumes must look and read like those from top-performing candidates at leading tech companies and competitive roles.

2. **AI-driven insights**  
   The platform should not just “generate content”, but **explain weaknesses**, highlight gaps, and provide actionable improvements.

3. **Career optimization**  
   The north star metric is **improved interview and offer rates**, not just the number of PDFs generated.

Over time, the AI Career Assistant should help users move from:

> “I need a resume” → “I have a clear, data-driven plan to grow my career.”

