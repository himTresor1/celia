import { useEffect, useState } from 'react';
import { Stack, router, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFonts } from 'expo-font';
import {
  registerForPushNotifications,
  setupNotificationListeners,
} from '@/lib/notifications';
import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_700Bold,
} from '@expo-google-fonts/dm-sans';
import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaProvider } from 'react-native-safe-area-context';

SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const { session, loading, profile } = useAuth();
  const segments = useSegments();

  // Register for push notifications when user is authenticated
  useEffect(() => {
    if (session && !loading) {
      registerForPushNotifications().catch((error) => {
        console.error('Failed to register for push notifications:', error);
      });

      // Set up notification listeners
      const listeners = setupNotificationListeners((notification) => {
        console.log('Notification received:', notification);
        // You can add custom handling here, like showing an alert or updating state
      });

      // Cleanup listeners on unmount
      return () => {
        listeners.remove();
      };
    }
  }, [session, loading]);

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inProfileSetup = segments[0] === 'profile-setup';
    const inSplash = segments[0] === 'splash';
    const inOnboarding = segments[0] === 'onboarding';
    const inTabs = segments[0] === '(tabs)';
    const inGetStarted = segments[0] === 'get-started';
    const inEvent = segments[0] === 'event';
    const inBrowse = segments[0] === 'browse';
    const inSaved = segments[0] === 'saved';
    const inProfile = segments[0] === 'profile';

    // Don't interfere with splash, onboarding, or navigation flows
    if (
      inSplash ||
      inOnboarding ||
      inGetStarted ||
      inEvent ||
      inBrowse ||
      inSaved ||
      inProfile
    ) {
      return;
    }

    // Handle authenticated users
    if (session && profile) {
      // Check if profile is completed
      if (!profile.is_profile_completed) {
        // Profile not completed - redirect to profile setup
        if (!inProfileSetup && !inAuthGroup) {
          router.replace('/profile-setup');
        }
      } else {
        // Profile completed - redirect to dashboard/home
        if (
          !inTabs &&
          !inGetStarted &&
          !inAuthGroup &&
          !inProfileSetup &&
          !inEvent &&
          !inBrowse &&
          !inSaved &&
          !inProfile
        ) {
          router.replace('/(tabs)');
        }
      }
    } else if (
      !session &&
      !inAuthGroup &&
      !inSplash &&
      !inOnboarding &&
      !inGetStarted
    ) {
      // Unauthenticated users should go to login
      router.replace('/(auth)/login');
    }
  }, [session, segments, loading, profile]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="splash" options={{ animation: 'none' }} />
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="get-started" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="profile-setup" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="event" />
      <Stack.Screen name="browse" />
      <Stack.Screen name="saved" />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}

export default function RootLayout() {
  useFrameworkReady();

  const [fontsLoaded, fontError] = useFonts({
    'DMSans-Regular': DMSans_400Regular,
    'DMSans-Medium': DMSans_500Medium,
    'DMSans-Bold': DMSans_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <AuthProvider>
      <SafeAreaProvider>
        <RootLayoutNav />
        <StatusBar style="auto" />
      </SafeAreaProvider>
    </AuthProvider>
  );
}
