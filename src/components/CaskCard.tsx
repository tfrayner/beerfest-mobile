import { StyleSheet, View } from 'react-native';
import { List, Chip } from 'react-native-paper';
import type { Cask } from '@/types/api';

function statusLabel(cask: Cask): string {
  if (cask.is_condemned) return 'Condemned';
  if (cask.is_ready) return 'Ready';
  if (cask.is_tapped) return 'Tapped';
  if (cask.is_vented) return 'Vented';
  return 'Not vented';
}

function statusColor(cask: Cask): string {
  if (cask.is_condemned) return '#b00020';
  if (cask.is_ready) return '#2e7d32';
  if (cask.is_tapped) return '#1565c0';
  if (cask.is_vented) return '#e65100';
  return '#757575';
}

interface Props {
  cask: Cask;
  onPress: () => void;
}

export default function CaskCard({ cask, onPress }: Props) {
  const label = statusLabel(cask);
  const color = statusColor(cask);

  return (
    <List.Item
      title={cask.product_name || '(unknown product)'}
      description={`${cask.company_name || ''}  •  Ref: ${cask.festival_ref || '—'}`}
      left={(props) => <List.Icon {...props} icon="barrel" />}
      right={() => (
        <View style={styles.right}>
          <Chip
            style={[styles.chip, { backgroundColor: color + '22' }]}
            textStyle={[styles.chipText, { color }]}
            compact
          >
            {label}
          </Chip>
        </View>
      )}
      onPress={onPress}
    />
  );
}

const styles = StyleSheet.create({
  right: { justifyContent: 'center', paddingRight: 4 },
  chip: { height: 28, alignItems: 'center' },
  chipText: { fontSize: 11, fontWeight: '600' },
});
