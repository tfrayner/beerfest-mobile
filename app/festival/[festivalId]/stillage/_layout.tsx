import { Stack } from 'expo-router';

export default function StillageLayout() {
  return (
    <Stack>
      <Stack.Screen name="[stillageId]" options={{ headerShown: false }} />
    </Stack>
  );
}
