import { useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { Appbar, ActivityIndicator, Text, FAB, Portal, Modal, Snackbar } from 'react-native-paper';
import { router, useLocalSearchParams } from 'expo-router';
import { useCaskDips, useSubmitMeasurement } from '@/hooks/useCaskMeasurements';
import MeasurementCard from '@/components/MeasurementCard';
import MeasurementForm from '@/components/MeasurementForm';
import type { CaskDip } from '@/types/api';
import type { MeasurementFormValues } from '@/components/MeasurementForm';

export default function MeasurementsScreen() {
  const { caskId } = useLocalSearchParams<{ caskId: string }>();
  const id = Number(caskId);
  const { data: dips, isLoading, error, refetch } = useCaskDips(id);
  const { mutate: submit, isPending } = useSubmitMeasurement(id);

  const [modalVisible, setModalVisible] = useState(false);
  const [editingDip, setEditingDip] = useState<CaskDip | null>(null);
  const [snackVisible, setSnackVisible] = useState(false);
  const [snackMessage, setSnackMessage] = useState('');

  const openAdd = () => {
    setEditingDip(null);
    setModalVisible(true);
  };

  const openEdit = (dip: CaskDip) => {
    setEditingDip(dip);
    setModalVisible(true);
  };

  const handleSubmit = (values: MeasurementFormValues) => {
    const payload = {
      cask_id: id,
      ...(editingDip ? { cask_measurement_id: editingDip.cask_measurement_id } : {}),
      // Empty string volume instructs the server to delete the dip
      volume: values.volume === '' ? ('' as const) : Number(values.volume),
      comment: values.comment,
    };
    submit([payload], {
      onSuccess: () => {
        setModalVisible(false);
        const msg = values.volume === '' ? 'Measurement deleted.' : 'Measurement saved.';
        setSnackMessage(msg);
        setSnackVisible(true);
      },
    });
  };

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Dip Measurements" />
      </Appbar.Header>

      {isLoading && <ActivityIndicator animating size="large" style={styles.centre} />}

      {error && (
        <View style={styles.centre}>
          <Text style={styles.errorText}>{error.message}</Text>
        </View>
      )}

      <FlatList
        data={dips}
        keyExtractor={(d) => String(d.cask_measurement_id)}
        onRefresh={refetch}
        refreshing={isLoading}
        renderItem={({ item }) => (
          <MeasurementCard dip={item} onPress={() => openEdit(item)} />
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.centre}>
              <Text>No measurements recorded yet.</Text>
            </View>
          ) : null
        }
        contentContainerStyle={styles.list}
      />

      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={styles.modal}
        >
          <Text variant="titleMedium" style={styles.modalTitle}>
            {editingDip ? 'Edit Measurement' : 'Add Measurement'}
          </Text>
          <MeasurementForm
            defaultVolume={editingDip ? String(editingDip.volume) : ''}
            defaultComment=""
            isEdit={!!editingDip}
            loading={isPending}
            onSubmit={handleSubmit}
            onCancel={() => setModalVisible(false)}
          />
        </Modal>
      </Portal>

      <FAB icon="plus" style={styles.fab} onPress={openAdd} />

      <Snackbar
        visible={snackVisible}
        onDismiss={() => setSnackVisible(false)}
        duration={2500}
      >
        {snackMessage}
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centre: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, minHeight: 80 },
  list: { paddingBottom: 80 },
  separator: { height: StyleSheet.hairlineWidth, backgroundColor: '#ccc' },
  fab: { position: 'absolute', right: 16, bottom: 16 },
  modal: { backgroundColor: '#fff', margin: 20, padding: 20, borderRadius: 8 },
  modalTitle: { marginBottom: 16 },
  errorText: { color: 'red', textAlign: 'center' },
});
