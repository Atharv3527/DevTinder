<div align="center">
  
# 🔥 DevTinder

**Where Developers Meet, Connect, and Build Together.**

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

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
- **🔔 Notifications:** Get real-time alerts for connection requests (Accept/Decline natively from the notification dropdown).
- **🤖 Gemini AI Integration:** Smart AI chatbot powered by Google Gemini to help you debug and chat!
- **⚡ Beautiful UI:** Built from the ground up with stunning Glassmorphism, tailored animations, and scroll-driven effects using `framer-motion`.

---

## 🛠️ Tech Stack

**Frontend:**
- **React.js** (Vite)
- **Tailwind CSS** (for styling)
- **Framer Motion** (for buttery smooth animations)
- **Lucide Icons**

**Backend:**
- **Node.js** & **Express** (REST API)
- **MongoDB** & **Mongoose** (Database)
- **JWT** & **Bcrypt** (Authentication)

---

## 📂 Project Structure

This repository is set up as a **Monorepo** containing both the client application and the API server.

```text
📦 DevTinder
 ┣ 📂 frontend       # React / Vite SPA
 ┃ ┣ 📂 src          # Components, Pages, and Contexts
 ┃ ┗ 📜 .env         # Frontend environment variables
 ┣ 📂 backend        # Node / Express API
 ┃ ┣ 📂 models       # Mongoose DB Models
 ┃ ┣ 📂 routes       # API Endpoints
 ┃ ┣ 📂 controllers  # Request handling logic
 ┃ ┗ 📜 .env         # Backend environment variables
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

### 2. Set up the Backend
```bash
cd backend
npm install
```
- Ensure you have a `.env` file in the `backend` folder with your `MONGODB_URI`, `PORT`, and `JWT_SECRET`.
- Start the development server:
```bash
npm run dev
```

### 3. Set up the Frontend
Open a new terminal window:
```bash
cd frontend
npm install
```
- Ensure your `frontend/.env` has `VITE_API_URL=http://localhost:5000`.
- Start the vite development server:
```bash
npm run dev
```

---

## 🤝 Contributing
Contributions, issues, and feature requests are welcome! 
Feel free to check out the [issues page](https://github.com/Atharv3527/DevTinder/issues).

<div align="center">
Made with ❤️ by Atharv
</div>
