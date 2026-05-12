import { StyleSheet, View } from 'react-native';
import { List, Text } from 'react-native-paper';
import type { CaskDip } from '@/types/api';

interface Props {
  dip: CaskDip;
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
      title={`${dip.volume} ${dip.container_measure}`}
      description={formatDateTime(dip.measurement_time)}
      left={(props) => <List.Icon {...props} icon="gauge" />}
      right={(props) => <List.Icon {...props} icon="pencil-outline" />}
      onPress={onPress}
    />
  );
}
