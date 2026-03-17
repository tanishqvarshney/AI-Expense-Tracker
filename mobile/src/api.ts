import { Expense, ApiResponse } from './types';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

const debuggerHost = Constants.expoConfig?.hostUri;
const ip = debuggerHost ? debuggerHost.split(':')[0] : 'localhost';

// Use 10.0.2.2 for Android emulators reading localhost, otherwise local network IP for physical devices
const API_URL = Platform.OS === 'android' ? 'http://10.0.2.2:3000/api' : `http://${ip}:3000/api`; 
const TIMEOUT_MS = 10000;

class ApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

const fetchWithTimeout = async (url: string, options: RequestInit) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(id);
    return response;
  } catch (error: any) {
    clearTimeout(id);
    if (error.name === 'AbortError') {
      throw new ApiError('Request timed out. Please check your connection.');
    }
    throw new ApiError(error.message || 'Network request failed');
  }
};

export const getExpenses = async (userId: number): Promise<Expense[]> => {
  const response = await fetchWithTimeout(`${API_URL}/expenses`, { 
    method: 'GET',
    headers: { 'X-User-Id': userId.toString() }
  });
  const json: ApiResponse<Expense[]> = await response.json();
  if (!json.success || !json.data) throw new ApiError(json.error || 'Failed to fetch expenses');
  return json.data;
};

export const addExpense = async (userId: number, input: string): Promise<Expense> => {
  const response = await fetchWithTimeout(`${API_URL}/expenses`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'X-User-Id': userId.toString()
    },
    body: JSON.stringify({ input })
  });
  const json: ApiResponse<Expense> = await response.json();
  if (!json.success || !json.data) throw new ApiError(json.error || 'Failed to add expense');
  return json.data;
};

export const deleteExpense = async (userId: number, id: number): Promise<void> => {
  console.log(`[API] Deleting expense ${id} for user ${userId} at ${API_URL}/expenses/${id}`);
  const response = await fetchWithTimeout(`${API_URL}/expenses/${id}`, { 
    method: 'DELETE',
    headers: { 'X-User-Id': userId.toString() }
  });
  const json: ApiResponse<void> = await response.json();
  console.log(`[API] Delete response:`, json);
  if (!json.success) throw new ApiError(json.error || 'Failed to delete expense');
};

export const updateExpense = async (userId: number, id: number, updates: Partial<Expense>): Promise<void> => {
  const response = await fetchWithTimeout(`${API_URL}/expenses/${id}`, {
    method: 'PATCH',
    headers: { 
      'Content-Type': 'application/json',
      'X-User-Id': userId.toString()
    },
    body: JSON.stringify(updates)
  });
  const json: ApiResponse<void> = await response.json();
  if (!json.success) throw new ApiError(json.error || 'Failed to update expense');
};

export const queryAI = async (query: string, data: Expense[]): Promise<string> => {
  const response = await fetchWithTimeout(`${API_URL}/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, data })
  });
  const json: ApiResponse<string> = await response.json();
  if (!json.success || !json.data) throw new ApiError(json.error || 'Failed to analyze data');
  return json.data;
};
export interface User {
  id: number;
  email: string;
  name: string;
}

export const signupUser = async (email: string, password: string, name: string): Promise<User> => {
  const response = await fetchWithTimeout(`${API_URL}/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name })
  });
  const json: ApiResponse<User> = await response.json();
  if (!json.success || !json.data) throw new ApiError(json.error || 'Signup failed');
  return json.data;
};

export const loginUser = async (email: string, password: string): Promise<User> => {
  const response = await fetchWithTimeout(`${API_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const json: ApiResponse<User> = await response.json();
  if (!json.success || !json.data) throw new ApiError(json.error || 'Login failed');
  return json.data;
};
