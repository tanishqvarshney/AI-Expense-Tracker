import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Colors } from '../colors';

import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

interface SettingsProps {
  onBack: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ onBack }) => {
  const [notifications, setNotifications] = useState(true);
  const [biometrics, setBiometrics] = useState(false);
  const { theme, colors, toggleTheme } = useTheme();
  const { user } = useAuth();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={onBack}>
          <Feather name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Settings</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Profile</Text>
          <View style={[styles.item, { borderBottomColor: colors.border }]}>
            <View>
              <Text style={[styles.itemTitle, { color: colors.text }]}>Display Name</Text>
              <Text style={[styles.itemValue, { color: colors.textSecondary }]}>{user?.name || 'Admin'}</Text>
            </View>
            <Feather name="chevron-right" size={20} color={colors.border} />
          </View>
          <View style={[styles.item, { borderBottomColor: colors.border }]}>
            <View>
              <Text style={[styles.itemTitle, { color: colors.text }]}>Email</Text>
              <Text style={[styles.itemValue, { color: colors.textSecondary }]}>{user?.email || 'admin@example.com'}</Text>
            </View>
            <Feather name="chevron-right" size={20} color={colors.border} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Preferences</Text>
          <View style={[styles.item, { borderBottomColor: colors.border }]}>
             <Text style={[styles.itemTitle, { color: colors.text }]}>Default Currency</Text>
             <Text style={[styles.itemValue, { color: colors.textSecondary }]}>INR (₹)</Text>
          </View>
          
          <View style={styles.itemRow}>
             <Text style={[styles.itemTitle, { color: colors.text }]}>Dark Mode</Text>
             <Switch 
               value={theme === 'dark'} 
               onValueChange={toggleTheme}
               trackColor={{ false: '#767577', true: colors.primary }}
               thumbColor={theme === 'dark' ? '#FFF' : '#f4f3f4'}
             />
          </View>

          <View style={styles.itemRow}>
             <Text style={[styles.itemTitle, { color: colors.text }]}>Push Notifications</Text>
             <Switch 
               value={notifications} 
               onValueChange={setNotifications}
               trackColor={{ false: '#767577', true: colors.primary }}
             />
          </View>
          
          <View style={styles.itemRow}>
             <Text style={[styles.itemTitle, { color: colors.text }]}>Enable Biometrics</Text>
             <Switch 
               value={biometrics} 
               onValueChange={setBiometrics}
               trackColor={{ false: '#767577', true: colors.primary }}
             />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Support</Text>
          <TouchableOpacity style={[styles.item, { borderBottomColor: colors.border }]}>
            <Text style={[styles.itemTitle, { color: colors.text }]}>Privacy Policy</Text>
            <Feather name="external-link" size={16} color={colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.item, { borderBottomColor: colors.border }]}>
            <Text style={[styles.itemTitle, { color: colors.text }]}>Help Center</Text>
            <Feather name="external-link" size={16} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.version, { color: colors.border }]}>Version 1.0.0 (Build 24)</Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 60,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  scroll: {
    padding: 16,
  },
  section: {
    marginBottom: 32,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 12,
    letterSpacing: 1,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  itemValue: {
    fontSize: 14,
    marginTop: 2,
  },
  footer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  version: {
    fontSize: 12,
  }
});
