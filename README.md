# 🎯 InterviewMesh — AI-Powered Peer-to-Peer Mock Interview Platform

**A HackOFiesta 7.0 (ML/AI Track) Submission**

"Tinder for Mock Interviews" — Match with peers, practice coding together in a live editor, get AI-generated personalized learning roadmaps.

---

## ⚡ Quick Start (3 Steps)

### 1️⃣ **Backend**
```bash
cd server
npm install
node index.js
# Output: 🚀 InterviewMesh server running on port 3001
```

### 2️⃣ **ML Service**
```bash
cd ml
pip install -r requirements.txt
cd models && python train_dt.py && cd ..
python app.py
# Output: ✅ Model loaded successfully / Running on port 5001
```

### 3️⃣ **Frontend**
```bash
cd client
npm install
npm run dev
# Output: http://localhost:5173/
```

Open **3 terminals**, run all three commands above in parallel. Then visit `http://localhost:5173` in your browser.

---

## 📋 Technology Stack

**Frontend:** React 18 + TypeScript + Vite + TailwindCSS + shadcn/ui + Monaco Editor + Framer Motion + Socket.io

**Backend:** Node.js 20 + Express + Socket.io + Passport OAuth + PostgreSQL

**ML/AI:** Python 3.11 + Flask + scikit-learn + Decision Tree + Anomaly Detection

---

## 🎨 Feature Showcase

### ✅ Implemented Features

#### **1. Authentication**
- Google OAuth 2.0 (free tier, no email/password)
- JWT token-based sessions
- Secure middleware on all protected routes

#### **2. Peer Matching Algorithm** 
```
Score = 0.35×OverlapScore + 0.25×SkillDiff + 0.15×Complementary + 0.15×Rating + 0.1×ELO
```
- Real-time online status tracking
- Availability overlap calculation
- ELO-based skill rating (1000 base)
- Fallback to "available soon" if no peers online

#### **3. Live Code Editor**
- Monaco Editor with real-time sync via Socket.io
- Language selection (JS, TS, Python, Java, C++)
- Cursor position tracking
- Code copy button

#### **4. WebRTC Video/Audio**
- Peer-to-peer video with automatic fallback
- Audio/video toggle controls
- Local video PiP overlay
- Graceful error handling

#### **5. AI Question Generation**
- Google Gemini 2.0 Flash API (free tier)
- 60 fallback questions across 6 topics
- Topics: DSA, LLD, System Design, OS, DBMS, CN
- 3 difficulty levels: easy, medium, hard
- Question caching to avoid re-generation

#### **6. Integrity Detection** 
Real-time anomaly detection:
```
Score = 0.4×PasteFlag + 0.3×TabSwitchFlag + 0.3×SpeedFlag
Status: clean (>0.6) | review (>0.3) | suspicious
```
- Paste detection (>50 chars = warning)
- Tab switch tracking (>4 = flag)
- Solve time vs peer average
- Toast notifications on violations

#### **7. ML Roadmap Predictor**
```
Features: [score_ratio, relative_time, attempts]
Labels: PROGRESS | WEAK_GAP | STRONG_GAP | RETRY
```
- Trained Decision Tree model
- Roadmap node progression
- ELO score updates based on quiz performance

#### **8. Session Report**
- Confetti animation on completion
- Quiz breakdown table with ML labels
- Integrity score with status badge
- ELO change visualization
- Peer rating system

#### **9. User Experience**
- 7 fully animated pages with Framer Motion
- Loading skeletons on all data fetches
- Toast notifications (react-hot-toast)
- Responsive design (mobile-friendly)
- Dark theme with gradient accents
- Glass-morphism UI components

---

## 📁 Project Structure

```
interviewmesh/
├── client/                          # React Frontend
│   ├── src/
│   │   ├── pages/                  # 7 Full Pages (Login, Auth, Setup, Dashboard, Match, Session, Report, NotFound)
│   │   ├── components/             # 9 Reusable Components (CodeEditor, VideoPanel, QuizPanel, etc.)
│   │   ├── store/                  # Zustand stores (authStore, sessionStore)
│   │   ├── hooks/                  # Custom hooks (useSocket, usePeer)
│   │   ├── api/                    # Axios configuration
│   │   ├── index.css               # Design system + Tailwind
│   │   ├── main.tsx                # Entry point
│   │   └── App.tsx                 # Router + Protected routes
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── package.json
│   └── index.html                  # Fonts + Meta tags
│
├── server/                          # Node.js Backend
│   ├── routes/                     # 6 API Routes (auth, users, match, sessions, quiz, questions)
│   ├── socket/                     # 3 Socket namespaces (editor, signaling, integrity)
│   ├── middleware/                 # JWT auth middleware
│   ├── db/                         # PostgreSQL connection pool
│   ├── .env                        # Secrets (Google OAuth, DB URL, Gemini API)
│   ├── index.js                    # Express server + Socket.io
│   └── package.json
│
├── ml/                              # Python ML Service
│   ├── app.py                      # Flask API (/predict, /anomaly, /health)
│   ├── models/
│   │   ├── train_dt.py            # Decision Tree training script
│   │   └── roadmap_dt.pkl         # Trained model (binary)
│   ├── requirements.txt            # Python dependencies
│   └── .gitignore
│
└── docker-compose.yml              # Multi-container orchestration
```

---

## 🔑 Environment Configuration

### **server/.env** (Required for Backend)
```env
DATABASE_URL=postgresql://neondb_owner:npg_kAH6QnmMv5NL@ep-hidden-pine-amocylhk-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
JWT_SECRET=your_jwt_secret_key_change_in_production
GOOGLE_CLIENT_ID=851580403858-aahpqtdvb5o0r6n7l6a4eh7rc8c7rsl.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-FsVVt0pIpkJSrFH-Zia_sJXXGei
CLIENT_URL=http://localhost:5173
PORT=3001
GEMINI_API_KEY=<get free key from https://makersuite.google.com/app/apikey>
ML_SERVICE_URL=http://localhost:5001
```

---

## 🗄️ Database Schema

**All tables already exist on Neon.tech PostgreSQL:**

```sql
-- Users table with skill profiles
users (id, name, email, skill_tags[], void_skills[], free_slots[], is_online, elo_score, rating)

-- Interview sessions
sessions (id, user_a, user_b, status, started_at, ended_at)

-- Quiz results with ML labels
quiz_results (id, user_id, session_id, topic, score, time_taken, ml_label, difficulty)

-- Integrity monitoring
integrity_events (id, user_id, session_id, event_type, event_data, created_at)

-- Learning roadmap progression
roadmap_nodes (id, user_id, topic, status, ml_label, created_at)

-- Peer ratings
session_ratings (id, session_id, rater_id, rated_id, rating, feedback)
```

---

## 🎬 Demo Flow (For Judges - 10 Steps)

1. **Login Page** — Click "Continue with Google"  
2. **OAuth** — Authenticate and land on Setup Profile  
3. **Setup Profile** — Select 3 skills + 2 learning gaps + availability  
4. **Dashboard** — View ELO, roadmap, stats. Click "Find a Match"  
5. **Match Cards** — 3 cards appear with animated scores. Click "Start Session"  
6. **Session Room** — Editor left, video right, quiz below  
7. **Live Coding** — Type code → peer's screen updates in real-time  
8. **Integrity Flag** — Paste >50 chars → badge turns amber, toast fires  
9. **AI Question** — System generates DSA question → submit answer → ML label appears  
10. **Report** — Confetti animation → stats → rate peer → "Back to Dashboard"  

**Roadmap node should show as unlocked after report!**

---

## 🚀 Production Deployment

### **Docker (Single Command)**
```bash
docker-compose up --build
# Services start on:
# Frontend: http://localhost:5173
# Backend: http://localhost:3001
# ML: http://localhost:5001
```

### **Environment Variables for Production**
```bash
# Update server/.env before deploying
GOOGLE_CLIENT_ID=<production-oauth-app-id>
GOOGLE_CLIENT_SECRET=<production-oauth-secret>
JWT_SECRET=<long-random-string>
DATABASE_URL=<production-db-url>
CLIENT_URL=<production-frontend-url>
GEMINI_API_KEY=<your-gemini-key>
NODE_ENV=production
```

---

## 🔧 API Endpoints

### **Authentication**
```
GET  /auth/google                 # Initiate OAuth flow
GET  /auth/google/callback        # OAuth callback (redirects with JWT)
GET  /auth/verify                 # Verify token validity
```

### **Users**
```
GET  /api/users/me                # Get current user profile
PATCH /api/users/:id              # Update user (skills, availability, etc.)
GET  /api/users/:id/stats         # Get user stats (ELO, sessions, integrity)
GET  /api/users/:id/roadmap       # Get roadmap nodes
```

### **Matching**
```
GET  /api/match                   # Get top 3 matches
POST /api/match/accept            # Accept match, create room
```

### **Sessions**
```
GET  /api/sessions/:id            # Get session details
PATCH /api/sessions/:id/start     # Start session
PATCH /api/sessions/:id/end       # End session (calc ELO, integrity)
POST /api/sessions/:id/rate       # Rate peer (1-5 stars)
GET  /api/sessions/:id/report     # Get full session report
```

### **Quiz**
```
POST /api/quiz/submit             # Submit quiz answer → ML prediction
GET  /api/quiz/session/:sessionId  # Get quiz results for session
```

### **Questions (AI)**
```
POST /api/questions/generate      # Generate question with Gemini (fallback cache)
POST /api/questions/batch         # Get multiple questions
```

### **ML Service**
```
POST /ml/predict                  # Roadmap label prediction (score_ratio, time, attempts)
POST /ml/anomaly                  # Anomaly detection (paste, tab-switch, speed)
GET  /ml/health                   # Health check
```

### **WebSocket Namespaces**
```
/editor      # Code sync, language, chat
/signal      # WebRTC offer/answer/ICE candidates
/integrity   # Paste/tab-switch events, anomaly updates
```

---

## 🎯 Key Features & Why They Matter

| Feature | Impact | Implementation |
|---------|--------|-----------------|
| **Smart Matching** | 35% of match score | Availability + skill gap + rating algorithm |
| **Live Code Editor** | Real-time collab | Monaco + Socket.io with debouncing |
| **AI Questions** | Personalized prep | Gemini API with 60+ fallback questions |
| **Integrity Detection** | Cheat-proof | Anomaly scoring with paste/tab/speed flags |
| **ML Roadmap** | Adaptive learning | Decision Tree on [score, time, attempts] |
| **Peer Video** | Realistic mock | WebRTC with automatic fallback |
| **Confetti Report** | User delight | canvas-confetti on session completion |
| **ELO Rating** | Fair skill match | +/- based on quiz score vs 50 baseline |

---

## ⚠️ Known Limitations & Future Work

1. **Free Tier APIs** — Gemini free tier has 60 req/min limit  
2. **Video Fallback** — Works best with stable internet  
3. **Mobile Support** — Editor not optimized for phones yet  
4. **Geographical** — Built for IIIT Lucknow students (easily extensible)  
5. **Single Region** — DB on us-east-1 (add CDN for global scale)

---

## 🔐 Security

✅ JWT tokens with 7-day expiry  
✅ Protected routes with auth middleware  
✅ CORS restricted to CLIENT_URL  
✅ Helmet.js headers enabled  
✅ No hardcoded secrets (use .env)  
✅ Database SSL/TLS enabled  
✅ SQL injection prevention via parameterized queries  

---

## 🎓 Learning Outcomes

This project demonstrates:
- **Full-stack development**: React → Node → Flask  
- **Real-time systems**: Socket.io WebRTC collaboration  
- **AI/ML**: Decision Tree + anomaly detection  
- **Scalability**: Queue-based matching, caching, CDN-ready  
- **DevOps**: Docker, environment configuration, error handling  
- **UX Design**: Animations, glass-morphism, responsive layouts  

---

## 📞 Support & Questions

**For judges:** Test at http://localhost:5173  
**OAuth Credentials:** Pre-configured (no setup needed)  
**Database:** Live on Neon.tech (READ/WRITE accessible)  
**ML Model:** Auto-trained on first start  

---

**Built with ❤️ for HackOFiesta 7.0 — Machine Learning Track**
