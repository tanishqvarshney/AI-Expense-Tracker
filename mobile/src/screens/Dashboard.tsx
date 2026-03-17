import React, { useState } from 'react';
import { 
  StyleSheet, Text, View, ScrollView, TouchableOpacity, 
  TextInput, Modal, Animated, Pressable, Alert, 
  ActivityIndicator, Image, FlatList 
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { Expense } from '../types';
import { getMerchantIcon, getCategoryIcon, getMerchantLogo } from '../utils/icons';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { queryAI } from '../api';
import { SummaryCard } from '../components/SummaryCard';
import { DonutChart } from '../components/DonutChart';

interface DashboardProps {
  expenses: Expense[];
  onAddPress: () => void;
  onExpensePress: (expense: Expense) => void;
  onAnalyticsPress: () => void;
  onSettingsPress: () => void;
}

const MerchantIcon: React.FC<{ name: string; colors: any }> = ({ name, colors }) => {
  const [logoFailed, setLogoFailed] = useState(false);
  const logoUrl = getMerchantLogo(name);

  // Reset failure state if the name changes
  React.useEffect(() => {
    setLogoFailed(false);
  }, [name]);

  if (logoUrl && !logoFailed) {
    return (
      <Image 
        source={{ uri: logoUrl }} 
        style={styles.merchantLogo} 
        resizeMode="cover"
        onError={() => {
          console.log(`Logo failed for: ${name} (${logoUrl})`);
          setLogoFailed(true);
        }}
      />
    );
  }

  return (
    <MaterialCommunityIcons
      name={getMerchantIcon(name)}
      size={24}
      color={colors.text}
    />
  );
};

export const Dashboard: React.FC<DashboardProps> = ({
  expenses,
  onAddPress,
  onExpensePress,
  onAnalyticsPress,
  onSettingsPress,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [aiQuery, setAiQuery] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);

  const { theme, colors, toggleTheme } = useTheme();
  const { user, logout } = useAuth();

  const toggleMenu = () => setMenuOpen(!menuOpen);

  const handleHelp = () => {
    Alert.alert(
      "AI Expense tracker Guide",
      "Welcome Admin! \n\n1. Use the + button to add expenses.\n2. Tap any transaction to see details.\n3. The AI assistant at the bottom can analyze your data.",
      [{ text: "Got it" }]
    );
  };

  const handleAiSearch = async () => {
     if (!aiQuery.trim()) return;
     setAiLoading(true);
     setAiResponse(null);
     try {
        const answer = await queryAI(aiQuery, expenses);
        setAiResponse(answer);
        setAiQuery('');
     } catch (err: any) {
        setAiResponse("Sorry, I couldn't analyze that. " + err.message);
     } finally {
        setAiLoading(false);
     }
  };

  const { totalAmount, totalReceipts, chartData } = React.useMemo(() => {
    const total = expenses.reduce((sum, e) => sum + e.amount, 0);
    const count = expenses.length;

    const categoriesMap = expenses.reduce((acc, e) => {
      const cat = e.category || 'Other';
      acc[cat] = (acc[cat] || 0) + e.amount;
      return acc;
    }, {} as Record<string, number>);

    const chartColors = ['#004B23', '#DAF7A6', '#00703C', '#2ECC71', '#27AE60'];
    const data = Object.entries(categoriesMap).map(([name, value], i) => ({
      name,
      value: value as number,
      color: chartColors[i % chartColors.length]
    }));

    return { totalAmount: total, totalReceipts: count, chartData: data };
  }, [expenses]);

  const renderExpenseItem = ({ item }: { item: Expense }) => (
    <TouchableOpacity 
      key={item.id} 
      style={[styles.tableRow, { borderBottomColor: colors.border }]} 
      onPress={() => onExpensePress(item)}
    >
      <View style={[styles.iconContainer, { backgroundColor: colors.card }]}>
        <MerchantIcon name={item.merchant || item.description || ''} colors={colors} />
      </View>
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text style={[styles.tableName, { color: colors.text }]} numberOfLines={1}>
          {item.merchant || item.description || "Unnamed Expense"}
        </Text>
        <Text style={[styles.tableSub, { color: colors.textSecondary }]}>
           {item.category || 'General'} • {new Date(item.created_at || '').toLocaleDateString()}
        </Text>
      </View>
      <Text style={[styles.tableAmount, { color: colors.text }]}>₹{item.amount.toFixed(2)}</Text>
    </TouchableOpacity>
  );

  const HeaderComponent = () => (
    <>
      <Text style={[styles.greeting, { color: colors.text }]}>Hello, {user?.name || 'User'} 👋</Text>

      {/* SummarySection */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Summary</Text>
        <TouchableOpacity style={styles.datePicker}>
          <Text style={[styles.dateText, { color: colors.textSecondary }]}>Last 30 days</Text>
          <Feather name="chevron-down" size={16} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <View style={styles.summaryRow}>
        <SummaryCard 
          label="Total" 
          value={`₹${totalAmount.toFixed(2)}`} 
          isAmount 
          theme={theme}
        />
        <SummaryCard 
          label="Receipts" 
          value={totalReceipts.toString()} 
          theme={theme}
        />
      </View>

      {/* Categories Section */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Categories</Text>
      </View>

      <View style={styles.chartWrapper}>
          <DonutChart 
            size={180}
            data={chartData} 
            text={totalReceipts > 0 ? "Spending distribution" : "No data yet"}
            theme={theme}
          />
          {/* Chart Legend */}
          <View style={styles.legendContainer}>
            {chartData.map((item, i) => (
              <View key={i} style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                <Text style={[styles.legendText, { color: colors.text }]}>{item.name}</Text>
                <Text style={[styles.legendValue, { color: colors.textSecondary }]}>
                  {((item.value / (totalAmount || 1)) * 100).toFixed(0)}%
                </Text>
              </View>
            ))}
          </View>
      </View>

      {/* Recent Expenses List */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Expenses</Text>
      </View>
    </>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Top Bar */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={toggleMenu}>
          <Feather name="menu" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>AI Expense tracker</Text>
        <TouchableOpacity onPress={handleHelp}>
          <Feather name="help-circle" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={expenses}
        renderItem={renderExpenseItem}
        keyExtractor={item => item.id.toString()}
        ListHeaderComponent={HeaderComponent}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyTable}>
            <Text style={[styles.emptyTableText, { color: colors.textSecondary }]}>No transactions found</Text>
          </View>
        }
      />

      {/* AI Response Bubble */}
      {aiResponse && (
        <View style={[styles.aiBubble, { backgroundColor: colors.primary }]}>
           <Text style={styles.aiBubbleText}>{aiResponse}</Text>
           <TouchableOpacity onPress={() => setAiResponse(null)} style={styles.aiClose}>
              <Feather name="x" size={16} color="#FFF" />
           </TouchableOpacity>
        </View>
      )}

      {/* Floating Action Button */}
      <TouchableOpacity 
        style={[styles.fab, { backgroundColor: colors.fab }]} 
        onPress={onAddPress}
      >
        <Feather name="plus" size={32} color={colors.fabIcon} />
      </TouchableOpacity>

      {/* Bottom Chat Bar (AI Assistant) */}
      <View style={[styles.chatBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <TextInput 
          placeholder="Ask AI Assistant anything..." 
          style={[styles.chatInput, { color: colors.text }]}
          placeholderTextColor={colors.textSecondary}
          value={aiQuery}
          onChangeText={setAiQuery}
          onSubmitEditing={handleAiSearch}
        />
        {aiLoading ? (
           <ActivityIndicator size="small" color={colors.primary} />
        ) : (
           <TouchableOpacity onPress={handleAiSearch}>
              <Feather name="send" size={20} color={colors.textSecondary} />
           </TouchableOpacity>
        )}
      </View>

      {/* Side Menu Modal */}
      <Modal visible={menuOpen} transparent={true} animationType="fade" onRequestClose={toggleMenu}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={toggleMenu}>
          <Animated.View style={[styles.sideMenu, { backgroundColor: colors.background }]}>
            <View style={styles.menuHeader}>
              <Text style={[styles.menuTitle, { color: colors.text }]}>AI Expense tracker</Text>
              <Text style={[styles.menuUser, { color: colors.textSecondary }]}>{expenses[0]?.user_id ? 'User ID: ' + expenses[0].user_id : 'User'}</Text>
            </View>
            <View style={styles.menuItems}>
              <TouchableOpacity style={styles.menuItem} onPress={toggleMenu}>
                <Feather name="home" size={20} color={colors.text} />
                <Text style={[styles.menuItemText, { color: colors.text }]}>Dashboard</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.menuItem} onPress={() => { toggleMenu(); onAnalyticsPress(); }}>
                <Feather name="pie-chart" size={20} color={colors.text} />
                <Text style={[styles.menuItemText, { color: colors.text }]}>Analytics</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.menuItem} onPress={() => { toggleMenu(); onSettingsPress(); }}>
                <Feather name="settings" size={20} color={colors.text} />
                <Text style={[styles.menuItemText, { color: colors.text }]}>Settings</Text>
              </TouchableOpacity>
              <View style={[styles.menuDivider, { backgroundColor: colors.border }]} />
              <TouchableOpacity style={[styles.menuItem, styles.logoutItem]} onPress={() => { toggleMenu(); logout(); }}>
                <Feather name="log-out" size={20} color={colors.error} />
                <Text style={[styles.menuItemText, { color: colors.error }]}>Logout</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 60,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 20, fontWeight: '700' },
  scroll: { padding: 16, paddingBottom: 150 },
  greeting: { fontSize: 20, fontWeight: '600', marginBottom: 24 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 18, fontWeight: '700' },
  datePicker: { flexDirection: 'row', alignItems: 'center' },
  dateText: { fontSize: 14, marginRight: 4 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  chartWrapper: { alignItems: 'center', marginBottom: 24 },
  legendContainer: { width: '100%', marginTop: 10 },
  legendItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  legendDot: { width: 10, height: 10, borderRadius: 5, marginRight: 10 },
  legendText: { flex: 1, fontSize: 14 },
  legendValue: { fontSize: 14, fontWeight: '700' },
  tableRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1 },
  iconContainer: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  merchantLogo: { width: 44, height: 44, borderRadius: 22 },
  tableName: { fontSize: 16, fontWeight: '600' },
  tableSub: { fontSize: 12, marginTop: 2 },
  tableAmount: { fontSize: 16, fontWeight: '700' },
  emptyTable: { paddingVertical: 40, alignItems: 'center' },
  emptyTableText: { fontSize: 14, fontStyle: 'italic' },
  aiBubble: {
     position: 'absolute',
     bottom: 90,
     left: 16,
     right: 16,
     padding: 16,
     borderRadius: 16,
     shadowColor: '#000',
     shadowOffset: { width: 0, height: 4 },
     shadowOpacity: 0.2,
     shadowRadius: 8,
     elevation: 10,
  },
  aiBubbleText: { color: '#FFF', fontSize: 14, lineHeight: 20, paddingRight: 20 },
  aiClose: { position: 'absolute', top: 12, right: 12 },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 90,
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
  },
  chatBar: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    height: 56,
    borderRadius: 28,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
  },
  chatInput: { flex: 1, fontSize: 16, marginRight: 10 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  sideMenu: { width: '75%', height: '100%', padding: 24, paddingTop: 60 },
  menuHeader: { marginBottom: 40 },
  menuTitle: { fontSize: 24, fontWeight: '800' },
  menuUser: { fontSize: 14, marginTop: 4 },
  menuItems: { flex: 1 },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16 },
  menuItemText: { fontSize: 16, fontWeight: '600', marginLeft: 16 },
  menuDivider: { height: 1, marginVertical: 16 },
  logoutItem: { marginTop: 'auto', marginBottom: 40 }
});
