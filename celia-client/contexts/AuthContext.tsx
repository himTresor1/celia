import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '@/lib/api';

interface User {
  id: string;
  email: string;
  fullName: string;
  created_at: string;
  updated_at: string;
}

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
  session: { access_token: string } | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (
    email: string,
    password: string,
    fullName: string
  ) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  completeProfile: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<{ access_token: string } | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadStoredAuth = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const storedUser = await AsyncStorage.getItem('user');

      if (token && storedUser) {
        setSession({ access_token: token });
        setUser(JSON.parse(storedUser));
        await refreshProfile();
      }
    } catch (error) {
      console.error('Error loading stored auth:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshProfile = async () => {
    try {
      const userData = await api.getCurrentUser();
      const profileData: Profile = {
        id: userData.id,
        email: userData.email,
        full_name: userData.fullName || null,
        college_name: userData.collegeName || null,
        major: userData.major || null,
        graduation_year: userData.graduationYear || null,
        bio: userData.bio || '',
        avatar_url: userData.avatarUrl || null,
        photo_urls: userData.photoUrls || [],
        interests: userData.interests || null,
        college_verified: userData.collegeVerified || false,
        preferred_locations: userData.preferredLocations || null,
        is_profile_completed: userData.profileCompleted || false,
      };
      setProfile(profileData);
      setUser(userData);
      await AsyncStorage.setItem('user', JSON.stringify(userData));
    } catch (error) {
      console.error('Error refreshing profile:', error);
    }
  };

  const completeProfile = async () => {
    if (profile) {
      setProfile({ ...profile, is_profile_completed: true });
    }
    await refreshProfile();
  };

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const response = await api.login(email, password);

      // Backend returns 'token', not 'access_token'
      const token = response.token || response.access_token;
      if (token) {
        setSession({ access_token: token });
      }

      setUser(response.user);

      await AsyncStorage.setItem('user', JSON.stringify(response.user));

      await refreshProfile();

      return { error: null };
    } catch (error: any) {
      console.error('[AuthContext] Login error:', error);
      return {
        error: new Error(error.response?.data?.message || 'Login failed'),
      };
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const response = await api.register({ email, password, fullName });

      // Backend returns 'token', not 'access_token'
      const token = response.token || response.access_token;
      if (token) {
        setSession({ access_token: token });
      }

      setUser(response.user);

      await AsyncStorage.setItem('user', JSON.stringify(response.user));

      await refreshProfile();

      return { error: null };
    } catch (error: any) {
      console.error('[AuthContext] Registration error:', error);
      return {
        error: new Error(
          error.response?.data?.message || 'Registration failed'
        ),
      };
    }
  };

  const signOut = async () => {
    await api.logout();
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
        signUp,
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
