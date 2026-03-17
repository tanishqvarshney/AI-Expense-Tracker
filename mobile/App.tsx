import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, Alert, ActivityIndicator, View, Platform 
} from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Expense } from './src/types';
import { getExpenses, addExpense, deleteExpense, updateExpense, loginUser, signupUser, User } from './src/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Dashboard } from './src/screens/Dashboard';
import { AddExpense } from './src/screens/AddExpense';
import { MerchantDetails } from './src/screens/MerchantDetails';
import { Login } from './src/screens/Login';
import { Signup } from './src/screens/Signup';
import { Analytics } from './src/screens/Analytics';
import { Settings } from './src/screens/Settings';
import { Theme, Colors } from './src/colors';

type ViewState = 'login' | 'signup' | 'dashboard' | 'add' | 'details' | 'analytics' | 'settings';

const AUTH_KEY = '@auth_user';

export default function App() {
  const [view, setView] = useState<ViewState>('login');
  const [theme, setTheme] = useState<Theme>('light');
  const [user, setUser] = useState<User | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const colors = Colors[theme];

  useEffect(() => {
    restoreSession();
  }, []);

  const restoreSession = async () => {
    try {
      setInitialLoading(true);
      const savedUser = await AsyncStorage.getItem(AUTH_KEY);
      if (savedUser) {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        setView('dashboard');
        await fetchExpenses(userData.id);
      }
    } catch (e) {
      console.log('Failed to restore session');
    } finally {
      setInitialLoading(false);
    }
  };

  const fetchExpenses = async (userIdOverride?: number) => {
    const idToUse = userIdOverride || user?.id;
    if (!idToUse) return;
    try {
      const data = await getExpenses(idToUse);
      setExpenses(data);
    } catch (error: any) {
      console.log('Fetch error:', error.message);
    }
  };

  const handleLoginSuccess = async (userData: User) => {
    try {
      await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(userData));
      setUser(userData);
      setView('dashboard');
      await fetchExpenses(userData.id);
    } catch (e) {
      Alert.alert('Error', 'Failed to save session');
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem(AUTH_KEY);
      setUser(null);
      setExpenses([]);
      setView('login');
    } catch (e) {
      Alert.alert('Error', 'Failed to logout');
    }
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const handleManualSave = async (data: { merchant: string; amount: number; note: string; category: string; currency: string }) => {
    if (!user) return;
    setLoading(true);
    try {
      const phrase = `Spent ${data.currency} ${data.amount} at ${data.merchant}. ${data.note}. Tags: ${data.category}`;
      const newExpense = await addExpense(user.id, phrase);
      setExpenses(prev => [newExpense, ...prev]);
      setView('dashboard');
    } catch (error: any) {
      Alert.alert('Error Saving', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: number) => {
    const performDelete = async () => {
      if (!user) return;
      try {
        await deleteExpense(user.id, id);
        setExpenses(prev => prev.filter(e => e.id !== id));
        setView('dashboard');
      } catch (err: any) {
        Alert.alert('Error', err.message);
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm("Are you sure you want to delete this expense?")) {
        performDelete();
      }
    } else {
      Alert.alert(
        "Delete Expense",
        "Are you sure?",
        [
          { text: "Cancel", style: "cancel" },
          { 
            text: "Delete", 
            style: "destructive",
            onPress: performDelete
          }
        ]
      );
    }
  };

  const handleUpdateExpense = async (id: number, updates: Partial<Expense>) => {
    if (!user) return;
    try {
      await updateExpense(user.id, id, updates);
      setExpenses(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
    } catch (err: any) {
      Alert.alert('Error Updating', err.message);
    }
  };

  const renderContent = () => {
    if (view === 'login') {
      return (
        <Login 
          onLogin={handleLoginSuccess} 
          onGoToSignup={() => setView('signup')}
          theme={theme} 
        />
      );
    }

    if (view === 'signup') {
      return (
        <Signup 
          onSignup={handleLoginSuccess}
          onBackToLogin={() => setView('login')}
          theme={theme}
        />
      );
    }

    if (initialLoading) {
      return (
        <View style={[styles.centered, { backgroundColor: colors.background }]}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      );
    }

    switch (view) {
      case 'add':
        return (
          <AddExpense 
            onBack={() => setView('dashboard')} 
            onSave={handleManualSave}
            theme={theme}
          />
        );
      case 'details':
        if (!selectedExpense) return null;
        return (
          <MerchantDetails 
            expense={selectedExpense} 
            onBack={() => setView('dashboard')} 
            onDelete={handleDelete}
            onUpdate={handleUpdateExpense}
            theme={theme}
          />
        );
      case 'analytics':
        return (
          <Analytics 
            expenses={expenses}
            onBack={() => setView('dashboard')}
            theme={theme}
          />
        );
      case 'settings':
        return (
          <Settings 
             onBack={() => setView('dashboard')}
             theme={theme}
             toggleTheme={toggleTheme}
          />
        );
      case 'dashboard':
      default:
        return (
          <Dashboard 
            expenses={expenses} 
            onAddPress={() => setView('add')}
            onExpensePress={(e) => {
              setSelectedExpense(e);
              setView('details');
            }}
            onLogout={handleLogout}
            onAnalyticsPress={() => setView('analytics')}
            onSettingsPress={() => setView('settings')}
            theme={theme}
          />
        );
    }
  };

  return (
    <SafeAreaProvider>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar style={theme === 'light' ? 'dark' : 'light'} />
        <SafeAreaView style={styles.safeArea}>
          {renderContent()}
        </SafeAreaView>
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  }
});
