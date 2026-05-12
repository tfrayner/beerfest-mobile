import { Stack } from 'expo-router';

export default function CaskLayout() {
  return (
    <Stack>
      <Stack.Screen name="[caskId]" options={{ headerShown: false }} />
    </Stack>
  );
}
