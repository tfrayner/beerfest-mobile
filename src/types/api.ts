export interface Festival {
  festival_id: number;
  year: number;
  name: string;
  description: string;
  fst_start_date: string;
  fst_end_date: string;
}

export interface StillageLocation {
  stillage_location_id: number;
  festival_id: number;
  description: string;
}

export interface ProductCategory {
  product_category_id: number;
  description: string;
}

export interface Cask {
  cask_id: number;
  cask_management_id: number;
  festival_id: number;
  festival_name: string;
  gyle_id: number;
  product_id: number;
  product_name: string;
  company_id: number;
  company_name: string;
  bar_id: number;
  stillage_location_id: number;
  stillage_bay: number;
  bay_position_id: number;
  container_size_id: number;
  order_batch_id: number;
  order_batch_name: string;
  distributor_id: number;
  currency_id: number;
  price: string;
  festival_ref: number | string | null;
  int_reference: string | null;
  ext_reference: string | null;
  comment: string;
  is_vented: boolean;
  is_tapped: boolean;
  is_ready: boolean;
  is_condemned: boolean;
  is_sale_or_return: boolean;
  cask_graveyard: boolean;
  stillage_x: number;
  stillage_y: number;
  stillage_z: number;
}

export interface MeasurementBatch {
  measurement_batch_id: number;
  measurement_time: string;
  description: string | null;
}

export interface ContainerSize {
  container_size_id: number;
  volume: number;
  description: string;
}

export interface CaskMeasurement {  cask_measurement_id: number;
  cask_id: number;
  measurement_batch_id: number;
  measurement_time: string;
  measurement_batch_name: string;
  volume: number | null;
  container_measure_id: number;
  comment: string;
}

export interface ApiListResponse<T> {
  success: boolean;
  objects: T[];
  error?: string;
}

export interface ApiFormResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

export interface ApiSubmitResponse {
  success: boolean;
  error?: string;
}
