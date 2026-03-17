export interface Expense {
  id: number;
  user_id?: number;
  amount: number;
  currency: string;
  category: string;
  description: string;
  merchant: string | null;
  merchant_address?: string | null;
  products?: string | null;
  original_input: string;
  created_at: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
