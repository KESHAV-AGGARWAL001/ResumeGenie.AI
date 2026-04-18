# Complete Startup Guide for LaTeX Resume Builder

## Prerequisites

1. **Docker Desktop** must be installed and running
2. **Node.js** (v14 or higher) must be installed

---

## Step-by-Step Startup Instructions

### 1️⃣ Start Docker Desktop

- Open Docker Desktop application
- Wait for it to fully start (Docker icon in system tray should be green)
- Verify Docker is running:
  ```powershell
  docker --version
  ```

### 2️⃣ Build LaTeX Docker Image (First Time Only)

From the project root directory (`d:\latex-editor`):

```powershell
.\build-docker-image.ps1
```

Or manually:

```powershell
docker build -t latex-editor-custom .
```

This builds a custom Docker image with:
- XeLaTeX compiler
- Lato and Raleway fonts
- Deedy resume class file

**Note:** This only needs to be done once (or when fonts/template change).

### 3️⃣ Start Backend Server

Open a terminal in `d:\latex-editor\backend`:

```powershell
cd d:\latex-editor\backend
npm install  # First time only
npm start
```

You should see:
```
Server running on port 5000
```

**Keep this terminal open!**

### 4️⃣ Start Frontend Server

Open a **new terminal** in `d:\latex-editor\frontend`:

```powershell
cd d:\latex-editor\frontend
npm install  # First time only
npm run dev
```

You should see:
```
  VITE v7.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

**Keep this terminal open too!**

### 5️⃣ Open Application

Open your browser and navigate to:
```
http://localhost:5173
```

---

## Testing the Application

### Quick Test - Form Mode

1. **Sign in** with Google
2. **Fill out the form**:
   - Personal Info: Enter your name and email (required)
   - Navigate through all 8 steps
   - Add at least one experience or project
3. **Click "Generate Resume"** on the final step
4. **Wait for PDF** to appear in the right panel

### Quick Test - Advanced Mode

1. **Click the mode toggle** to switch to "Advanced Mode"
2. **Edit the LaTeX** code in the Monaco editor
3. **Click "Compile"**
4. **Verify PDF** updates

---

## Troubleshooting

### Docker Issues

**Problem:** "Cannot connect to Docker daemon"
- **Solution:** Make sure Docker Desktop is running

**Problem:** "Image not found: latex-editor-custom"
- **Solution:** Run `.\build-docker-image.ps1` to build the image

**Problem:** Docker build fails with font errors
- **Solution:** Verify fonts exist in `backend/templates/fonts/`

### Backend Issues

**Problem:** "Port 5000 already in use"
- **Solution:** Kill the process using port 5000 or change the port in `backend/server.js`

**Problem:** "Module not found" errors
- **Solution:** Run `npm install` in the backend directory

### Frontend Issues

**Problem:** "Module not found" errors
- **Solution:** Run `npm install` in the frontend directory

**Problem:** Firebase errors
- **Solution:** Check `frontend/.env` for correct Firebase configuration

### Compilation Issues

**Problem:** PDF doesn't generate
- **Solution:** 
  1. Check backend terminal for error messages
  2. Verify Docker is running
  3. Check `backend/tmp/` for LaTeX error logs

---

## Quick Reference

### Terminal 1 - Backend
```powershell
cd d:\latex-editor\backend
npm start
```

### Terminal 2 - Frontend
```powershell
cd d:\latex-editor\frontend
npm run dev
```

### Terminal 3 - Docker Build (when needed)
```powershell
cd d:\latex-editor
.\build-docker-image.ps1
```

---

## What Happens When You Click "Generate Resume"

1. **Frontend** sends form data (JSON) to backend `/compile` endpoint
2. **Backend** validates the data using Joi schema
3. **Backend** generates LaTeX code from JSON using `latexGenerator.js`
4. **Backend** writes LaTeX to a temp file
5. **Backend** runs Docker container with XeLaTeX compiler
6. **Docker** compiles LaTeX to PDF
7. **Backend** sends PDF back to frontend
8. **Frontend** displays PDF in preview panel

---

## Next Steps After Testing

Once everything works:

1. ✅ Test all form fields
2. ✅ Test mode switching
3. ✅ Test Firebase save/load
4. ✅ Download a PDF
5. 📝 Start planning AI features (bullet point suggestions, job matching)

---

**Need help?** Check the error messages in the backend terminal - they usually tell you exactly what went wrong!
