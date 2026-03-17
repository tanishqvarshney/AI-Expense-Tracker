import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../colors';

interface SummaryCardProps {
  label: string;
  value: string;
  isAmount?: boolean;
  theme?: 'light' | 'dark';
}

export const SummaryCard: React.FC<SummaryCardProps> = ({ 
  label, 
  value, 
  isAmount, 
  theme = 'light' 
}) => {
  const colors = Colors[theme];

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
      <Text style={[styles.value, { color: colors.text }]}>{value}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    flex: 1,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  value: {
    fontSize: 20,
    fontWeight: '700',
  },
});
