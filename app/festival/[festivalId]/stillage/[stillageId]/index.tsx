import { FlatList, StyleSheet, View } from 'react-native';
import { Text, ActivityIndicator, Appbar } from 'react-native-paper';
import { router, useLocalSearchParams } from 'expo-router';
import { useCasksByStillage } from '@/hooks/useCasks';
import CaskCard from '@/components/CaskCard';

export default function CaskListScreen() {
  const { festivalId, stillageId } = useLocalSearchParams<{
    festivalId: string;
    stillageId: string;
  }>();
  const sid = Number(stillageId);
  const fid = Number(festivalId);
  const { data: casks, isLoading, error, refetch } = useCasksByStillage(sid);

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Casks" />
      </Appbar.Header>

      {isLoading && <ActivityIndicator animating size="large" style={styles.centre} />}

      {error && (
        <View style={styles.centre}>
          <Text style={styles.error}>{error.message}</Text>
        </View>
      )}

      <FlatList
        data={casks}
        keyExtractor={(c) => String(c.cask_id)}
        onRefresh={refetch}
        refreshing={isLoading}
        renderItem={({ item }) => (
          <CaskCard
            cask={item}
            onPress={() =>
              router.push(`/festival/${fid}/stillage/${sid}/cask/${item.cask_id}`)
            }
          />
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.centre}>
              <Text>No casks at this location.</Text>
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
