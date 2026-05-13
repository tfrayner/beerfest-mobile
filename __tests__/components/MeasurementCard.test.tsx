import React from 'react';
import { render } from '@testing-library/react-native';
import { PaperProvider } from 'react-native-paper';
import MeasurementCard from '@/components/MeasurementCard';
import type { CaskMeasurement } from '@/types/api';

const DIP: CaskMeasurement = {
  cask_measurement_id: 1,
  cask_id: 10,
  measurement_batch_id: 2,
  measurement_time: '2026-05-01T12:00:00.000Z',
  measurement_batch_name: 'Batch A',
  volume: 40,
  container_measure_id: 1,
  comment: '',
};

function renderCard(dip: CaskMeasurement) {
  return render(
    <PaperProvider>
      <MeasurementCard dip={dip} onPress={() => {}} />
    </PaperProvider>,
  );
}

describe('MeasurementCard', () => {
  it('renders volume and batch name in the title', () => {
    const { getByText } = renderCard(DIP);
    expect(getByText('40 (Batch A)')).toBeTruthy();
  });

  it('renders without crashing for a valid ISO datetime', () => {
    const { getByText } = renderCard(DIP);
    expect(getByText('40 (Batch A)')).toBeTruthy();
  });

  it('renders without crashing for an invalid date string', () => {
    expect(() => renderCard({ ...DIP, measurement_time: 'not-a-date' })).not.toThrow();
  });

  it('renders em-dash when volume is null', () => {
    const { getByText } = renderCard({ ...DIP, volume: null });
    expect(getByText('— (Batch A)')).toBeTruthy();
  });

  it('shows the comment below the timestamp when set', () => {
    const { getByText } = renderCard({ ...DIP, comment: 'nearly gone' });
    expect(getByText(/nearly gone/)).toBeTruthy();
  });

  it('does not show a comment line when comment is empty', () => {
    const { queryByText } = renderCard({ ...DIP, comment: '' });
    // The description should not contain a newline-separated comment
    expect(queryByText(/\n/)).toBeNull();
  });
});
