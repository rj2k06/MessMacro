# 🍛 MessMacro — Hostel Mess Menu Macro Tracker

A full-stack web app for hostel students to:
- Sign up / log in with their college email
- View their hostel's weekly mess menu
- See macros (calories, protein, carbs, fat) for every food item
- Search any Indian food item's nutritional info
- Edit and save the mess menu for their hostel

---

## 🚀 DEPLOYMENT GUIDE (Trial Run)

### Step 1 — Prerequisites
Install Node.js (v18+) from https://nodejs.org

Verify installation:
```bash
node --version   # should say v18 or above
npm --version
```

### Step 2 — Set Up the Project
```bash
cd messmacro
npm install
```

### Step 3 — Configure Environment
```bash
cp .env.example .env
# Open .env and change JWT_SECRET to any random string
# Example: JWT_SECRET=my_super_secret_key_2024
```

### Step 4 — Run Locally
```bash
npm start
```
Open your browser at: **http://localhost:3000**

---

## 🌐 Deploy to the Web (Free Options)

### Option A: Railway.app (Easiest — Recommended)
1. Go to https://railway.app and sign up (free)
2. Click "New Project" → "Deploy from GitHub"
3. Push your code to GitHub first:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/messmacro.git
   git push -u origin main
   ```
4. Connect your GitHub repo in Railway
5. Add environment variable: `JWT_SECRET=your_secret_here`
6. Railway gives you a live URL like `https://messmacro-production.up.railway.app`
7. ✅ Done! Share the URL with your friends.

### Option B: Render.com (Also Free)
1. Go to https://render.com and sign up
2. Click "New" → "Web Service"
3. Connect your GitHub repo
4. Settings:
   - Build Command: `npm install`
   - Start Command: `npm start`
5. Add environment variable: `JWT_SECRET=your_secret_here`
6. Click Deploy → get a free URL

### Option C: Run on Your Laptop (Local Network)
If you want friends on the same WiFi to access it:
```bash
# Find your local IP
ipconfig   # Windows
ifconfig   # Mac/Linux

# Run server, others can access at http://YOUR_IP:3000
npm start
```

---

## 📦 Project Structure
```
messmacro/
├── server.js          # Main Express server
├── routes/
│   ├── auth.js        # Login/Signup endpoints
│   ├── menu.js        # Save/Get mess menu
│   └── macros.js      # Macro lookup + database
├── middleware/
│   └── auth.js        # JWT authentication check
├── public/
│   └── index.html     # Full frontend (HTML + CSS + JS)
├── .env.example       # Environment variable template
└── package.json
```

## 🔐 API Endpoints
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/auth/signup | ❌ | Create account |
| POST | /api/auth/login | ❌ | Login |
| GET | /api/auth/me | ✅ | Get current user |
| POST | /api/menu/save | ✅ | Save hostel menu |
| GET | /api/menu/:hostel | ✅ | Get hostel menu |
| POST | /api/macros/lookup | ✅ | Look up food macros |
| GET | /api/macros/database | ✅ | Get full food database |

## 🗄️ Upgrading to a Real Database (Optional)
The current app uses in-memory storage (data resets when server restarts).
For persistent data, you can add MongoDB Atlas (free):
1. Sign up at https://mongodb.com/atlas
2. Install: `npm install mongoose`
3. Replace `global.users` and `global.menus` with Mongoose models

---

## ✨ Features
- 🔐 JWT Authentication (tokens expire in 7 days)
- 🍽️ 70+ Indian mess foods in the macro database
- 📊 Per-meal macro breakdown with visual bars
- 📅 Weekly menu view with day-selector
- 🔍 Search any food item instantly
- 💾 Save hostel menus (shared across users of same hostel)
- 📱 Fully responsive mobile-friendly design
