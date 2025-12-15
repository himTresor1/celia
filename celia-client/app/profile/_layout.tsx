import { Stack } from 'expo-router';

export default function ProfileLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        presentation: 'card',
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="lists" />
      <Stack.Screen name="saved" />
      <Stack.Screen name="friends" />
      <Stack.Screen name="invitees" />
      <Stack.Screen name="send-pulse/[userId]" />
    </Stack>
  );
}

