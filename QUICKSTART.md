# ⚡ InterviewMesh — QUICKSTART FOR JUDGES

**Time: 3 minutes from now to fully working demo**

---

## 🎬 The Fastest Route

### Copy-Paste These 3 Commands (in 3 separate terminals)

**Terminal 1:**
```bash
cd "c:\Users\shaur\Desktop\HOFProject\interviewmesh\server" && npm install && npm start
```

**Terminal 2:**
```bash
cd "c:\Users\shaur\Desktop\HOFProject\interviewmesh\ml" && pip install -r requirements.txt && cd models && python train_dt.py && cd .. && python app.py
```

**Terminal 3:**
```bash
cd "c:\Users\shaur\Desktop\HOFProject\interviewmesh\client" && npm install && npm run dev
```

---

## ✅ Wait For These Outputs

| Terminal | Expected Output |
|----------|-----------------|
| **Backend** | 🚀 InterviewMesh server running on port 3001 |
| **ML** | ✅ ML Model loaded successfully + Running on 5001 |
| **Frontend** | ➜ Local: http://localhost:5173/ |

---

## 🌐 Open Browser

**http://localhost:5173**

You're in! 🎉

---

## 📝 Demo Script (Follow This)

### Step 1: Login
```
1. See beautiful login page with code background
2. Click "Continue with Google"
3. Auto-redirect to setup (OAuth pre-configured)
```

### Step 2: Setup Profile
```
1. Select 3 skills: Click DSA, System Design, React
2. Click "Next"
3. Select 2 weak areas: Click OS, DBMS
4. Click "Next"
5. Select availability: Click Mon-Wed 4-6PM row
6. Click "Save"
```

### Step 3: Dashboard
```
1. See Welcome message with hero image
2. View stats: ELO (1000), Sessions (0), Integrity (100), Skills (3)
3. See roadmap with locked nodes
4. Click big "Find a Match Now" button
```

### Step 4: Match Finder
```
1. 3 cards appear with animation
2. Each shows: Avatar + Name + Skills + Match % + ELO + "Start Session"
3. Click "Start Session" on first card
```

### Step 5: Session Room
```
1. Full-screen layout splits:
   - Left 60%: Code editor (says "Start coding here...")
   - Right 40%: Video (top) + Chat (middle) + Quiz (bottom)
2. Type in code: "function hello() { console.log('AI Interview'); }"
   - You'll see it sync live on editor
3. Code bar at bottom shows "Synced" ✅
```

### Step 6: Integrity Test (CRITICAL DEMO)
```
1. In editor, paste this (50+ chars):
   "const fib = (n) => n <= 1 ? n : fib(n-1) + fib(n-2);"
2. Watch Integrity Badge turn AMBER with ⚠️
3. Toast notification appears: "Large paste detected"
4. Integrity score drops from 100 → 85
```

### Step 7: AI Question Generation
```
1. Scroll to Quiz Panel (bottom right)
2. Loading spinner spins ("Generating AI question...")
3. Question appears: "Explain the difference between a stack and a queue"
4. Set score slider to 75
5. Click "Submit Answer"
6. ML label appears: "🎉 PROGRESS" (green badge)
7. Toast: "Great progress! Topic advancing."
```

### Step 8: End Session
```
1. Click "End Session" button (top right, red)
2. Automatic redirect to Report page
3. See CONFETTI ANIMATION 🎉🎊
4. View stats:
   - Integrity: 85 (Review badge)
   - ELO Change: +15 (green ↑)
   - Questions: 1
   - ML Label: PROGRESS
5. Rate peer: Click 5 stars
6. Click "Back to Dashboard"
7. Dashboard now shows:
   - Sessions Done: 1
   - ELO: 1015 (was 1000)
   - Roadmap: DSA node now ACTIVE (purple)
```

---

## 🎯 What Judges Will See

### ✅ Core Features Working
- [x] Google OAuth (simulated login)
- [x] Skill profile setup with multi-step form
- [x] Dashboard with real stats and roadmap
- [x] Smart matching algorithm (3 candidates sorted by score)
- [x] Live Monaco code editor
- [x] Real-time code sync
- [x] Integrity detection (paste/tab flagging)
- [x] AI question generation (Gemini or fallback)
- [x] ML prediction labels (PROGRESS/WEAK_GAP/etc)
- [x] Beautiful confetti on report completion
- [x] Peer rating system
- [x] Roadmap node progression

### 🎨 Design Elements
- [x] Dark theme (#0F172A background)
- [x] Glass-morphism cards
- [x] Gradient text (indigo/purple)
- [x] Smooth animations (Framer Motion)
- [x] Loading skeletons
- [x] Toast notifications
- [x] Responsive layout

---

## ⚠️ Important Notes for Judges

1. **WebRTC Video:** Will show "Video unavailable" (no 2nd peer) — That's OK! Core features don't need it.

2. **Gemini API:** If free tier is exceeded, falls back to 60 hardcoded questions automatically.

3. **Google OAuth:** Pre-configured to auto-login without real OAuth (simulated flow).

4. **Database:** Live on Neon.tech (no local DB setup needed).

5. **ML Model:** Auto-trains on first ML startup (~2 sec).

---

## 🔧 If Something Breaks

| Issue | Fix |
|-------|-----|
| Port 3001 in use | Close old terminal, wait 10 sec |
| "npm not found" | Install Node.js v20+ |
| "Python not found" | Install Python 3.11+ |
| Video black screen | Expected (needs 2nd peer) |
| Question doesn't generate | Fallback question loads |
| No matches found | Refresh page or check DB |

---

## 📊 Tech Stack (What's Running)

```
Frontend: React 18 + Vite + TailwindCSS + Monaco Editor
Backend: Node.js + Express + Socket.io
ML: Python + Flask + scikit-learn
Database: PostgreSQL (Neon.tech)
Realtime: Socket.io (editor sync, integrity, signaling)
Animation: Framer Motion + canvas-confetti
```

---

## 🎬 Pro Tips for Judges

- **First time?** Follow demo script exactly (5 min)
- **Want to test matching?** Use 2 browser windows (both same setup)
- **Want to test video?** Need 2 devices, both on localhost:5173
- **Want to test integrity?** Paste >50 chars in editor
- **Want to see ML in action?** Submit quiz answer, watch label update
- **Want confetti?** End session and go to report page

---

## 📞 Emergency Contacts

All services should auto-start. If stuck:

1. **Check ports open:**
   ```bash
   netstat -ano | grep 3001  # Backend
   netstat -ano | grep 5001  # ML
   netstat -ano | grep 5173  # Frontend
   ```

2. **Check logs for errors:**
   - Backend: Look for 🚀 or ❌ in terminal
   - ML: Look for ✅ or ⚠️ in terminal
   - Frontend: Press F12 → Console tab

3. **Nuclear option (reset everything):**
   ```bash
   # Kill all terminals
   # Delete node_modules and __pycache__
   # Run install commands again
   ```

---

## ✨ Final Checklist Before Demo

- [ ] All 3 terminals show success messages
- [ ] Browser opens to http://localhost:5173
- [ ] Login page visible with hero image
- [ ] "Continue with Google" button clickable
- [ ] Profile setup loads after "login"
- [ ] Dashboard shows after setup
- [ ] "Find a Match" button works
- [ ] Match cards appear with smooth animation
- [ ] "Start Session" button opens room
- [ ] Code editor has content
- [ ] Quiz panel is visible
- [ ] Integrity badge updates on paste >50 chars
- [ ] Report page shows confetti on completion

---

**You're ready! Open http://localhost:5173 and start the demo!** 🚀

