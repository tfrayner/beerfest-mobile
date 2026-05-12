import { Stack } from 'expo-router';

export default function FestivalLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Locations' }} />
      <Stack.Screen name="stillage" options={{ headerShown: false }} />
    </Stack>
  );
}
