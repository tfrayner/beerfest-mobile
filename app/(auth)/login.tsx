import { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, TextInput, Button, HelperText } from 'react-native-paper';
import { router } from 'expo-router';
import { apiClient } from '@/api/client';
import { useAuthStore } from '@/store/authStore';

export default function LoginScreen() {
  const login = useAuthStore((s) => s.login);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!username.trim() || !password) {
      setError('Please enter username and password.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const body = new URLSearchParams({
        data: JSON.stringify({ username: username.trim(), password }),
      });
      const res = await apiClient.post('/login', body.toString(), {
        // Don't follow redirects so we can read Set-Cookie
        maxRedirects: 0,
        validateStatus: (s) => s < 400,
      });

      if (!res.data?.success) {
        setError(res.data?.message ?? 'Login failed.');
        return;
      }

      // Extract session cookie from response headers
      const rawCookies: unknown = res.headers['set-cookie'];
      let sessionCookie = '';
      if (Array.isArray(rawCookies)) {
        sessionCookie = (rawCookies as string[]).map((c) => c.split(';')[0]).join('; ');
      } else if (typeof rawCookies === 'string') {
        sessionCookie = rawCookies.split(';')[0];
      }

      if (!sessionCookie) {
        setError('Login succeeded but no session cookie was returned.');
        return;
      }

      await login(sessionCookie);
      router.replace('/(tabs)');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.inner}>
        <Text variant="headlineMedium" style={styles.title}>
          BeerMobile
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Sign in to BeerFestDB
        </Text>

        <TextInput
          label="Username"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
          autoCorrect={false}
          style={styles.input}
          mode="outlined"
        />
        <TextInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
          mode="outlined"
        />

        <HelperText type="error" visible={!!error}>
          {error}
        </HelperText>

        <Button
          mode="contained"
          onPress={handleLogin}
          loading={loading}
          disabled={loading}
          style={styles.button}
        >
          Sign In
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  inner: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  title: { textAlign: 'center', marginBottom: 4 },
  subtitle: { textAlign: 'center', color: '#666', marginBottom: 32 },
  input: { marginBottom: 12 },
  button: { marginTop: 8 },
});
