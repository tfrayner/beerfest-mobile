import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { PaperProvider } from 'react-native-paper';
import StatusFlagsEditor from '@/components/StatusFlagsEditor';

function renderEditor(overrides: Partial<React.ComponentProps<typeof StatusFlagsEditor>> = {}) {
  const defaults = {
    isVented: false,
    isTapped: false,
    isReady: false,
    isCondemned: false,
    onVentedChange: jest.fn(),
    onTappedChange: jest.fn(),
    onReadyChange: jest.fn(),
    onCondemnedChange: jest.fn(),
  };
  return render(
    <PaperProvider>
      <StatusFlagsEditor {...defaults} {...overrides} />
    </PaperProvider>,
  );
}

describe('StatusFlagsEditor', () => {
  it('renders all four flag labels', () => {
    const { getByText } = renderEditor();
    expect(getByText('Vented')).toBeTruthy();
    expect(getByText('Tapped')).toBeTruthy();
    expect(getByText('Ready')).toBeTruthy();
    expect(getByText('Condemned')).toBeTruthy();
  });

  it('calls onVentedChange when the Vented switch is toggled', () => {
    const onVentedChange = jest.fn();
    const { getAllByRole } = renderEditor({ onVentedChange });
    // Switches are rendered as role="switch" in RNTL
    const switches = getAllByRole('switch');
    fireEvent(switches[0], 'valueChange', true);
    expect(onVentedChange).toHaveBeenCalledWith(true);
  });

  it('calls onCondemnedChange when the Condemned switch is toggled', () => {
    const onCondemnedChange = jest.fn();
    const { getAllByRole } = renderEditor({ onCondemnedChange });
    const switches = getAllByRole('switch');
    fireEvent(switches[3], 'valueChange', true);
    expect(onCondemnedChange).toHaveBeenCalledWith(true);
  });
});
