# Project Prompt for Cursor AI: Overleaf-Style Resume Builder (LaTeX + Firebase)

## 📌 Overview

We're building a **full-stack resume builder application** that replicates the Overleaf editing and PDF compiling experience, tailored specifically for professional resumes using LaTeX. The app will provide a seamless way for users to edit `.tex` resume templates, compile them into PDFs, and preview/download them directly from the browser.

This project will use the **Deedy_reversed_resume** template only, and the user experience should reflect that of Overleaf – allowing real-time `.tex` editing with instant PDF preview and export.

---

## 🛠️ Tech Stack

### Frontend (React + Vite)
- React (Vite-based project)
- TailwindCSS for styling
- **Monaco Editor** for `.tex` editing experience (mimicking Overleaf)
- `pdf.js` or iframe for displaying compiled PDF preview
- Firebase Authentication (Google sign-in)
- Firebase Hosting

### Backend (Node.js + Express)
- Accepts `.tex` file via API
- Uses **Dockerized XeLaTeX** compiler to generate PDFs from `.tex` files
- Returns the compiled PDF back to the frontend

### Docker
- Use the `blang/latex:ctanfull` image for XeLaTeX compilation
- Handles all LaTeX-related rendering within the container

### Firebase Services
- Firebase Auth for login/signup
- Firebase Firestore or Realtime DB to store resume data
- Firebase Storage to save compiled PDFs (optional feature)
- Firebase Hosting for frontend deployment

---

## 🔄 Application Flow

1. **User logs in** via Firebase Auth (Google only)
2. After login, user sees a Monaco Editor populated with `Deedy_reversed_resume` LaTeX template
3. User can edit the LaTeX code directly in-browser
4. User clicks `Compile` button:
   - Editor content is sent to backend via `/compile` POST API
   - Backend saves `.tex` file and compiles via Docker
   - PDF is sent back to frontend
5. Frontend renders the PDF inline for preview
6. (Optional) User can download or save the PDF to Firebase Storage

---

## 🚀 Key Functional Requirements

- 📄 Monaco-based `.tex` editor with real-time syntax highlighting
- 🔁 Button to trigger `.tex` to `.pdf` compilation
- 📤 PDF preview inside browser using `pdf.js` or iframe
- 🛠 Backend Express route `/compile` to compile `.tex` and return PDF
- 🐳 Docker setup with `blang/latex:ctanfull` to handle XeLaTeX build
- 🔒 Firebase Auth (Google Sign-In)
- 🗃 Firebase Firestore for storing user templates
- ☁ Firebase Storage for saving compiled PDFs (if required)

---

## 🐳 Docker Setup

Use the following Docker image: `blang/latex:ctanfull`

Sample compile command:

```bash
docker run --rm \
  -v $(pwd):/data \
  -w /data \
  blang/latex:ctanfull \
  xelatex -interaction=nonstopmode -output-directory=out Deedy.tex
```

Docker is used to eliminate dependency issues on local OS and ensure consistent LaTeX builds.

---

## 🧠 Why This Stack?

- **Overleaf editing** via Monaco
- **XeLaTeX-based compiling** via Docker ensures compatibility across systems
- **React + Firebase** is scalable, frontend-first, and ideal for JAMstack deployment
- **Deedy template** is production-grade and widely recognized for resumes

---

## 📁 Folder Structure Suggestion

```
root/
├── backend/
│   ├── server.js
│   ├── routes/compile.js
│   └── utils/dockerRunner.js
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── components/Editor.jsx
│   │   ├── components/Preview.jsx
│   │   └── firebase.js
├── templates/
│   └── Deedy_reversed_resume.tex
├── Dockerfile
├── .env
└── README.md
```

---

## 🔗 External Resources

- Deedy template (reversed): [https://www.overleaf.com/latex/templates/deedy-resume-reversed/](https://www.overleaf.com/latex/templates/deedy-resume-reversed/)
- Docker LaTeX image: [https://hub.docker.com/r/blang/latex](https://hub.docker.com/r/blang/latex)
- Firebase Docs: [https://firebase.google.com/docs](https://firebase.google.com/docs)
- Monaco Editor: [https://microsoft.github.io/monaco-editor/](https://microsoft.github.io/monaco-editor/)

---

## 🧪 Optional Enhancements (Post-MVP)

- Support multiple resume templates
- Add version control (snapshot resumes)
- Collaborative editing (multi-user sessions)
- Dark mode editor toggle

---

## 🧾 Summary

This project aims to create a cloud-first resume editor tailored for LaTeX professionals using the `Deedy_reversed` template. By leveraging Docker for LaTeX rendering, Monaco for rich editing, and Firebase for auth & hosting, the goal is to offer a simplified Overleaf-like UX optimized for creating professional resumes.

---

*Generated for Cursor AI on 2025-07-16.*
