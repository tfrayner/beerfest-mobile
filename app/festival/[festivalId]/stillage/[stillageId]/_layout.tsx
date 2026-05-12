import { Stack } from 'expo-router';

export default function StillageIdLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Casks' }} />
      <Stack.Screen name="cask" options={{ headerShown: false }} />
    </Stack>
  );
}
