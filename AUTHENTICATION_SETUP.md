# JobAiro Authentication Setup Guide

## Environment Variables Required

Create a `.env.local` file in your project root with the following variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Supabase Configuration

### 1. Create a Supabase Project
1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in
3. Create a new project
4. Note down your project URL and anon key from Settings > API

### 2. Enable Google OAuth (Optional)
1. Go to Authentication > Providers in your Supabase dashboard
2. Enable Google provider
3. Add your Google OAuth credentials:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one
   - Enable Google+ API
   - Create OAuth 2.0 credentials
   - Add authorized redirect URIs:
     - `https://your-project-id.supabase.co/auth/v1/callback`
     - `http://localhost:3000/auth/callback` (for development)

### 3. Configure Authentication Settings
In your Supabase dashboard, go to Authentication > Settings:

1. **Site URL**: Set to your domain (e.g., `https://yourdomain.com`)
2. **Redirect URLs**: Add allowed redirect URLs:
   - `https://yourdomain.com/auth/callback`
   - `http://localhost:3000/auth/callback` (for development)
   - `https://yourdomain.com/auth/reset-password`
   - `http://localhost:3000/auth/reset-password` (for development)

3. **Email Templates**: Customize your email templates for:
   - Email confirmation
   - Password reset
   - Email change confirmation

### 4. Database Setup (Optional)
If you want to store additional user data, create tables in your Supabase database:

```sql
-- Create a profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create a saved_jobs table for user job saves
CREATE TABLE saved_jobs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  job_id TEXT NOT NULL,
  job_data JSONB,
  saved_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_jobs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view own saved jobs" ON saved_jobs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own saved jobs" ON saved_jobs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own saved jobs" ON saved_jobs FOR DELETE USING (auth.uid() = user_id);
```

## Features Implemented

### ✅ Complete Authentication System
- **Login/Signup Page**: Split screen design with Google OAuth and email/password
- **Google OAuth Flow**: One-click authentication with Google
- **Email Authentication**: Full signup/login with email verification
- **Password Reset**: Forgot password functionality with email reset links

### ✅ User Session Management
- **Persistent Sessions**: Stay logged in across browser sessions
- **Auto-logout**: After 30 days of inactivity
- **Session Refresh**: Automatic token refresh without losing work
- **Session Expiry Warnings**: "Login expired" modal with quick re-login

### ✅ Protected Routes
- **Dashboard Protection**: Redirects to login if not authenticated
- **Return URL Saving**: Redirects back to intended page after login
- **Login Prompts**: "Login to save jobs" prompts on relevant actions

### ✅ Enhanced User Menu
- **Avatar Display**: Shows user profile picture or initials
- **Dropdown Menu**: Dashboard, Settings, Help, Logout options
- **User Information**: Displays user name and email

## File Structure

```
src/
├── components/
│   ├── Auth/
│   │   ├── AuthModal.tsx          # Main authentication modal
│   │   ├── LoginForm.tsx          # Login form component
│   │   ├── SignupForm.tsx         # Signup form component
│   │   └── ForgotPasswordForm.tsx # Password reset form
│   ├── UserMenu.tsx               # Enhanced user menu with dropdown
│   ├── ProtectedRoute.tsx         # HOC for protecting routes
│   ├── LoginPrompt.tsx           # Shows login prompts for auth actions
│   └── SessionManager.tsx        # Handles session expiry warnings
├── pages/
│   ├── auth/
│   │   ├── callback.tsx          # OAuth callback handler
│   │   └── reset-password.tsx    # Password reset page
│   └── dashboard.tsx             # Protected dashboard page
├── hooks/
│   └── useAuth.ts               # Enhanced auth hook with all methods
└── utils/
    └── supabase.ts              # Supabase client configuration
```

## Usage Examples

### Protecting a Route
```tsx
import ProtectedRoute from '@/components/ProtectedRoute';

const MyProtectedPage = () => (
  <ProtectedRoute requireAuth={true}>
    <div>This content is only visible to authenticated users</div>
  </ProtectedRoute>
);
```

### Using the Auth Hook
```tsx
import { useAuth } from '@/hooks/useAuth';

const MyComponent = () => {
  const { user, loading, signOut, signInWithEmail } = useAuth();

  if (loading) return <div>Loading...</div>;
  
  return (
    <div>
      {user ? (
        <button onClick={signOut}>Sign Out</button>
      ) : (
        <button onClick={() => signInWithEmail('email', 'password')}>
          Sign In
        </button>
      )}
    </div>
  );
};
```

### Adding Login Prompts
```tsx
import LoginPrompt from '@/components/LoginPrompt';

const JobCard = ({ job }) => (
  <div>
    <h3>{job.title}</h3>
    <LoginPrompt action="save this job" className="relative">
      <button>💾 Save Job</button>
    </LoginPrompt>
  </div>
);
```

## Development Setup

1. Install dependencies:
```bash
npm install @supabase/supabase-js react-icons
```

2. Create your `.env.local` file with Supabase credentials

3. Start development server:
```bash
npm run dev
```

4. Visit `http://localhost:3000` to test the authentication flow

## Security Considerations

- ✅ Row Level Security (RLS) enabled on all user tables
- ✅ Client-side and server-side session validation
- ✅ Secure token refresh mechanism
- ✅ Protected API routes and pages
- ✅ Email verification for new accounts
- ✅ Secure password reset flow

## Customization

### Styling
All components use Tailwind CSS with dark mode support. Customize the styles by modifying the className props in each component.

### Email Templates
Customize email templates in your Supabase dashboard under Authentication > Email Templates.

### Session Duration
Modify session duration and auto-logout timing in `SessionManager.tsx`.

### OAuth Providers
Add more OAuth providers (GitHub, Discord, etc.) by enabling them in Supabase and adding buttons to the auth forms.