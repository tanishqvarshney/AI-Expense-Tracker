import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeInDown, FadeOutUp } from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Expense } from '../types';

interface Props {
  expense: Expense;
}

export const SuccessCard: React.FC<Props> = ({ expense }) => {
  return (
    <Animated.View 
      entering={FadeInDown.duration(400).springify()} 
      exiting={FadeOutUp.duration(300)}
      style={styles.container}
    >
      <View style={styles.headerRow}>
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons name="check-circle" size={24} color="#10b981" />
        </View>
        <Text style={styles.title}>Expense Tracked!</Text>
      </View>
      
      <View style={styles.detailsContainer}>
        <View style={styles.row}>
          <Text style={styles.label}>Amount</Text>
          <Text style={styles.valueHighlight}>
            {expense.currency === 'INR' ? '₹' : '$'}{expense.amount.toLocaleString()}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Category</Text>
          <Text style={styles.value}>{expense.category}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Description</Text>
          <Text style={styles.value}>{expense.description}</Text>
        </View>
        {expense.merchant && (
          <View style={styles.row}>
            <Text style={styles.label}>Merchant</Text>
            <Text style={styles.value}>{expense.merchant}</Text>
          </View>
        )}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    padding: 20,
    borderRadius: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    shadowColor: '#10b981',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(16, 185, 129, 0.2)'
  },
  iconContainer: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderRadius: 12,
    padding: 6,
    marginRight: 12
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#10b981',
    letterSpacing: 0.5
  },
  detailsContainer: {
    paddingHorizontal: 4
  },
  row: { 
    flexDirection: 'row', 
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12 
  },
  label: { 
    fontSize: 14,
    fontWeight: '600', 
    color: '#94a3b8',
    letterSpacing: 0.3
  },
  value: { 
    fontSize: 15,
    fontWeight: '600',
    color: '#f8fafc',
    textAlign: 'right',
    maxWidth: '60%'
  },
  valueHighlight: {
    fontSize: 18,
    fontWeight: '800',
    color: '#38bdf8'
  }
});
