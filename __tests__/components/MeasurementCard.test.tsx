import React from 'react';
import { render } from '@testing-library/react-native';
import { PaperProvider } from 'react-native-paper';
import MeasurementCard from '@/components/MeasurementCard';
import type { CaskDip } from '@/types/api';

const DIP: CaskDip = {
  cask_measurement_id: 1,
  measurement_time: '2026-05-01T12:00:00.000Z',
  volume: 40,
  container_measure: 'litres',
};

function renderCard(dip: CaskDip) {
  return render(
    <PaperProvider>
      <MeasurementCard dip={dip} onPress={() => {}} />
    </PaperProvider>,
  );
}

describe('MeasurementCard', () => {
  it('renders volume and container measure in the title', () => {
    const { getByText } = renderCard(DIP);
    expect(getByText('40 litres')).toBeTruthy();
  });

  it('renders without crashing for a valid ISO datetime', () => {
    // Just verify it renders — toLocaleString output is locale-dependent
    const { getByText } = renderCard(DIP);
    expect(getByText('40 litres')).toBeTruthy(); // component mounted successfully
  });

  it('renders without crashing for an invalid date string', () => {
    // new Date('not-a-date') returns Invalid Date (no throw);
    // toLocaleString() on Invalid Date returns "Invalid Date" — component still renders
    expect(() => renderCard({ ...DIP, measurement_time: 'not-a-date' })).not.toThrow();
  });
});
