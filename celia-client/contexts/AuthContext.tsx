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
        const parsedUser = JSON.parse(storedUser);
        // Ensure stored user has required fields
        if (parsedUser && parsedUser.id) {
          setSession({ access_token: token });
          setUser(parsedUser);
          console.log('[AuthContext] Loaded stored user, ID:', parsedUser.id);
          await refreshProfile();
        } else {
          console.warn('[AuthContext] Stored user missing ID, clearing storage');
          await AsyncStorage.removeItem('authToken');
          await AsyncStorage.removeItem('user');
        }
      }
    } catch (error) {
      console.error('[AuthContext] Error loading stored auth:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshProfile = async () => {
    try {
      const userData = await api.getCurrentUser();
      
      // Ensure userData has required fields
      if (!userData || !userData.id) {
        console.error('[AuthContext] Invalid user data from getCurrentUser:', userData);
        return;
      }
      
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
      console.log('[AuthContext] Profile refreshed, user ID:', userData.id);
    } catch (error) {
      console.error('[AuthContext] Error refreshing profile:', error);
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

      // Ensure user object has required fields
      if (!response.user || !response.user.id) {
        console.error('[AuthContext] Invalid user object from login:', response.user);
        throw new Error('Invalid user data received from server');
      }

      setUser(response.user);
      await AsyncStorage.setItem('user', JSON.stringify(response.user));
      console.log('[AuthContext] User set after login, ID:', response.user.id);

      await refreshProfile();

      return { error: null };
    } catch (error: any) {
      console.error('[AuthContext] Login error:', error);
      return {
        error: new Error(error.response?.data?.message || error.message || 'Login failed'),
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

      // Ensure user object has required fields
      if (!response.user || !response.user.id) {
        console.error('[AuthContext] Invalid user object from register:', response.user);
        throw new Error('Invalid user data received from server');
      }

      setUser(response.user);
      await AsyncStorage.setItem('user', JSON.stringify(response.user));
      console.log('[AuthContext] User set after registration, ID:', response.user.id);

      await refreshProfile();

      return { error: null };
    } catch (error: any) {
      console.error('[AuthContext] Registration error:', error);
      return {
        error: new Error(
          error.response?.data?.message || error.message || 'Registration failed'
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
