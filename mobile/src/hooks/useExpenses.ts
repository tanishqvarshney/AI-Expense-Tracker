import { useState, useCallback, useEffect } from 'react';
import { Expense } from '../types';
import { getExpenses, addExpense, deleteExpense, updateExpense } from '../api';
import { useAuth } from '../context/AuthContext';
import { Alert } from 'react-native';

export const useExpenses = () => {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchExpenses = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const data = await getExpenses(user.id);
      setExpenses(data);
    } catch (error: any) {
      console.error('Fetch error:', error.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const handleAddExpense = async (input: string) => {
    if (!user) return;
    try {
      const newExpense = await addExpense(user.id, input);
      setExpenses(prev => [newExpense, ...prev]);
      return newExpense;
    } catch (error: any) {
      Alert.alert('Error', error.message);
      throw error;
    }
  };

  const handleDeleteExpense = async (id: number) => {
    if (!user) return;
    try {
      await deleteExpense(user.id, id);
      setExpenses(prev => prev.filter(e => e.id !== id));
    } catch (error: any) {
      Alert.alert('Error', error.message);
      throw error;
    }
  };

  const handleUpdateExpense = async (id: number, updates: Partial<Expense>) => {
    if (!user) return;
    try {
      await updateExpense(user.id, id, updates);
      setExpenses(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
    } catch (error: any) {
      Alert.alert('Error', error.message);
      throw error;
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  return {
    expenses,
    loading,
    fetchExpenses,
    handleAddExpense,
    handleDeleteExpense,
    handleUpdateExpense,
  };
};
