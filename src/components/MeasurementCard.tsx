import { StyleSheet, View } from 'react-native';
import { List } from 'react-native-paper';
import type { CaskMeasurement } from '@/types/api';

interface Props {
  dip: CaskMeasurement;
  onPress: () => void;
}

function formatDateTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

export default function MeasurementCard({ dip, onPress }: Props) {
  return (
    <List.Item
      title={`${dip.volume ?? '—'} (${dip.measurement_batch_name})`}
      description={dip.comment ? `${formatDateTime(dip.measurement_time)}\n${dip.comment}` : formatDateTime(dip.measurement_time)}
      left={(props) => <List.Icon {...props} icon="gauge" />}
      right={(props) => <List.Icon {...props} icon="pencil-outline" />}
      onPress={onPress}
    />
  );
}
