import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { PaperProvider } from 'react-native-paper';
import MeasurementForm from '@/components/MeasurementForm';
import type { MeasurementBatch } from '@/types/api';

const BATCHES: MeasurementBatch[] = [
  { measurement_batch_id: 1, measurement_time: '2026-05-12T09:00:00Z', description: 'Morning Round' },
  { measurement_batch_id: 2, measurement_time: '2026-05-12T18:00:00Z', description: null },
];

function renderForm(overrides: Partial<React.ComponentProps<typeof MeasurementForm>> = {}) {
  const defaults = {
    batches: BATCHES,
    defaultBatchId: 1,
    defaultVolume: '',
    defaultComment: '',
    isEdit: false,
    loading: false,
    onSubmit: jest.fn(),
    onCancel: jest.fn(),
  };
  return render(
    <PaperProvider>
      <MeasurementForm {...defaults} {...overrides} />
    </PaperProvider>,
  );
}

describe('MeasurementForm', () => {
  it('renders batch, volume and comment input fields', () => {
    const { getByTestId } = renderForm();
    expect(getByTestId('batch-input')).toBeTruthy();
    expect(getByTestId('volume-input')).toBeTruthy();
    expect(getByTestId('comment-input')).toBeTruthy();
  });

  it('shows the label text Volume by default', () => {
    const { queryAllByText } = renderForm();
    expect(queryAllByText('Volume').length).toBeGreaterThan(0);
  });

  it('shows Volume blank to delete label when isEdit is true', () => {
    const { queryAllByText } = renderForm({ isEdit: true });
    expect(queryAllByText('Volume (blank to delete)').length).toBeGreaterThan(0);
  });

  it('calls onSubmit with valid numeric volume and selected batch', async () => {
    const onSubmit = jest.fn();
    const { getByTestId, getByText } = renderForm({ onSubmit });
    fireEvent.changeText(getByTestId('volume-input'), '42');
    fireEvent.press(getByText('Add'));
    await waitFor(() => { expect(onSubmit).toHaveBeenCalled(); });
    expect(onSubmit.mock.calls[0][0]).toEqual({ measurement_batch_id: 1, volume: '42', comment: '' });
  });

  it('calls onSubmit with empty volume delete intent', async () => {
    const onSubmit = jest.fn();
    const { getByText } = renderForm({ onSubmit, isEdit: true });
    fireEvent.press(getByText('Update'));
    await waitFor(() => { expect(onSubmit).toHaveBeenCalled(); });
    expect(onSubmit.mock.calls[0][0]).toEqual({ measurement_batch_id: 1, volume: '', comment: '' });
  });

  it('shows a validation error for a negative number', async () => {
    const onSubmit = jest.fn();
    const { getByTestId, getByText } = renderForm({ onSubmit });
    fireEvent.changeText(getByTestId('volume-input'), '-5');
    fireEvent.press(getByText('Add'));
    await waitFor(() => { expect(getByText('Enter a non-negative number, or leave blank to delete.')).toBeTruthy(); });
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('shows a validation error for non-numeric input', async () => {
    const onSubmit = jest.fn();
    const { getByTestId, getByText } = renderForm({ onSubmit });
    fireEvent.changeText(getByTestId('volume-input'), 'abc');
    fireEvent.press(getByText('Add'));
    await waitFor(() => { expect(getByText('Enter a non-negative number, or leave blank to delete.')).toBeTruthy(); });
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('shows a validation error when no batch is selected', async () => {
    const onSubmit = jest.fn();
    const { getByText } = renderForm({ onSubmit, defaultBatchId: 0 });
    fireEvent.press(getByText('Add'));
    await waitFor(() => { expect(getByText('Please select a measurement batch.')).toBeTruthy(); });
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('calls onCancel when the Cancel button is pressed', () => {
    const onCancel = jest.fn();
    const { getByText } = renderForm({ onCancel });
    fireEvent.press(getByText('Cancel'));
    expect(onCancel).toHaveBeenCalled();
  });

  it('pre-fills values from defaultVolume and defaultComment', () => {
    const { getByDisplayValue } = renderForm({ defaultVolume: '30', defaultComment: 'nearly empty' });
    expect(getByDisplayValue('30')).toBeTruthy();
    expect(getByDisplayValue('nearly empty')).toBeTruthy();
  });

  it('displays volumeError when provided', () => {
    const { getByTestId } = renderForm({ volumeError: 'Cannot exceed previous measurement (40)' });
    expect(getByTestId('volume-error').props.children).toBe('Cannot exceed previous measurement (40)');
  });

  it('displays volumeError for a later-measurement constraint', () => {
    const { getByTestId } = renderForm({ volumeError: 'Cannot be less than a later measurement (20)' });
    expect(getByTestId('volume-error').props.children).toBe('Cannot be less than a later measurement (20)');
  });
});
