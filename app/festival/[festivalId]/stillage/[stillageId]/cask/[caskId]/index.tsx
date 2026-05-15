import { useEffect } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import {
  Appbar,
  ActivityIndicator,
  Text,
  Button,
  Divider,
  Snackbar,
} from 'react-native-paper';
import { router, useLocalSearchParams } from 'expo-router';
import { useForm, Controller, useController } from 'react-hook-form';
import { useCask, useSubmitCask, useContainerSizes } from '@/hooks/useCasks';
import { useCurrentFestivalId } from '@/hooks/useFestivals';
import StatusFlagsEditor from '@/components/StatusFlagsEditor';
import type { Cask } from '@/types/api';
import { TextInput } from 'react-native-paper';
import { useState } from 'react';

type CaskFormValues = {
  int_reference: string;
  ext_reference: string;
  comment: string;
  is_vented: boolean;
  is_tapped: boolean;
  is_ready: boolean;
  is_condemned: boolean;
};

export default function CaskDetailScreen() {
  const { caskId } = useLocalSearchParams<{ caskId: string }>();
  const id = Number(caskId);
  const { data: cask, isLoading, error } = useCask(id);
  const { data: containerSizes } = useContainerSizes();
  const containerSize = containerSizes?.find((c) => c.container_size_id === cask?.container_size_id);
  const currentFestivalId = useCurrentFestivalId();
  const isCurrentFestival = currentFestivalId !== undefined && cask?.festival_id === currentFestivalId;
  const { mutate: submitCask, isPending, isSuccess, isError, error: mutateError } = useSubmitCask();
  const [snackVisible, setSnackVisible] = useState(false);

  const { control, handleSubmit, reset } = useForm<CaskFormValues>({    defaultValues: {
      int_reference: '',
      ext_reference: '',
      comment: '',
      is_vented: false,
      is_tapped: false,
      is_ready: false,
      is_condemned: false,
    },
  });

  const { field: ventedField } = useController({ control, name: 'is_vented' });
  const { field: tappedField } = useController({ control, name: 'is_tapped' });
  const { field: readyField } = useController({ control, name: 'is_ready' });
  const { field: condemnedField } = useController({ control, name: 'is_condemned' });

  useEffect(() => {
    if (cask) {
      reset({
        int_reference: String(cask.int_reference ?? ''),
        ext_reference: String(cask.ext_reference ?? ''),
        comment: cask.comment ?? '',
        is_vented: Boolean(cask.is_vented),
        is_tapped: Boolean(cask.is_tapped),
        is_ready: Boolean(cask.is_ready),
        is_condemned: Boolean(cask.is_condemned),
      });
    }
  }, [cask]);

  const onSubmit = (values: CaskFormValues) => {
    submitCask([{ cask_id: id, cask_management_id: cask.cask_management_id, ...values }], {
      onSuccess: () => setSnackVisible(true),
    });
  };

  if (isLoading) {
    return <ActivityIndicator animating size="large" style={styles.centre} />;
  }

  if (error || !cask) {
    return (
      <View style={styles.centre}>
        <Text style={styles.errorText}>{error?.message ?? 'Cask not found.'}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title={`Cask ID: ${String(cask.festival_ref ?? cask.cask_id)}`} />
        {cask.is_sale_or_return && (
          <Text style={styles.sorLabel}>SALE OR RETURN</Text>
        )}
        <Appbar.Action
          icon="clipboard-list-outline"
          onPress={() => router.push(
            `/festival/${cask.festival_id}/stillage/${cask.stillage_location_id}/cask/${id}/measurements`,
          )}
        />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Read-only info */}
        <Text variant="titleLarge">{cask.product_name}</Text>
        <Text variant="bodyMedium" style={styles.subtitle}>{cask.company_name}</Text>
        <Text variant="bodySmall" style={styles.meta}>
          Festival: {cask.festival_name}
        </Text>
        {containerSize && (
          <Text variant="bodySmall" style={styles.meta}>
            Container: {containerSize.description} ({containerSize.volume} L)
          </Text>
        )}

        <Divider style={styles.divider} />

        {/* Status flags */}
        <Text variant="labelLarge" style={styles.sectionLabel}>Status</Text>
        <StatusFlagsEditor
          isVented={ventedField.value}
          isTapped={tappedField.value}
          isReady={readyField.value}
          isCondemned={condemnedField.value}
          onVentedChange={ventedField.onChange}
          onTappedChange={tappedField.onChange}
          onReadyChange={readyField.onChange}
          onCondemnedChange={condemnedField.onChange}
        />

        <Divider style={styles.divider} />

        <Text variant="labelLarge" style={styles.sectionLabel}>Notes</Text>
        <Controller
          control={control}
          name="comment"
          render={({ field: { value, onChange, onBlur } }) => (
            <TextInput
              label="Comment"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              mode="outlined"
              multiline
              numberOfLines={3}
              style={styles.input}
            />
          )}
        />

        <Divider style={styles.divider} />

        {/* Editable reference fields */}
        <Text variant="labelLarge" style={styles.sectionLabel}>Cask Numbering</Text>

        <Controller
          control={control}
          name="int_reference"
          render={({ field: { value, onChange, onBlur } }) => (
            <TextInput
              label="Cellaring Order"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              mode="outlined"
              style={styles.input}
            />
          )}
        />
        <Controller
          control={control}
          name="ext_reference"
          render={({ field: { value, onChange, onBlur } }) => (
            <TextInput
              label="Brewery Reference"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              mode="outlined"
              style={styles.input}
            />
          )}
        />

        {isError && (
          <Text style={styles.errorText}>{mutateError?.message}</Text>
        )}

        <Button
          mode="contained"
          onPress={handleSubmit(onSubmit)}
          loading={isPending}
          disabled={isPending || !isCurrentFestival}
          style={styles.saveButton}
        >
          {isCurrentFestival ? 'Save Changes' : 'Read-only (not current festival)'}
        </Button>
      </ScrollView>

      <Snackbar
        visible={snackVisible}
        onDismiss={() => setSnackVisible(false)}
        duration={2500}
      >
        Cask saved.
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centre: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  content: { padding: 16, paddingBottom: 40 },
  subtitle: { color: '#555', marginTop: 2 },
  meta: { color: '#888', marginTop: 2 },
  divider: { marginVertical: 16 },
  sectionLabel: { marginBottom: 8 },
  input: { marginBottom: 12 },
  saveButton: { marginTop: 8 },
  errorText: { color: 'red', marginBottom: 8 },
  sorLabel: { color: '#e65100', fontWeight: '700', fontSize: 11, alignSelf: 'center', marginRight: 8 },
});
