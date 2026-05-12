import { StyleSheet, View } from 'react-native';
import { Text, Switch } from 'react-native-paper';

interface Props {
  isVented: boolean;
  isTapped: boolean;
  isReady: boolean;
  isCondemned: boolean;
  onVentedChange: (v: boolean) => void;
  onTappedChange: (v: boolean) => void;
  onReadyChange: (v: boolean) => void;
  onCondemnedChange: (v: boolean) => void;
}

function FlagRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Switch value={value} onValueChange={onChange} />
    </View>
  );
}

export default function StatusFlagsEditor({
  isVented,
  isTapped,
  isReady,
  isCondemned,
  onVentedChange,
  onTappedChange,
  onReadyChange,
  onCondemnedChange,
}: Props) {
  return (
    <View>
      <FlagRow label="Vented" value={isVented} onChange={onVentedChange} />
      <FlagRow label="Tapped" value={isTapped} onChange={onTappedChange} />
      <FlagRow label="Ready" value={isReady} onChange={onReadyChange} />
      <FlagRow label="Condemned" value={isCondemned} onChange={onCondemnedChange} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  label: { fontSize: 15 },
});
