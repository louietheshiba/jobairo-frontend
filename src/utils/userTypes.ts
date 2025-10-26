export interface User {
  id: string;
  user_id: string;
  email: string;
  role: string;
  full_name?: string;
  created_at: string;
  last_sign_in_at?: string;
  bio?: string;
  status: 'active' | 'inactive' | 'suspended' | 'unknown';
}
