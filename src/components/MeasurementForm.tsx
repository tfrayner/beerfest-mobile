import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { TextInput, Button, HelperText, List, Divider } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import type { MeasurementBatch } from '@/types/api';

const schema = z.object({
  measurement_batch_id: z.number().int().min(1, 'Please select a measurement batch.'),
  volume: z
    .string()
    .refine(
      (v) => v === '' || (!isNaN(Number(v)) && Number(v) >= 0),
      { message: 'Enter a non-negative number, or leave blank to delete.' },
    ),
  comment: z.string(),
});

export type MeasurementFormValues = z.infer<typeof schema>;

interface Props {
  batches: MeasurementBatch[];
  defaultBatchId?: number;
  defaultVolume?: string;
  defaultComment?: string;
  isEdit: boolean;
  loading: boolean;
  onSubmit: (values: MeasurementFormValues) => void;
  onCancel: () => void;
}

function batchLabel(b: MeasurementBatch): string {
  return b.description ? `${b.measurement_time} — ${b.description}` : b.measurement_time;
}

export default function MeasurementForm({
  batches,
  defaultBatchId = 0,
  defaultVolume = '',
  defaultComment = '',
  isEdit,
  loading,
  onSubmit,
  onCancel,
}: Props) {
  const [batchOpen, setBatchOpen] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<MeasurementFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      measurement_batch_id: defaultBatchId,
      volume: defaultVolume,
      comment: defaultComment,
    },
  });

  return (
    <View>
      <Controller
        control={control}
        name="measurement_batch_id"
        render={({ field: { value, onChange } }) => {
          const selected = batches.find((b) => b.measurement_batch_id === value);
          return (
            <View>
              <Pressable onPress={() => setBatchOpen((o) => !o)}>
                <TextInput
                  label="Measurement Batch"
                  value={selected ? batchLabel(selected) : ''}
                  mode="outlined"
                  editable={false}
                  pointerEvents="none"
                  right={
                    <TextInput.Icon icon={batchOpen ? 'menu-up' : 'menu-down'} />
                  }
                  style={styles.input}
                  testID="batch-input"
                />
              </Pressable>
              {batchOpen && (
                <View style={styles.dropdownList}>
                  <ScrollView nestedScrollEnabled keyboardShouldPersistTaps="handled">
                    {batches.map((b, i) => (
                      <View key={b.measurement_batch_id}>
                        {i > 0 && <Divider />}
                        <List.Item
                          title={batchLabel(b)}
                          onPress={() => {
                            onChange(b.measurement_batch_id);
                            setBatchOpen(false);
                          }}
                          titleNumberOfLines={2}
                          style={styles.dropdownItem}
                        />
                      </View>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>
          );
        }}
      />
      <HelperText type="error" visible={!!errors.measurement_batch_id}>
        {errors.measurement_batch_id?.message}
      </HelperText>

      <Controller
        control={control}
        name="volume"
        render={({ field: { value, onChange, onBlur } }) => (
          <TextInput
            label={isEdit ? 'Volume (blank to delete)' : 'Volume'}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            keyboardType="decimal-pad"
            mode="outlined"
            style={styles.input}
            testID="volume-input"
          />
        )}
      />
      <HelperText type="error" visible={!!errors.volume}>
        {errors.volume?.message}
      </HelperText>

      <Controller
        control={control}
        name="comment"
        render={({ field: { value, onChange, onBlur } }) => (
          <TextInput
            label="Comment (optional)"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            mode="outlined"
            multiline
            numberOfLines={2}
            style={styles.input}
            testID="comment-input"
          />
        )}
      />

      <View style={styles.actions}>
        <Button onPress={onCancel} disabled={loading} style={styles.btn}>
          Cancel
        </Button>
        <Button
          mode="contained"
          onPress={handleSubmit(onSubmit)}
          loading={loading}
          disabled={loading}
          style={styles.btn}
        >
          {isEdit ? 'Update' : 'Add'}
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  input: { marginBottom: 4 },
  dropdownList: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    maxHeight: 200,
    backgroundColor: '#fff',
    marginBottom: 4,
    elevation: 2,
  },
  dropdownItem: { paddingVertical: 4 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 12, gap: 8 },
  btn: {},
});
