import { FlatList, StyleSheet, View } from 'react-native';
import { List, Text, ActivityIndicator, Appbar } from 'react-native-paper';
import { router } from 'expo-router';
import { useCurrentFestival } from '@/hooks/useFestivals';
import { useStillageLocations } from '@/hooks/useStillageLocations';
import { useAuthStore } from '@/store/authStore';
import { apiClient } from '@/api/client';

export default function StillageScreen() {
  const { data: festival, isLoading: festivalLoading, error: festivalError } = useCurrentFestival();
  const logout = useAuthStore((s) => s.logout);

  const festivalId = festival?.festival_id ?? 0;

  const {
    data: locations,
    isLoading: locationsLoading,
    error: locationsError,
    refetch,
  } = useStillageLocations(festivalId);

  const isLoading = festivalLoading || locationsLoading;
  const error = festivalError ?? locationsError;

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
        <Appbar.Content title={festival?.name ?? 'Stillage'} />
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
        data={locations}
        keyExtractor={(l) => String(l.stillage_location_id)}
        onRefresh={refetch}
        refreshing={isLoading}
        renderItem={({ item }) => (
          <List.Item
            title={item.description}
            left={(props) => <List.Icon {...props} icon="garage" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() =>
              router.push(`/festival/${festivalId}/stillage/${item.stillage_location_id}`)
            }
          />
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.centre}>
              <Text>No stillage locations found.</Text>
            </View>
          ) : null
        }
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
