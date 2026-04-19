# InterviewMesh Deployment Guide

Follow these steps to deploy your full-stack application to production.

## Phase 0: Push to GitHub
If your project is not on GitHub, run these commands in your project root:
```bash
git init
git add .
git commit -m "Deployment ready"
git branch -M main
git remote add origin <YOUR_GITHUB_REPO_URL>
git push -u origin main
```

## Phase 1: Backend Deployment (Render)
1. In Render, create a **New Web Service**.
2. Connect your GitHub repository.
3. Configure settings:
   - **Name:** `interviewmesh-backend`
   - **Root Directory:** `server`
   - **Build Command:** `npm install`
   - **Start Command:** `node index.js`
4. Add **Environment Variables**:
   - `DATABASE_URL`: Your PostgreSQL link from Neon/Render.
   - `JWT_SECRET`: A secure random string.
   - `CLIENT_URL`: Your Vercel URL (e.g., `https://im-frontend.vercel.app`).
   - `ML_SERVICE_URL`: Your Render ML URL (see Phase 2).

## Phase 2: ML Service Deployment (Render)
1. Create another **New Web Service**.
2. Configure settings:
   - **Name:** `interviewmesh-ml`
   - **Root Directory:** `ml`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `gunicorn app:app`
3. Copy the URL of this service and add it to the backend's `ML_SERVICE_URL` variable.

## Phase 3: Frontend Deployment (Vercel)
1. In Vercel, create a **New Project** and import your repo.
2. Configure settings:
   - **Framework Preset:** Vite
   - **Root Directory:** `client`
3. Add **Environment Variables**:
   - `VITE_API_URL`: Your Render backend URL. (Example: `https://interviewmesh-backend.onrender.com`)

---

## ⚠️ Important Note
1. Ensure the backend `CLIENT_URL` matches exactly with the Vercel URL (check for trailing slashes).
2. If you see CORS errors, double-check that `CLIENT_URL` is set correctly on Render.
