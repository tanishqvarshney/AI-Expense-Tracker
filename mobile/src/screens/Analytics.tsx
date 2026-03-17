import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { DonutChart } from '../components/DonutChart';
import { Expense } from '../types';
import { Colors } from '../colors';

interface AnalyticsProps {
  expenses: Expense[];
  onBack: () => void;
  theme: 'light' | 'dark';
}

export const Analytics: React.FC<AnalyticsProps> = ({ expenses, onBack, theme }) => {
  const colors = Colors[theme];
  const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0);
  
  // Basic category aggregation
  const categoryData = expenses.reduce((acc, e) => {
    const cat = e.category || 'Other';
    acc[cat] = (acc[cat] || 0) + e.amount;
    return acc;
  }, {} as Record<string, number>);

  const chartColors = ['#004B23', '#DAF7A6', '#00703C', '#2ECC71', '#27AE60'];
  const chartSectors = Object.entries(categoryData).map(([name, value], i) => ({
    value,
    color: chartColors[i % chartColors.length]
  }));

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={onBack}>
          <Feather name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Analytics</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={[styles.card, { backgroundColor: theme === 'light' ? '#000' : colors.card }]}>
          <Text style={styles.cardTitle}>Total Spending</Text>
          <Text style={styles.cardAmount}>₹{totalAmount.toFixed(2)}</Text>
          <Text style={styles.cardSub}>Across {expenses.length} transactions</Text>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>Category Breakdown</Text>
        <View style={styles.chartContainer}>
           <DonutChart 
             size={220} 
             data={chartSectors}
             text={expenses.length > 0 ? "Spending by Category" : "No data to display"}
             theme={theme}
           />
        </View>

        <View style={styles.legend}>
          {Object.entries(categoryData).map(([cat, val], i) => (
            <View key={cat} style={styles.legendItem}>
              <View style={[styles.dot, { backgroundColor: chartColors[i % chartColors.length] }]} />
              <Text style={[styles.legendText, { color: colors.text }]}>{cat || 'Uncategorized'}</Text>
              <Text style={[styles.legendValue, { color: colors.text }]}>₹{val.toFixed(2)}</Text>
            </View>
          ))}
        </View>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>Insights</Text>
        <View style={[styles.insightCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
           <Feather name="trending-up" size={24} color={colors.primary} />
           <Text style={[styles.insightText, { color: colors.text }]}>Your spending has increased by 12% compared to last week.</Text>
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
  card: {
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
  },
  cardTitle: {
    color: '#999',
    fontSize: 14,
    marginBottom: 8,
  },
  cardAmount: {
    color: '#FFF',
    fontSize: 32,
    fontWeight: '800',
  },
  cardSub: {
    color: '#666',
    fontSize: 12,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  chartContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  legend: {
    marginBottom: 32,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  legendText: {
    flex: 1,
    fontSize: 14,
  },
  legendValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  insightCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  insightText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    lineHeight: 20,
  }
});
