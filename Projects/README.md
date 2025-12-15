# IPD8 Learning Platform - Frontend

Modern learning platform built with Next.js 14, TypeScript, TailwindCSS, shadcn/ui, Framer Motion, and SwiperJS.

## 🚀 Tech Stack

- **Framework:** Next.js 16.0.7 (App Router)
- **Language:** TypeScript
- **Styling:** TailwindCSS + shadcn/ui
- **Animations:** Framer Motion
- **Sliders:** SwiperJS
- **State Management:** TanStack React Query
- **Form Handling:** react-hook-form + zod
- **Icons:** Lucide React

## 📦 Installation

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── courses/           # Course pages
│   ├── contact/          # Contact page
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── layouts/         # Layout components
│   ├── courses/         # Course components
│   └── shared/          # Shared components
├── data/                  # Mock data
└── types/                 # TypeScript types
```

## 📄 Available Pages

- `/` - Homepage with hero, courses, experts
- `/courses` - Course list with filters
- `/courses/[slug]` - Course detail with timeline
- `/contact` - Contact form

## 🎨 Design System

- **Brand Colors:** Pink/Magenta gradient (#F441A5 → #FF5F6D)
- **Typography:** Large headings, clean spacing
- **Animations:** Framer Motion (fade-in, slide-up, stagger)
- **Responsive:** Mobile-first design

## 🔌 API Integration

All API calls are placeholders. Update `NEXT_PUBLIC_API_BASE_URL` in `.env.local` when backend is ready.

## 📦 Build

```bash
npm run build
npm start
```

## 🚀 Deployment

Optimized for Vercel deployment.

## 📝 License

Private - IPD8 Learning Platform
