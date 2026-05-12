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
import { useForm, Controller } from 'react-hook-form';
import { useCask, useSubmitCask } from '@/hooks/useCasks';
import StatusFlagsEditor from '@/components/StatusFlagsEditor';
import type { Cask } from '@/types/api';
import { TextInput } from 'react-native-paper';
import { useState } from 'react';

type CaskFormValues = {
  festival_ref: string;
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
  const { mutate: submitCask, isPending, isSuccess, isError, error: mutateError } = useSubmitCask();
  const [snackVisible, setSnackVisible] = useState(false);

  const { control, handleSubmit, reset } = useForm<CaskFormValues>();

  useEffect(() => {
    if (cask) {
      reset({
        festival_ref: cask.festival_ref ?? '',
        int_reference: cask.int_reference ?? '',
        ext_reference: cask.ext_reference ?? '',
        comment: cask.comment ?? '',
        is_vented: cask.is_vented,
        is_tapped: cask.is_tapped,
        is_ready: cask.is_ready,
        is_condemned: cask.is_condemned,
      });
    }
  }, [cask]);

  const onSubmit = (values: CaskFormValues) => {
    submitCask([{ cask_id: id, ...values }], {
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
        <Appbar.Content title={cask.festival_ref || `Cask #${cask.cask_id}`} />
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

        <Divider style={styles.divider} />

        {/* Status flags */}
        <Text variant="labelLarge" style={styles.sectionLabel}>Status</Text>
        <Controller
          control={control}
          name="is_vented"
          render={({ field: { value, onChange } }) => (
            <Controller
              control={control}
              name="is_tapped"
              render={({ field: f2 }) => (
                <Controller
                  control={control}
                  name="is_ready"
                  render={({ field: f3 }) => (
                    <Controller
                      control={control}
                      name="is_condemned"
                      render={({ field: f4 }) => (
                        <StatusFlagsEditor
                          isVented={value}
                          isTapped={f2.value}
                          isReady={f3.value}
                          isCondemned={f4.value}
                          onVentedChange={onChange}
                          onTappedChange={f2.onChange}
                          onReadyChange={f3.onChange}
                          onCondemnedChange={f4.onChange}
                        />
                      )}
                    />
                  )}
                />
              )}
            />
          )}
        />

        <Divider style={styles.divider} />

        {/* Editable reference fields */}
        <Text variant="labelLarge" style={styles.sectionLabel}>References</Text>

        <Controller
          control={control}
          name="festival_ref"
          render={({ field: { value, onChange, onBlur } }) => (
            <TextInput
              label="Festival Ref"
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
          name="int_reference"
          render={({ field: { value, onChange, onBlur } }) => (
            <TextInput
              label="Internal Reference"
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
              label="External Reference"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              mode="outlined"
              style={styles.input}
            />
          )}
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

        {isError && (
          <Text style={styles.errorText}>{mutateError?.message}</Text>
        )}

        <Button
          mode="contained"
          onPress={handleSubmit(onSubmit)}
          loading={isPending}
          disabled={isPending}
          style={styles.saveButton}
        >
          Save Changes
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
});
