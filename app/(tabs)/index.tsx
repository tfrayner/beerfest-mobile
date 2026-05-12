import { FlatList, StyleSheet, View } from 'react-native';
import { List, Text, ActivityIndicator, Appbar } from 'react-native-paper';
import { router } from 'expo-router';
import { useFestivals } from '@/hooks/useFestivals';
import { useStillageLocations } from '@/hooks/useStillageLocations';
import { useAuthStore } from '@/store/authStore';
import { apiClient } from '@/api/client';

const CURRENT_FESTIVAL_NAME = process.env.EXPO_PUBLIC_CURRENT_FESTIVAL ?? '';

export default function StillageScreen() {
  const { data: festivals, isLoading: festivalsLoading, error: festivalsError } = useFestivals();
  const logout = useAuthStore((s) => s.logout);

  const festival = festivals?.find((f) => f.name === CURRENT_FESTIVAL_NAME);
  const festivalId = festival?.festival_id ?? 0;

  const {
    data: locations,
    isLoading: locationsLoading,
    error: locationsError,
    refetch,
  } = useStillageLocations(festivalId);

  const isLoading = festivalsLoading || locationsLoading;
  const error = festivalsError ?? locationsError;

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

  const configError =
    !festivalsLoading && festivals && !festival
      ? `Festival "${CURRENT_FESTIVAL_NAME}" not found. Check EXPO_PUBLIC_CURRENT_FESTIVAL.`
      : null;

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.Content title={festival?.name ?? 'Stillage'} />
        <Appbar.Action icon="logout" onPress={handleLogout} />
      </Appbar.Header>

      {isLoading && (
        <ActivityIndicator animating size="large" style={styles.centre} />
      )}

      {(error || configError) && (
        <View style={styles.centre}>
          <Text style={styles.error}>{configError ?? error?.message}</Text>
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
          !isLoading && !configError ? (
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
