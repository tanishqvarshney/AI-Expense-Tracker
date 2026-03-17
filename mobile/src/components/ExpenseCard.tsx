import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Expense } from '../types';

interface Props {
  expense: Expense;
  onDelete: (id: number) => void;
}

const CATEGORY_EMOJIS: Record<string, string> = {
  'Food & Dining': '🍔',
  'Transport': '🚗',
  'Shopping': '🛒',
  'Entertainment': '📺',
  'Bills & Utilities': '📄',
  'Health': '💊',
  'Travel': '✈️',
  'Other': '📦'
};

const timeAgo = (dateStr: string) => {
  const date = new Date(dateStr);
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  
  if (Math.abs(seconds) < 60) return 'just now';
  
  const intervals: { [key: string]: number } = {
    day: 86400, hour: 3600, minute: 60
  };

  for (const [unit, secondsInUnit] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / secondsInUnit);
    if (interval >= 1) return `${interval} ${unit}${interval === 1 ? '' : 's'} ago`;
  }
  return 'just now';
};

export const ExpenseCard: React.FC<Props> = ({ expense, onDelete }) => {
  const emoji = CATEGORY_EMOJIS[expense.category] || '📦';
  
  return (
    <View style={styles.card}>
      <View style={styles.emojiContainer}>
        <Text style={styles.emoji}>{emoji}</Text>
      </View>
      
      <View style={styles.details}>
        <Text style={styles.description}>{expense.description}</Text>
        <Text style={styles.categoryInfo}>
          {expense.category} {expense.merchant ? `• ${expense.merchant}` : ''}
        </Text>
        <Text style={styles.time}>{timeAgo(expense.created_at)}</Text>
      </View>
      
      <View style={styles.rightCols}>
        <Text style={styles.amount}>
          {expense.currency === 'INR' ? '₹' : '$'}{expense.amount.toLocaleString()}
        </Text>
        <TouchableOpacity 
          onPress={() => onDelete(expense.id)} 
          style={styles.deleteBtn}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <MaterialCommunityIcons name="trash-can-outline" size={20} color="#ef4444" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: 'rgba(30, 41, 59, 0.6)', 
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.1)',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    alignItems: 'center'
  },
  emojiContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.2)'
  },
  emoji: { 
    fontSize: 24 
  },
  details: { 
    flex: 1,
    justifyContent: 'center'
  },
  description: { 
    fontSize: 17, 
    fontWeight: '700', 
    color: '#f8fafc',
    marginBottom: 4,
    letterSpacing: 0.3
  },
  categoryInfo: { 
    fontSize: 13, 
    color: '#94a3b8', 
    marginBottom: 4,
    fontWeight: '500'
  },
  time: { 
    fontSize: 11, 
    color: '#475569',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  rightCols: { 
    alignItems: 'flex-end', 
    justifyContent: 'space-between', 
    height: '100%',
    paddingVertical: 2
  },
  amount: { 
    fontSize: 18, 
    fontWeight: '800', 
    color: '#38bdf8', 
    marginBottom: 8,
    letterSpacing: 0.5
  },
  deleteBtn: { 
    padding: 8, 
    borderRadius: 12,
    backgroundColor: 'rgba(239, 68, 68, 0.1)'
  }
});
