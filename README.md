# EduZone — AI-Powered Learning Management System

> MCA Final Year Project | MERN Stack + AI

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js, Tailwind CSS, Vite, Recharts |
| Backend | Node.js, Express.js, MongoDB, Mongoose |
| Auth | JWT, bcrypt, Google OAuth 2.0, Passport.js |
| AI | Google Gemini API (Quiz Generation, Note Summarization) |
| Payments | Razorpay Payment Gateway |
| Storage | Cloudinary (Videos, PDFs, Images) |
| Email | Nodemailer SMTP |

## 📁 Project Structure

```
LMS/
├── client/                 # React Frontend (Vite)
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Public pages
│   │   ├── dashboards/     # Role-specific dashboard pages
│   │   ├── layouts/        # Layout wrappers
│   │   ├── services/       # API service files
│   │   ├── context/        # React Context (Auth)
│   │   └── routes/         # Route guards
│   └── index.html
├── server/                 # Express Backend
│   ├── controllers/        # Request handlers
│   ├── routes/             # API route definitions
│   ├── models/             # Mongoose schemas (13 collections)
│   ├── middleware/          # Auth, role, error, upload middleware
│   ├── config/             # DB, Cloudinary, Passport, Razorpay
│   ├── services/           # AI service, email templates
│   └── utils/              # Helpers (token, email, errors)
└── package.json            # Root config with concurrently
```

## 🔧 Setup Instructions

### Prerequisites
- Node.js v18+
- MongoDB Atlas account
- Google Cloud Console project (OAuth)
- Razorpay account (test mode)
- Cloudinary account
- Gmail App Password (for SMTP)
- Google AI Studio API Key (Gemini)

### Installation

```bash
# 1. Clone and install
cd LMS
npm run install-all

# 2. Configure environment
cp server/.env.example server/.env
# Edit server/.env with your actual API keys

# 3. Create initial admin user
# Use MongoDB Compass or Atlas to insert an admin document

# 4. Start development servers
npm run dev
```

### Environment Variables
See `server/.env.example` for all required variables.

## 👥 User Roles

| Role | Capabilities |
|------|-------------|
| **Student** | Browse/enroll courses, watch videos, take quizzes, submit assignments, AI summarizer, certificates |
| **Educator** | Create/manage courses, add lessons, create quizzes (manual + AI), grade assignments, analytics |
| **Admin** | Manage all users, approve educators, view payment reports, platform analytics |

## 🤖 AI Features

1. **AI Quiz Generator** — Educators upload text → Gemini API generates MCQ questions
2. **AI Notes Summarizer** — Students paste notes → AI returns summary + key points + concepts
3. **Smart Recommendations** — Rule-based course suggestions based on enrolled categories

## 💳 Payment Flow

1. Student clicks "Buy Now" → Backend creates Razorpay order
2. Razorpay checkout modal opens → Student completes payment
3. Frontend sends payment details → Backend verifies signature
4. On success: Student enrolled + Email sent + Notification created

## 📧 Email Notifications

- Password Reset emails
- Educator Approval emails
- Payment Success emails
- Contact Form submissions
- Enrollment confirmations

## 🚢 Deployment

### Backend (Render / Railway)
1. Push code to GitHub
2. Connect to Render/Railway
3. Set environment variables
4. Deploy `server/` directory

### Frontend (Vercel / Netlify)
1. Connect to Vercel/Netlify
2. Set build command: `cd client && npm run build`
3. Set output directory: `client/dist`
4. Set `VITE_RAZORPAY_KEY_ID` env variable

---

Built with ❤️ for MCA Final Year Project
"# EduZone" 
