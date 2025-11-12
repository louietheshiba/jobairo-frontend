# JobAiro Frontend

Job search and management platform built with Next.js and TypeScript.

## 🚀 Quick Start

### Prerequisites

- Node.js (check `.nvmrc` for version)
- npm or yarn
- Supabase account and project

### Installation

1. Clone the repository:
```bash
git clone https://github.com/louietheshiba/jobairo-frontend.git
cd jobairo-frontend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory with your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 📦 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run build-stats` - Build with bundle analysis
- `npm run clean` - Clean build artifacts
- `npm run import-jobs` - Import jobs from data files

## 🏗️ Tech Stack

- **Framework:** Next.js 13
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Database:** Supabase
- **State Management:** React Context
- **Forms:** Formik + Yup
- **UI Components:** Custom components with Lucide React icons

## 📁 Project Structure

```
src/
├── components/       # React components
│   ├── Admin/       # Admin dashboard components
│   ├── Dashboard/   # User dashboard components
│   ├── HomePage/    # Homepage components
│   └── ui/          # Reusable UI components
├── pages/           # Next.js pages and API routes
├── hooks/           # Custom React hooks
├── context/         # React context providers
├── utils/           # Utility functions
├── types/           # TypeScript type definitions
└── styles/          # Global styles
```

## 🔐 Authentication

The application uses Supabase Auth for authentication. Users can:
- Sign up / Sign in
- Reset passwords
- Manage profiles

## 🎯 Key Features

- Job search with advanced filters
- User dashboard with saved jobs, applied jobs, and search history
- Admin dashboard for job and user management
- Real-time job updates
- Location-based search
- Dark mode support

## 🚢 Deployment

The project is configured for Netlify deployment (see `netlify.toml`). 

For production deployment:
1. Build the project: `npm run build`
2. Deploy the `.next` folder to your hosting provider

## 📝 Notes

- The main branch is the production-ready branch
- All active development should be merged into main before launch
- Environment variables should never be committed to the repository

## 🤝 Contributing

When making changes:
1. Create a feature branch from `main`
2. Make your changes
3. Test thoroughly
4. Merge back into `main` when ready

---

**Repository:** https://github.com/louietheshiba/jobairo-frontend

