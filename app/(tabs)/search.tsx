import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { List, Text, ActivityIndicator, Appbar, Button } from 'react-native-paper';
import { router } from 'expo-router';
import { useProductCategories } from '@/hooks/useProductCategories';
import { useCasks } from '@/hooks/useCasks';
import { useFestivals } from '@/hooks/useFestivals';
import CaskCard from '@/components/CaskCard';
import type { Festival, ProductCategory } from '@/types/api';

export default function SearchScreen() {
  const { data: festivals } = useFestivals();
  const { data: categories } = useProductCategories();

  const [selectedFestival, setSelectedFestival] = useState<Festival | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | null>(null);
  const [searching, setSearching] = useState(false);

  // Auto-select first festival when loaded
  useEffect(() => {
    if (festivals && festivals.length > 0 && !selectedFestival) {
      setSelectedFestival(festivals[festivals.length - 1]); // most recent
    }
  }, [festivals]);

  // Auto-select 'beer' category when categories load
  useEffect(() => {
    if (categories && categories.length > 0 && !selectedCategory) {
      const beer = categories.find(
        (c) => c.description.toLowerCase() === 'beer',
      );
      setSelectedCategory(beer ?? categories[0]);
    }
  }, [categories]);

  const { data: casks, isLoading, error, refetch } = useCasks(
    selectedFestival?.festival_id ?? 0,
    selectedCategory?.product_category_id ?? 0,
  );

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.Content title="Search Casks" />
      </Appbar.Header>

      <View style={styles.pickers}>
        {/* Festival picker */}
        <View style={styles.pickerGroup}>
          <Text variant="labelMedium" style={styles.label}>Festival</Text>
          <FlatList
            horizontal
            data={festivals}
            keyExtractor={(f) => String(f.festival_id)}
            renderItem={({ item }) => (
              <Button
                mode={selectedFestival?.festival_id === item.festival_id ? 'contained' : 'outlined'}
                compact
                style={styles.chip}
                onPress={() => setSelectedFestival(item)}
              >
                {item.name} {item.year}
              </Button>
            )}
          />
        </View>

        {/* Category picker */}
        <View style={styles.pickerGroup}>
          <Text variant="labelMedium" style={styles.label}>Category</Text>
          <FlatList
            horizontal
            data={categories}
            keyExtractor={(c) => String(c.product_category_id)}
            renderItem={({ item }) => (
              <Button
                mode={
                  selectedCategory?.product_category_id === item.product_category_id
                    ? 'contained'
                    : 'outlined'
                }
                compact
                style={styles.chip}
                onPress={() => setSelectedCategory(item)}
              >
                {item.description}
              </Button>
            )}
          />
        </View>
      </View>

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
              router.push(
                `/festival/${item.festival_id}/stillage/${item.stillage_location_id}/cask/${item.cask_id}`,
              )
            }
          />
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.centre}>
              <Text>No casks found.</Text>
            </View>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  pickers: { paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#f5f5f5' },
  pickerGroup: { marginBottom: 8 },
  label: { marginBottom: 4, color: '#555' },
  chip: { marginRight: 8 },
  centre: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, minHeight: 100 },
  error: { color: 'red', textAlign: 'center' },
  separator: { height: StyleSheet.hairlineWidth, backgroundColor: '#ccc' },
});
