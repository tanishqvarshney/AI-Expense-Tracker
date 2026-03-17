import React, { useState } from 'react';
import { 
  StyleSheet, Text, View, TextInput, TouchableOpacity, 
  ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView 
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../colors';
import { signupUser, User } from '../api';

interface SignupProps {
  onSignup: (user: User) => void;
  onBackToLogin: () => void;
  theme: 'light' | 'dark';
}

export const Signup: React.FC<SignupProps> = ({ onSignup, onBackToLogin, theme }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const colors = Colors[theme];

  const handleSignup = async () => {
    setError('');
    if (!name || !email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const userData = await signupUser(email, password, name);
      onSignup(userData);
    } catch (err: any) {
      setError(err.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.inner}>
          <View style={styles.logoContainer}>
            <View style={[styles.logoCircle, { backgroundColor: colors.card }]}>
              <MaterialCommunityIcons name="account-plus" size={48} color={colors.text} />
            </View>
            <Text style={[styles.logoText, { color: colors.text }]}>Create Account</Text>
            <Text style={[styles.tagline, { color: colors.textSecondary }]}>Join AI Expense tracker today.</Text>
          </View>

          <View style={styles.form}>
            <Text style={[styles.label, { color: colors.text }]}>Full Name</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.inputBackground, color: colors.text, borderColor: colors.border }]}
              placeholder="e.g. John Doe"
              placeholderTextColor={colors.textSecondary}
              value={name}
              onChangeText={setName}
            />

            <Text style={[styles.label, { color: colors.text }]}>Email Address</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.inputBackground, color: colors.text, borderColor: colors.border }]}
              placeholder="e.g. john@example.com"
              placeholderTextColor={colors.textSecondary}
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />

            <Text style={[styles.label, { color: colors.text }]}>Password</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.inputBackground, color: colors.text, borderColor: colors.border }]}
              placeholder="••••••••"
              placeholderTextColor={colors.textSecondary}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <TouchableOpacity 
              style={[styles.signupButton, { backgroundColor: colors.text }]} 
              onPress={handleSignup}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={colors.background} />
              ) : (
                <Text style={[styles.signupButtonText, { color: colors.background }]}>Sign Up</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: colors.textSecondary }]}>Already have an account? </Text>
            <TouchableOpacity onPress={onBackToLogin}>
              <Text style={[styles.loginText, { color: colors.text }]}>Log In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
  },
  inner: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoText: {
    fontSize: 24,
    fontWeight: '800',
  },
  tagline: {
    fontSize: 14,
    marginTop: 4,
  },
  form: {
    width: '100%',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    width: '100%',
    height: 52,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    borderWidth: 1,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 14,
    marginTop: 12,
    textAlign: 'center',
  },
  signupButton: {
    width: '100%',
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 32,
  },
  signupButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 32,
    marginBottom: 40,
  },
  footerText: {
    fontSize: 14,
  },
  loginText: {
    fontSize: 14,
    fontWeight: '700',
  }
});
