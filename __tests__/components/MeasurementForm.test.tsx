import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { PaperProvider } from 'react-native-paper';
import MeasurementForm from '@/components/MeasurementForm';

function renderForm(overrides: Partial<React.ComponentProps<typeof MeasurementForm>> = {}) {
  const defaults = {
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
  it('renders two text input fields (volume and comment)', () => {
    const { getByTestId } = renderForm();
    expect(getByTestId('volume-input')).toBeTruthy();
    expect(getByTestId('comment-input')).toBeTruthy();
  });

  it('shows the label text "Volume" by default', () => {
    const { queryAllByText } = renderForm();
    // Paper renders the label text as a floating overlay — at least one occurrence
    expect(queryAllByText('Volume').length).toBeGreaterThan(0);
  });

  it('shows "Volume (blank to delete)" label when isEdit is true', () => {
    const { queryAllByText } = renderForm({ isEdit: true });
    expect(queryAllByText('Volume (blank to delete)').length).toBeGreaterThan(0);
  });

  it('calls onSubmit with valid numeric volume', async () => {
    const onSubmit = jest.fn();
    const { getByTestId, getByText } = renderForm({ onSubmit });

    fireEvent.changeText(getByTestId('volume-input'), '42');
    fireEvent.press(getByText('Add'));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalled();
    });
    expect(onSubmit.mock.calls[0][0]).toEqual({ volume: '42', comment: '' });
  });

  it('calls onSubmit with empty volume (delete intent)', async () => {
    const onSubmit = jest.fn();
    const { getByText } = renderForm({ onSubmit, isEdit: true });

    // Leave volume blank (default)
    fireEvent.press(getByText('Update'));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalled();
    });
    expect(onSubmit.mock.calls[0][0]).toEqual({ volume: '', comment: '' });
  });

  it('shows a validation error for a negative number', async () => {
    const onSubmit = jest.fn();
    const { getByTestId, getByText } = renderForm({ onSubmit });

    fireEvent.changeText(getByTestId('volume-input'), '-5');
    fireEvent.press(getByText('Add'));

    await waitFor(() => {
      expect(getByText('Enter a non-negative number, or leave blank to delete.')).toBeTruthy();
    });
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('shows a validation error for non-numeric input', async () => {
    const onSubmit = jest.fn();
    const { getByTestId, getByText } = renderForm({ onSubmit });

    fireEvent.changeText(getByTestId('volume-input'), 'abc');
    fireEvent.press(getByText('Add'));

    await waitFor(() => {
      expect(getByText('Enter a non-negative number, or leave blank to delete.')).toBeTruthy();
    });
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('calls onCancel when the Cancel button is pressed', () => {
    const onCancel = jest.fn();
    const { getByText } = renderForm({ onCancel });
    fireEvent.press(getByText('Cancel'));
    expect(onCancel).toHaveBeenCalled();
  });

  it('pre-fills values from defaultVolume / defaultComment', () => {
    const { getByDisplayValue } = renderForm({
      defaultVolume: '30',
      defaultComment: 'nearly empty',
    });
    expect(getByDisplayValue('30')).toBeTruthy();
    expect(getByDisplayValue('nearly empty')).toBeTruthy();
  });
});
