# Backend (Node.js + Express)

## Setup
1. Copy `.env.example` to `.env` and adjust if needed
2. Install dependencies:
   ```sh
   npm install
   ```
3. Start the server:
   ```sh
   npm start
   ```

## Features
- /compile route for LaTeX to PDF
- Uses Docker (blang/latex:ctanfull) for XeLaTeX
- CORS enabled 