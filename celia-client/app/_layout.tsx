import { useEffect, useState } from 'react';
import { Stack, router, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFonts } from 'expo-font';
import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_700Bold,
} from '@expo-google-fonts/dm-sans';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const { session, loading, profile } = useAuth();
  const segments = useSegments();

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

    // Don't interfere with splash, onboarding, or navigation flows
    if (
      inSplash ||
      inOnboarding ||
      inGetStarted ||
      inEvent ||
      inBrowse ||
      inSaved
    ) {
      return;
    }

    // Handle authenticated users
    if (session && profile) {
      if (!profile.is_profile_completed && !inProfileSetup) {
        router.replace('/profile-setup');
      } else if (profile.is_profile_completed && !inTabs && !inGetStarted) {
        router.replace('/(tabs)');
      }
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
      <RootLayoutNav />
      <StatusBar style="auto" />
    </AuthProvider>
  );
}
