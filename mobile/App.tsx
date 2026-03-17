import React, { useState } from 'react';
import { StyleSheet, ActivityIndicator, View } from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Dashboard } from './src/screens/Dashboard';
import { AddExpense } from './src/screens/AddExpense';
import { MerchantDetails } from './src/screens/MerchantDetails';
import { Login } from './src/screens/Login';
import { Signup } from './src/screens/Signup';
import { Analytics } from './src/screens/Analytics';
import { Settings } from './src/screens/Settings';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { useExpenses } from './src/hooks/useExpenses';
import { Expense } from './src/types';

type ViewState = 'login' | 'signup' | 'dashboard' | 'add' | 'details' | 'analytics' | 'settings';

function AppContent() {
  const [view, setView] = useState<ViewState>('dashboard');
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  
  const { theme, colors, toggleTheme } = useTheme();
  const { user, loading: authLoading, logout } = useAuth();
  const { expenses, handleAddExpense, handleDeleteExpense, handleUpdateExpense } = useExpenses();

  if (authLoading) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!user) {
    if (view === 'signup') {
      return <Signup onSignup={() => setView('dashboard')} onBackToLogin={() => setView('login')} theme={theme} />;
    }
    return <Login onLogin={() => setView('dashboard')} onGoToSignup={() => setView('signup')} theme={theme} />;
  }

  const renderContent = () => {
    switch (view) {
      case 'add':
        return (
          <AddExpense 
            onBack={() => setView('dashboard')} 
            onSave={async (data) => {
              const phrase = `Spent ${data.currency} ${data.amount} at ${data.merchant}. ${data.note}. Tags: ${data.category}`;
              await handleAddExpense(phrase);
              setView('dashboard');
            }}
            theme={theme}
          />
        );
      case 'details':
        if (!selectedExpense) return null;
        return (
          <MerchantDetails 
            expense={selectedExpense} 
            onBack={() => setView('dashboard')} 
            onDelete={handleDeleteExpense}
            onUpdate={handleUpdateExpense}
            theme={theme}
          />
        );
      case 'analytics':
        return <Analytics expenses={expenses} onBack={() => setView('dashboard')} theme={theme} />;
      case 'settings':
        return <Settings onBack={() => setView('dashboard')} theme={theme} toggleTheme={toggleTheme} />;
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
            onAnalyticsPress={() => setView('analytics')}
            onSettingsPress={() => setView('settings')}
          />
        );
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={theme === 'light' ? 'dark' : 'light'} />
      <SafeAreaView style={styles.safeArea}>
        {renderContent()}
      </SafeAreaView>
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <ThemeProvider>
          <AppContent />
        </ThemeProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' }
});
