import { FlatList, StyleSheet, View } from 'react-native';
import { List, Text, ActivityIndicator, Appbar } from 'react-native-paper';
import { router } from 'expo-router';
import { useFestivals } from '@/hooks/useFestivals';
import { useAuthStore } from '@/store/authStore';
import { apiClient } from '@/api/client';

export default function FestivalsScreen() {
  const { data: festivals, isLoading, error, refetch } = useFestivals();
  const logout = useAuthStore((s) => s.logout);

  const handleLogout = async () => {
    try {
      await apiClient.get('/json_logout');
    } catch {
      // best effort
    } finally {
      await logout();
      router.replace('/(auth)/login');
    }
  };

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.Content title="Festivals" />
        <Appbar.Action icon="logout" onPress={handleLogout} />
      </Appbar.Header>

      {isLoading && (
        <ActivityIndicator animating size="large" style={styles.centre} />
      )}

      {error && (
        <View style={styles.centre}>
          <Text style={styles.error}>{error.message}</Text>
        </View>
      )}

      <FlatList
        data={festivals}
        keyExtractor={(f) => String(f.festival_id)}
        onRefresh={refetch}
        refreshing={isLoading}
        renderItem={({ item }) => (
          <List.Item
            title={item.name}
            description={`${item.year}  •  ${item.fst_start_date} – ${item.fst_end_date}`}
            left={(props) => <List.Icon {...props} icon="beer-outline" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() =>
              router.push(`/festival/${item.festival_id}`)
            }
          />
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centre: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  error: { color: 'red', textAlign: 'center' },
  separator: { height: StyleSheet.hairlineWidth, backgroundColor: '#ccc' },
});
