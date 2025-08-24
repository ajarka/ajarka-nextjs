# Ajarka - Platform Pembelajaran Coding 🚀

Platform pembelajaran coding modern yang dibangun dengan Next.js 15 dan teknologi terdepan untuk memberikan pengalaman belajar terbaik bagi developer Indonesia.

![Next.js](https://img.shields.io/badge/Next.js-15.5.0-black)
![React](https://img.shields.io/badge/React-19.1.0-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-06b6d4)
![Shadcn/ui](https://img.shields.io/badge/Shadcn/ui-Latest-black)

## ✨ Features

### 🎯 **Modern Tech Stack**
- **Next.js 15** dengan App Router dan Turbopack
- **React 19** dengan React Compiler
- **TypeScript** untuk type safety
- **Tailwind CSS v4** untuk styling
- **Shadcn/ui** untuk komponen UI premium
- **Framer Motion** untuk animasi yang smooth

### 🔐 **Authentication System**
- NextAuth.js dengan Credentials Provider
- Multi-role authentication (Admin, Mentor, Siswa)
- Session management dengan JWT
- Password hashing dengan bcryptjs

### 📊 **State Management**
- Zustand v5 untuk client state
- TanStack Query v5 untuk server state
- React Hook Form untuk form handling

### 🎨 **UI/UX Excellence**
- Responsive design untuk semua device
- Dark/Light mode dengan next-themes
- Smooth animations dan transitions
- Modern glassmorphism effects

### 👥 **Multi-Role Dashboard**
- **Admin Dashboard**: Kelola platform, mentor, siswa, kursus
- **Mentor Dashboard**: Jadwal mengajar, siswa, penghasilan
- **Siswa Dashboard**: Progress belajar, kursus, sertifikat

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ atau 20+
- npm atau yarn

### Installation

1. **Clone repository**
```bash
git clone <repository-url>
cd ajarka-nextjs
```

2. **Install dependencies**
```bash
npm install
```

3. **Start development server**
```bash
npm run dev
```

Server akan berjalan di:
- **Frontend**: http://localhost:3000
- **JSON Server**: http://localhost:3001

## 👤 Demo Accounts

Untuk testing, gunakan akun demo berikut:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@ajarka.com | password |
| Mentor | mentor@ajarka.com | password |
| Siswa | siswa@ajarka.com | password |

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth routes (login, signup)
│   ├── (dashboard)/       # Protected dashboard routes
│   ├── api/               # API routes
│   ├── globals.css        # Global styles
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── ui/               # Shadcn/ui components
│   ├── layout/           # Layout components
│   ├── home/             # Homepage sections
│   ├── dashboard/        # Dashboard components
│   └── providers/        # Context providers
├── lib/                   # Utilities & configurations
├── store/                 # Zustand stores
└── types/                 # TypeScript type definitions
```

## 🔧 Available Scripts

```bash
# Development
npm run dev          # Start dev server (frontend + backend)
npm run dev:next     # Start only Next.js
npm run dev:server   # Start only JSON server

# Production
npm run build        # Build for production
npm run start        # Start production server

# Code Quality
npm run lint         # Run ESLint
```

## 🏗️ Architecture & Best Practices

### **Clean Architecture**
- Feature-based folder structure
- Separation of concerns
- TypeScript untuk type safety
- Modern React patterns dengan hooks

### **Performance Optimizations**
- Code splitting dengan dynamic imports
- Image optimization dengan next/image
- Bundle optimization dengan Turbopack
- Server-side rendering (SSR)

### **Security Features**
- Password hashing dengan bcrypt
- JWT token validation
- Environment variables protection
- Input sanitization

## 📚 API Endpoints

JSON Server menyediakan REST API untuk development:

### Users
- `GET /users` - Get all users
- `GET /users/:id` - Get user by ID
- `POST /users` - Create new user

### Courses
- `GET /courses` - Get all courses
- `POST /courses` - Create new course

### Transactions
- `GET /transactions` - Get all transactions
- `POST /transactions` - Create new transaction

## 🚀 Deployment

### **Vercel (Recommended)**
```bash
npm run build
vercel --prod
```

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React framework for production
- [Shadcn/ui](https://ui.shadcn.com/) - Beautiful and accessible components
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Framer Motion](https://www.framer.com/motion/) - Animation library

---

**Made with ❤️ by Ajarka Team**

*Empowering Indonesian developers to reach their full potential*
