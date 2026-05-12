import { FlatList, StyleSheet, View } from 'react-native';
import { List, Text, ActivityIndicator, Appbar } from 'react-native-paper';
import { router, useLocalSearchParams } from 'expo-router';
import { useStillageLocations } from '@/hooks/useStillageLocations';

export default function StillageListScreen() {
  const { festivalId } = useLocalSearchParams<{ festivalId: string }>();
  const id = Number(festivalId);
  const { data: locations, isLoading, error, refetch } = useStillageLocations(id);

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Stillage Locations" />
      </Appbar.Header>

      {isLoading && <ActivityIndicator animating size="large" style={styles.centre} />}

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
              router.push(`/festival/${id}/stillage/${item.stillage_location_id}`)
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
