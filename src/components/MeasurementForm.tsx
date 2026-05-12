import { StyleSheet, View } from 'react-native';
import { TextInput, Button, HelperText, Text } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const schema = z.object({
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
  defaultVolume?: string;
  defaultComment?: string;
  isEdit: boolean;
  loading: boolean;
  onSubmit: (values: MeasurementFormValues) => void;
  onCancel: () => void;
}

export default function MeasurementForm({
  defaultVolume = '',
  defaultComment = '',
  isEdit,
  loading,
  onSubmit,
  onCancel,
}: Props) {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<MeasurementFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { volume: defaultVolume, comment: defaultComment },
  });

  return (
    <View>
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
  actions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 12, gap: 8 },
  btn: {},
});
