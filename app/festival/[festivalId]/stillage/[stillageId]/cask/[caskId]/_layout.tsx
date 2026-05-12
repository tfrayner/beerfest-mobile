import { Stack } from 'expo-router';

export default function CaskIdLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Cask Detail' }} />
      <Stack.Screen name="measurements" options={{ title: 'Measurements' }} />
    </Stack>
  );
}
