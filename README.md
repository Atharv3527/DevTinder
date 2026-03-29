<div align="center">
  
# 🔥 DevTinder

**Where Developers Meet, Connect, and Build Together.**

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)

---

</div>

## 🌟 About The Project

**DevTinder** is a platform designed specifically for developers to find collaborators, mentors, and friends in the tech space. Finding the right partner for a hackathon, an open-source project, or just someone to pair-program with has never been easier!

Swipe through developer profiles, view their tech stacks, connect with those who match your interests, and chat via real-time messaging. 

### 🚀 Key Features

- **💑 Swipe & Connect:** A premium Tinder-like swipe physics engine to accept/reject developer profiles.
- **💬 Real-time Chat:** Seamless, instant messaging with your connected developer matches.
- **📰 Community Feed:** A Reddit/LinkedIn style feed to share ideas, updates, and snippets.
- **💼 Job Board:** Post and find developer-specific job listings.
- **🔔 Notifications:** Get real-time alerts for connection requests.
- **🐙 GitHub Integration:** Auto-fetch and display your GitHub repositories on your profile.
- **⚡ Beautiful UI:** Built from the ground up with Glassmorphism, tailored animations, and scroll-driven effects using `framer-motion`.

---

## 🛠️ Tech Stack

### 🎨 Frontend
| Technology | Purpose |
|---|---|
| ⚛️ **React.js** (Vite) | UI Framework |
| 🎨 **Tailwind CSS** | Styling |
| 🎞️ **Framer Motion** | Animations |
| 🔥 **Firebase Auth** | Google & Email/Password Login |
| 🔷 **Lucide Icons** | Icon Library |

### ⚙️ Backend
| Technology | Purpose |
|---|---|
| 🟢 **Node.js** & **Express** | REST API Server |
| 🔥 **Firebase Admin SDK** | JWT Token Verification |
| 🟩 **Supabase** | PostgreSQL Database + File Storage |
| 🐘 **PostgreSQL** | Relational Database (via Supabase) |

### 🗄️ Database Schema (Supabase / PostgreSQL)
| Table | Description |
|---|---|
| 👤 `users` | Firebase UID, full name, email |
| 🖼️ `profiles` | Photo, banner, address, about, GitHub URL |
| 🛠️ `skills` | Skill tags per user |
| 💼 `experience` | Work history entries |
| 🎓 `education` | Education entries |

### 📦 Storage (Supabase Storage)
| Bucket | Contents |
|---|---|
| 🖼️ `profile-images` | User profile photos |
| 🏞️ `background-images` | Profile banner images |

---

## 📂 Project Structure

```text
📦 DevTinder
 ┣ 📂 frontend                 # React / Vite SPA
 ┃ ┣ 📂 src
 ┃ ┃ ┣ 📂 components           # Reusable UI components
 ┃ ┃ ┣ 📂 config               # Firebase & Supabase client config
 ┃ ┃ ┣ 📂 context              # Auth context (Firebase onAuthStateChanged)
 ┃ ┃ ┣ 📂 lib                  # Utility functions
 ┃ ┃ ┗ 📂 pages                # Login, Signup, ProfileSetup, Feed, Profile...
 ┃ ┗ 📜 .env                   # Frontend environment variables
 ┣ 📂 backend                  # Node / Express API
 ┃ ┣ 📂 config                 # Firebase Admin & Supabase server config
 ┃ ┣ 📂 middlewares             # Firebase JWT auth middleware
 ┃ ┣ 📂 routes                 # API Endpoints (auth, profile, feed, jobs...)
 ┃ ┣ 📂 controllers            # Request handling logic
 ┃ ┗ 📜 .env                   # Backend environment variables
 ┣ 📜 supabase-schema.sql      # SQL schema — run this in Supabase SQL Editor
 ┗ 📜 README.md
```

---

## 💻 Getting Started

Follow these steps to run DevTinder on your local machine.

### 1. Clone the repository
```bash
git clone https://github.com/Atharv3527/DevTinder.git
cd DevTinder
```

### 2. Set up Firebase & Supabase

**Firebase:**
- Go to [Firebase Console](https://console.firebase.google.com) → Create/select project
- Enable **Authentication** → Google & Email/Password sign-in methods
- Generate a **Service Account** key (Project Settings → Service Accounts)

**Supabase:**
- Go to [Supabase](https://supabase.com) → Create a new project
- Run `supabase-schema.sql` in the **SQL Editor** to create all tables
- Create two **Storage buckets**: `profile-images` and `background-images` (set both as Public)

### 3. Set up the Backend
```bash
cd backend
npm install
```

Create a `.env` file in `backend/` with:
```env
PORT=5000
CLIENT_URL=http://localhost:5173
NODE_ENV=development

# Firebase Admin (Service Account)
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_service_account_email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Supabase
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

Start the backend:
```bash
npm run dev
```

### 4. Set up the Frontend
```bash
cd frontend
npm install
```

Create a `.env` file in `frontend/` with:
```env
VITE_API_URL=http://localhost:5000

# Firebase (Web App Config)
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Supabase (Public/Anon Key)
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
```

Start the frontend:
```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) 🚀

---

## 🤝 Contributing
Contributions, issues, and feature requests are welcome! 
Feel free to check out the [issues page](https://github.com/Atharv3527/DevTinder/issues).

<div align="center">

Made with ❤️ by Atharv

</div>
