import { useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { Appbar, ActivityIndicator, Text, FAB, Portal, Modal, Snackbar } from 'react-native-paper';
import { router, useLocalSearchParams } from 'expo-router';
import { useCaskDips, useMeasurementBatches, useSubmitMeasurement } from '@/hooks/useCaskMeasurements';
import { useCask, useContainerSize } from '@/hooks/useCasks';
import MeasurementCard from '@/components/MeasurementCard';
import MeasurementForm from '@/components/MeasurementForm';
import type { CaskMeasurement } from '@/types/api';
import type { MeasurementFormValues } from '@/components/MeasurementForm';

export default function MeasurementsScreen() {
  const { caskId, festivalId } = useLocalSearchParams<{ caskId: string; festivalId: string }>();
  const id = Number(caskId);
  const { data: dips, isLoading, error, refetch } = useCaskDips(id);
  const festivalIdNum = Number(festivalId);
  const { data: batches, isLoading: batchesLoading, error: batchesError } = useMeasurementBatches(festivalIdNum);
  const { data: cask } = useCask(id);
  const { data: containerSize } = useContainerSize(cask?.container_size_id ?? 0);
  const { mutate: submit, isPending } = useSubmitMeasurement(id);

  const [modalVisible, setModalVisible] = useState(false);
  const [editingDip, setEditingDip] = useState<CaskMeasurement | null>(null);
  const [snackVisible, setSnackVisible] = useState(false);
  const [snackMessage, setSnackMessage] = useState('');
  const [volumeError, setVolumeError] = useState<string | undefined>();

  const openAdd = () => {
    setEditingDip(null);
    setVolumeError(undefined);
    setModalVisible(true);
  };

  const openEdit = (dip: CaskMeasurement) => {
    setEditingDip(dip);
    setVolumeError(undefined);
    setModalVisible(true);
  };

  const handleSubmit = (values: MeasurementFormValues) => {
    setVolumeError(undefined);

    if (values.volume !== '') {
      const v = Number(values.volume);
      const selectedBatch = batches?.find(
        (b) => b.measurement_batch_id === values.measurement_batch_id,
      );

      if (containerSize != null && v > containerSize.volume) {
        setVolumeError(`Cannot exceed container capacity (${containerSize.volume})`);
        return;
      }

      if (selectedBatch && dips) {
        const priorVolumes = dips
          .filter((d) => {
            if (editingDip && d.cask_measurement_id === editingDip.cask_measurement_id) return false;
            return d.measurement_time < selectedBatch.measurement_time && d.volume != null;
          })
          .map((d) => d.volume as number);
        if (priorVolumes.length > 0) {
          const maxAllowed = Math.min(...priorVolumes);
          if (v > maxAllowed) {
            setVolumeError(`Cannot exceed previous measurement (${maxAllowed})`);
            return;
          }
        }
      }
    }

    const payload = {
      cask_id: id,
      measurement_batch_id: values.measurement_batch_id,
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
          onDismiss={() => { setModalVisible(false); setVolumeError(undefined); }}
          style={{ justifyContent: 'flex-start' }}
          contentContainerStyle={styles.modal}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
            <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              <Text variant="titleMedium" style={styles.modalTitle}>
                {editingDip ? 'Edit Measurement' : 'Add Measurement'}
              </Text>
              {batchesLoading && <ActivityIndicator animating size="small" style={{ marginBottom: 8 }} />}
              {batchesError && (
                <Text style={{ color: 'red', marginBottom: 8 }}>
                  Could not load batches: {batchesError.message}
                </Text>
              )}
              <MeasurementForm
                batches={batches ?? []}
                defaultBatchId={editingDip?.measurement_batch_id}
                defaultVolume={editingDip ? String(editingDip.volume ?? '') : ''}
                defaultComment=""
                isEdit={!!editingDip}
                loading={isPending}
                volumeError={volumeError}
                onSubmit={handleSubmit}
                onCancel={() => { setModalVisible(false); setVolumeError(undefined); }}
              />
            </ScrollView>
          </KeyboardAvoidingView>
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
  modal: { backgroundColor: '#fff', marginTop: 40, marginHorizontal: 20, padding: 20, borderRadius: 8 },
  modalTitle: { marginBottom: 16 },
  errorText: { color: 'red', textAlign: 'center' },
});
