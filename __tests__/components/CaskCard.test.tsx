import React from 'react';
import { render } from '@testing-library/react-native';
import { PaperProvider } from 'react-native-paper';
import CaskCard from '@/components/CaskCard';
import type { Cask } from '@/types/api';

const BASE_CASK: Cask = {
  cask_id: 1,
  cask_management_id: 0,
  festival_id: 1,
  festival_name: 'Test Fest',
  gyle_id: 0,
  product_id: 0,
  product_name: 'Golden Ale',
  company_id: 0,
  company_name: 'Acme Brewery',
  bar_id: 0,
  stillage_location_id: 10,
  stillage_bay: 0,
  bay_position_id: 0,
  container_size_id: 0,
  order_batch_id: 0,
  order_batch_name: '',
  distributor_id: 0,
  currency_id: 0,
  price: '0',
  festival_ref: 'A01',
  int_reference: '',
  ext_reference: '',
  comment: '',
  is_vented: false,
  is_tapped: false,
  is_ready: false,
  is_condemned: false,
  is_sale_or_return: false,
  cask_graveyard: false,
  stillage_x: 0,
  stillage_y: 0,
  stillage_z: 0,
};

function renderCard(cask: Cask) {
  return render(
    <PaperProvider>
      <CaskCard cask={cask} onPress={() => {}} />
    </PaperProvider>,
  );
}

describe('CaskCard', () => {
  it('renders product name', () => {
    const { getByText } = renderCard(BASE_CASK);
    expect(getByText('Golden Ale')).toBeTruthy();
  });

  it('shows "Not vented" when all flags are false', () => {
    const { getByText } = renderCard(BASE_CASK);
    expect(getByText('Not vented')).toBeTruthy();
  });

  it('shows "Vented" when only is_vented is true', () => {
    const { getByText } = renderCard({ ...BASE_CASK, is_vented: true });
    expect(getByText('Vented')).toBeTruthy();
  });

  it('shows "Tapped" when is_tapped is true', () => {
    const { getByText } = renderCard({ ...BASE_CASK, is_tapped: true });
    expect(getByText('Tapped')).toBeTruthy();
  });

  it('shows "Ready" when is_ready is true (overrides tapped/vented)', () => {
    const { getByText } = renderCard({ ...BASE_CASK, is_vented: true, is_tapped: true, is_ready: true });
    expect(getByText('Ready')).toBeTruthy();
  });

  it('shows "Condemned" when is_condemned is true (highest priority)', () => {
    const { getByText } = renderCard({
      ...BASE_CASK,
      is_vented: true,
      is_tapped: true,
      is_ready: true,
      is_condemned: true,
    });
    expect(getByText('Condemned')).toBeTruthy();
  });

  it('shows "(unknown product)" when product_name is empty', () => {
    const { getByText } = renderCard({ ...BASE_CASK, product_name: '' });
    expect(getByText('(unknown product)')).toBeTruthy();
  });

  it('shows int_reference as #N when set', () => {
    const { getByText } = renderCard({ ...BASE_CASK, int_reference: '42' });
    expect(getByText(/#42/)).toBeTruthy();
  });

  it('does not show # suffix when int_reference is empty', () => {
    const { queryByText } = renderCard({ ...BASE_CASK, int_reference: '' });
    expect(queryByText(/No\.\s/)).toBeNull();
  });
});
