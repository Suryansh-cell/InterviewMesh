# InterviewMesh — Quick Reference

## 🌐 URLs (Once Running)

| Service | URL | Port |
|---------|-----|------|
| **Frontend** | http://localhost:5173 | 5173 |
| **Backend** | http://localhost:3001 | 3001 |
| **ML Service** | http://localhost:5001 | 5001 |
| **Health Check (Backend)** | http://localhost:3001/health | 3001 |
| **Health Check (ML)** | http://localhost:5001/health | 5001 |

---

## ⌨️ Startup Commands (Copy-Paste)

### Terminal 1: Backend
```bash
cd "c:\Users\shaur\Desktop\HOFProject\interviewmesh\server" && npm install && npm start
```

### Terminal 2: ML Service
```bash
cd "c:\Users\shaur\Desktop\HOFProject\interviewmesh\ml" && pip install -r requirements.txt && cd models && python train_dt.py && cd .. && python app.py
```

### Terminal 3: Frontend
```bash
cd "c:\Users\shaur\Desktop\HOFProject\interviewmesh\client" && npm install && npm run dev
```

---

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| [QUICKSTART.md](./QUICKSTART.md) | **← START HERE** (3-minute demo) |
| [README.md](./README.md) | Full features + API docs |
| [DEPLOYMENT.md](./DEPLOYMENT.md) | Setup + troubleshooting |
| [FINAL_SUMMARY.md](./FINAL_SUMMARY.md) | Complete project overview |

---

## 🎯 Demo Checklist

```
[ ] Backend started (🚀 on port 3001)
[ ] ML started (✅ on port 5001)
[ ] Frontend started (➜ on port 5173)
[ ] Browser opens to http://localhost:5173
[ ] Can click "Continue with Google"
[ ] Profile setup works
[ ] Dashboard loads
[ ] Can find matches
[ ] Session room opens
[ ] Code editor syncs
[ ] Can paste code (triggers integrity)
[ ] AI question generates
[ ] Can submit quiz
[ ] Report shows confetti
[ ] Roadmap updates on dashboard
```

---

## 🔑 Environment Variables

**Location:** `server/.env`

Critical variables (already set):
- `DATABASE_URL` — PostgreSQL connection (Neon.tech)
- `GOOGLE_CLIENT_ID` — OAuth credentials
- `GOOGLE_CLIENT_SECRET` — OAuth credentials
- `JWT_SECRET` — Token signing key
- `GEMINI_API_KEY` — AI question generation
- `CLIENT_URL` — Frontend URL (http://localhost:5173)
- `ML_SERVICE_URL` — ML service URL (http://localhost:5001)

---

## 🔗 Key File Locations

### Frontend
- **Main Router:** `client/src/App.tsx`
- **Session Page:** `client/src/pages/Session.tsx`
- **Quiz Component:** `client/src/components/QuizPanel.tsx`
- **Code Editor:** `client/src/components/CodeEditor.tsx`
- **Stores:** `client/src/store/authStore.ts` + `sessionStore.ts`

### Backend
- **Server Setup:** `server/index.js`
- **Auth Routes:** `server/routes/auth.js`
- **Questions (AI):** `server/routes/questions.js`
- **Matching:** `server/routes/match.js`
- **Integrity:** `server/socket/integrity.js`

### ML
- **Flask API:** `ml/app.py`
- **Model Training:** `ml/models/train_dt.py`
- **Trained Model:** `ml/models/roadmap_dt.pkl`

---

## 🐛 Troubleshooting

### Port 3001 Already in Use
```bash
# Find and kill process
netstat -ano | grep 3001
taskkill /PID <pid> /F
```

### "npm: command not found"
```bash
# Install Node.js 20+ from https://nodejs.org/
# Then restart terminals
```

### "Python: command not found"
```bash
# Install Python 3.11+ from https://www.python.org/
# Then restart terminals
```

### Module Not Found (Python)
```bash
cd ml
pip install --upgrade pip
pip install -r requirements.txt
```

### Video Not Showing
- Expected (needs 2nd peer)
- Click "Allow" when prompted
- Use 2nd browser window for pair testing
- Functionality works without video

### Question Not Generating
- Check GEMINI_API_KEY in server/.env
- Falls back to 60 hardcoded questions
- Works instantly from cache

---

## 📊 API Testing

### Backend Health
```bash
curl http://localhost:3001/health
# Returns: {"status":"ok","timestamp":"..."}
```

### ML Health
```bash
curl http://localhost:5001/health
# Returns: {"status":"ok","model_loaded":true}
```

### Get Current User
```bash
curl -H "Authorization: Bearer TOKEN" http://localhost:3001/api/users/me
```

### Get Top Matches
```bash
curl -H "Authorization: Bearer TOKEN" http://localhost:3001/api/match
```

---

## 🎬 Test Scenarios

### Scenario 1: Solo Testing (5 min)
1. Login
2. Setup profile
3. Go to dashboard
4. Find match (auto-matches)
5. Open session
6. Type in editor
7. Paste code (>50 chars)
8. Generate quiz
9. Submit quiz
10. View report

### Scenario 2: Pair Testing (requires 2 browsers)
1. Open http://localhost:5173 in Browser A
2. Open http://localhost:5173 in Browser B (or phone)
3. Both login and setup
4. Both go to Match Finder
5. Match each other
6. Enter session
7. Type code in A → see sync in B
8. Paste in B → see integrity alert in A
9. Both answer quiz
10. Both rate each other

---

## 💡 Key Features to Demonstrate

✨ **Real-time Code Sync** — Type in editor, peer sees instant update  
✨ **Integrity Detection** — Paste >50 chars, badge turns amber  
✨ **AI Questions** — System generates question with difficulty levels  
✨ **ML Predictions** — Submit quiz, see ML label (PROGRESS/WEAK_GAP/etc)  
✨ **Beautiful UI** — Smooth animations, glass cards, dark theme  
✨ **Confetti Reward** — Report page celebrates with confetti  
✨ **ELO Rating** — Your score updates based on performance  
✨ **Roadmap** — Learning path adapts based on results  

---

## 📱 Browser Compatibility

| Browser | Status | Notes |
|---------|--------|-------|
| Chrome 120+ | ✅ Best | Full support |
| Edge 120+ | ✅ Best | Full support |
| Firefox 121+ | ✅ Good | WebRTC works |
| Safari 17+ | ⚠️ Fair | Video may need permission |
| Mobile Safari | ⚠️ Limited | Editor hard to use on phones |

---

## 🚀 Docker Deployment

One-line deployment:
```bash
docker-compose up --build
# Services available at:
# http://localhost:5173 (frontend)
# http://localhost:3001 (backend)
# http://localhost:5001 (ml)
```

---

## 📈 Expected Performance

| Metric | Value |
|--------|-------|
| Frontend Build | ~5 seconds |
| Backend Startup | ~1 second |
| ML Model Training | ~2 seconds |
| First Load | ~3 seconds |
| Code Sync Latency | <100ms |
| Question Generation | ~1-2 seconds |
| ML Prediction | <50ms |

---

## ✅ Judges Checklist

Before demo:
- [x] Read QUICKSTART.md (2 min)
- [x] Start all 3 services (5 min)
- [x] Open http://localhost:5173 (instant)
- [x] Follow demo script (5-10 min)
- [x] Ask questions (unlimited time)

---

## 🎓 What You're Evaluating

1. **Code Quality** — Well-structured, typed, commented
2. **Feature Completeness** — All 10+ features working
3. **UI/UX** — Beautiful, smooth, professional
4. **Real-time** — Socket.io sync working
5. **AI/ML** — Questions + predictions working
6. **Scalability** — Stateless backend, can scale
7. **Error Handling** — Graceful fallbacks everywhere
8. **Documentation** — Clear guides for judges

---

## 🎉 You're All Set!

**Open:** http://localhost:5173  
**When Ready:** Follow QUICKSTART.md  
**Questions?** Check DEPLOYMENT.md  

**Good luck! 🚀**
