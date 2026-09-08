export type CustomerType = 'regular' | 'senior' | 'priority';

export type TokenStatus = 'waiting' | 'called' | 'serving' | 'completed';

export interface Service {
  id: number;
  name: string;
  base_duration: number;
}

export interface Counter {
  id: number;
  name: string;
  is_active: boolean;
  current_token_id?: number | null;
}

export interface Token {
  id: number;
  token_number: string;
  customer_name?: string | null;
  customer_type: CustomerType | string;
  service_id: number;
  counter_id?: number | null;
  predicted_duration: number;
  estimated_wait: number;
  status: TokenStatus | string;
  created_at: string;
  called_at?: string | null;
  completed_at?: string | null;
  actual_duration?: number | null;
}

export interface TokenCreatePayload {
  customer_name?: string | null;
  customer_type: CustomerType;
  service_id: number;
}

export interface CompleteRequestPayload {
  actual_duration?: number | null;
}

export interface DashboardStats {
  totalWaiting: number;
  currentlyServing: number;
  completedCount: number;
  avgPredictedDuration: number;
  activeCounters: number;
}
