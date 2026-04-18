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

---

## Core Product Capabilities

### 1. Structured Resume Builder

Users create resumes through a guided, multi-step form instead of writing LaTeX directly.

Supported sections:

- Personal Information  
- Social Links  
- Experience  
- Projects  
- Skills  
- Education  
- Achievements  
- Certifications  

The structured `resumeData` object is converted into LaTeX using a template engine, then compiled into **high-quality professional PDFs**. This delivers **LaTeX-quality output without requiring LaTeX knowledge**.

### 2. Multi-Template Resume Rendering

Users can choose from multiple professional templates, for example:

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

There are two AI analysis entry points:

- **Resume PDF Analyzer** — Upload an existing resume PDF, extract text, then analyze.  
- **In-app AI Consultant (WIP)** — Analyze the user’s structured resume data against a job description.

The backend uses:

- `pdf-parse` to extract plain text from uploaded PDFs.  
- An OpenAI-powered service (GPT-4o-mini) to evaluate resumes and (optionally) match them to job descriptions.

AI analysis can provide:

- Overall resume score  
- Score breakdown (structure, bullet quality, quantification, skill relevance, chronology consistency)  
- Structural issues and suggested fixes  
- Bullet-level rewrites  
- Missing or weak keywords  
- Job-description similarity score (when a JD is provided)  

For a deeper product vision, see [`docs/PRODUCT-VISION.md`](docs/PRODUCT-VISION.md).

---

## Technical Architecture

### Frontend

Built with:

- **React 19** + **Vite 7**  
- **TailwindCSS 4** for styling  
- **Monaco Editor** for LaTeX editing  
- **Firebase** for:
  - Google Authentication  
  - Firestore persistence of `resumeData` and LaTeX per user  

Responsibilities:

- Structured resume form interface (multi-step FormBuilder)  
- Template selection and preview gallery  
- Real-time PDF preview and download  
- LaTeX editor mode for power users  
- AI analysis UI (AI Consultant + PDF Resume Analyzer)  

### Backend

Built with:

- **Node.js**  
- **Express 5**  
- **Joi** for validating `resumeData`  
- **multer** for PDF uploads  
- **pdf-parse** for PDF text extraction  

Responsibilities:

- Validating and transforming structured resume data  
- LaTeX template rendering across multiple templates  
- Orchestrating XeLaTeX compilation via Docker  
- Exposing AI analysis endpoints for resume scoring and JD matching  
- Handling PDF upload and text extraction  

### AI Layer

Current model:

- **GPT-4o-mini** (via OpenAI SDK)

Responsibilities:

- Resume scoring and issue detection  
- Bullet rewriting and stylistic improvements  
- Keyword and skills gap analysis  
- Job description alignment (similarity scoring)  

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
→ AI Analysis (GPT-4o-mini)
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

## Product Philosophy

ResumeGenie.AI is built on three principles:

1. **Professional output** — LaTeX-quality resumes that look credible for top tech companies and competitive roles.  
2. **AI-driven insights** — Go beyond formatting to explain *why* a resume is weak or strong.  
3. **Career optimization** — Help users steadily improve their interview chances, not just generate a PDF.  

---

## Long-Term Direction

ResumeGenie.AI is evolving toward a **full AI Career Assistant**. Planned capabilities include:

- **Career Gap Detection** — Identify missing experiences or skills for target roles (e.g., “Add distributed systems exposure, API scalability, caching/messaging systems”).  
- **Resume Personalization** — Automatically generate tailored resume variants for backend, frontend, full-stack, DevOps, etc.  
- **Job Matching** — Recommend jobs based on skills, experience, and preferences; score how well a resume fits each role.  
- **Application Tracking** — Track applications, interview pipelines, and outcomes inside the platform.  
- **Recruiter Integration (future)** — Allow companies to post roles and search candidate profiles, with AI ranking and matching.  

See [`docs/PRODUCT-VISION.md`](docs/PRODUCT-VISION.md) for a deeper roadmap.

---

## Setup

### Prerequisites

- Node.js (v14 or higher)
- Docker
- PowerShell (for Windows)

### Installation

1. Clone this repository  
2. Install dependencies:

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

3. Build the Docker image for LaTeX compilation:

```powershell
# From the project root directory
.\build-docker-image.ps1
```

---

## Running the Application

1. Start the backend server:

```bash
cd backend
npm start
```

2. Start the frontend development server:

```bash
cd frontend
npm run dev
```

3. Open your browser and navigate to the URL shown in the frontend console (typically `http://localhost:5173`).  
   The backend runs at `http://localhost:5000` by default.

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
