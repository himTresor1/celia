import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  college_name: string | null;
  major: string | null;
  graduation_year: number | null;
  bio: string;
  avatar_url: string | null;
  photo_urls: any;
  interests: string[] | null;
  college_verified: boolean | null;
  preferred_locations: string[] | null;
  is_profile_completed: boolean;
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  completeProfile: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = async () => {
    // No-op for UI-only mode
  };

  const completeProfile = () => {
    if (profile) {
      setProfile({ ...profile, is_profile_completed: true });
    }
  };

  useEffect(() => {
    setLoading(false);
  }, []);


  const signIn = async (email: string, password: string) => {
    // Use a fixed UUID for the mock user (React Native doesn't support crypto.getRandomValues)
    const mockUser = {
      id: '00000000-0000-4000-8000-000000000000',
      email: email,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      aud: 'authenticated',
      role: 'authenticated',
    } as User;

    const mockSession = {
      access_token: 'mock_token',
      token_type: 'bearer',
      expires_in: 3600,
      expires_at: Date.now() + 3600000,
      refresh_token: 'mock_refresh_token',
      user: mockUser,
    } as Session;

    setSession(mockSession);
    setUser(mockUser);

    const mockProfile: Profile = {
      id: mockUser.id,
      email: email,
      full_name: 'Test User',
      college_name: 'Harvard University',
      major: 'Computer Science',
      graduation_year: 2025,
      bio: 'Test bio',
      avatar_url: null,
      photo_urls: ['https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg'],
      interests: ['Technology & Gaming', 'Sports & Fitness'],
      college_verified: true,
      preferred_locations: ['Cambridge, MA'],
      is_profile_completed: true,
    };

    setProfile(mockProfile);

    return { error: null };
  };

  const signOut = async () => {
    setSession(null);
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        profile,
        loading,
        signIn,
        signOut,
        refreshProfile,
        completeProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
