import React, { useState } from 'react';
import { 
  StyleSheet, Text, View, TouchableOpacity, 
  TextInput, ScrollView, Modal, FlatList 
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { CalculatorKeyboard } from '../components/CalculatorKeyboard';
import { Colors } from '../colors';

interface AddExpenseProps {
  onBack: () => void;
  onSave: (data: { merchant: string; amount: number; note: string; category: string; currency: string }) => void;
  theme: 'light' | 'dark';
}

const CURRENCIES = [
  { code: 'INR', symbol: '₹' },
  { code: 'USD', symbol: '$' },
  { code: 'EUR', symbol: '€' },
  { code: 'GBP', symbol: '£' },
  { code: 'JPY', symbol: '¥' },
  { code: 'CAD', symbol: 'CA$' },
  { code: 'AUD', symbol: 'A$' },
];

export const AddExpense: React.FC<AddExpenseProps> = ({ onBack, onSave, theme }) => {
  const [amount, setAmount] = useState('0.00');
  const [merchant, setMerchant] = useState('');
  const [note, setNote] = useState('');
  const [tags, setTags] = useState('');
  const [currency, setCurrency] = useState(CURRENCIES[0]);
  const [currencyModalVisible, setCurrencyModalVisible] = useState(false);

  const colors = Colors[theme];

  const handleKeyPress = (val: string) => {
    if (amount === '0.00') setAmount(val);
    else setAmount(prev => prev + val);
  };

  const handleDelete = () => {
    if (amount.length <= 1) setAmount('0.00');
    else setAmount(prev => prev.slice(0, -1));
  };

  const handleSave = () => {
    onSave({
      merchant,
      amount: parseFloat(amount) || 0,
      note,
      category: tags,
      currency: currency.code,
    });
  };

  const selectCurrency = (c: typeof currency) => {
    setCurrency(c);
    setCurrencyModalVisible(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={onBack}>
          <Feather name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>New Expense</Text>
        <TouchableOpacity onPress={handleSave}>
          <Text style={[styles.doneButton, { color: colors.primary }]}>Done</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Large Amount Display */}
        <View style={styles.amountContainer}>
          <Text style={[styles.amountPrefix, { color: colors.text }]}>{currency.symbol}</Text>
          <Text style={[styles.amount, { color: colors.text }]}>{amount}</Text>
          <TouchableOpacity 
            style={[styles.currencyPicker, { backgroundColor: colors.card }]} 
            onPress={() => setCurrencyModalVisible(true)}
          >
            <Text style={[styles.currencyText, { color: colors.text }]}>{currency.code}</Text>
            <Feather name="chevron-down" size={14} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Form Fields */}
        <View style={[styles.field, { borderBottomColor: colors.border }]}>
          <Text style={[styles.fieldLabel, { color: colors.text }]}>Merchant Name</Text>
          <TextInput 
            placeholder="Add Merchant" 
            placeholderTextColor={colors.textSecondary}
            style={[styles.input, { color: colors.text }]}
            value={merchant}
            onChangeText={setMerchant}
          />
        </View>

        <View style={[styles.field, { borderBottomColor: colors.border }]}>
          <Text style={[styles.fieldLabel, { color: colors.text }]}>Note</Text>
          <TextInput 
            placeholder="Add note" 
            placeholderTextColor={colors.textSecondary}
            style={[styles.input, { color: colors.text }]}
            value={note}
            onChangeText={setNote}
          />
        </View>

        <View style={[styles.field, { borderBottomColor: colors.border }]}>
          <Text style={[styles.fieldLabel, { color: colors.text }]}>Tags</Text>
          <TextInput 
            placeholder="Add tags" 
            placeholderTextColor={colors.textSecondary}
            style={[styles.input, { color: colors.text }]}
            value={tags}
            onChangeText={setTags}
          />
        </View>

        <View style={[styles.field, { borderBottomColor: colors.border }]}>
          <Text style={[styles.fieldLabel, { color: colors.text }]}>Date</Text>
          <Text style={[styles.dateText, { color: colors.textSecondary }]}>{new Date().toLocaleString()}</Text>
        </View>
      </ScrollView>

      {/* Currency Modal */}
      <Modal
        visible={currencyModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setCurrencyModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.currencyModal, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Select Currency</Text>
              <TouchableOpacity onPress={() => setCurrencyModalVisible(false)}>
                <Feather name="x" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={CURRENCIES}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={[styles.currencyItem, { borderBottomColor: colors.border }]} 
                  onPress={() => selectCurrency(item)}
                >
                  <Text style={[styles.currencyItemText, { color: colors.text }]}>{item.code} ({item.symbol})</Text>
                  {currency.code === item.code && (
                    <Feather name="check" size={20} color={colors.primary} />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* Keyboard at bottom */}
      <CalculatorKeyboard 
        theme={theme}
        onPress={handleKeyPress}
        onClear={() => setAmount('0.00')}
        onDelete={handleDelete}
        onDone={handleSave}
      />
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
    fontSize: 18,
    fontWeight: '600',
  },
  doneButton: {
    fontSize: 16,
    fontWeight: '700',
  },
  scroll: {
    padding: 20,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginVertical: 40,
  },
  amountPrefix: {
    fontSize: 32,
    fontWeight: '700',
    marginRight: 4,
  },
  amount: {
    fontSize: 48,
    fontWeight: '700',
    marginRight: 12,
  },
  currencyPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  currencyText: {
    fontSize: 14,
    fontWeight: '600',
    marginRight: 4,
  },
  field: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  input: {
    fontSize: 16,
    textAlign: 'right',
    flex: 1,
    marginLeft: 20,
  },
  dateText: {
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  currencyModal: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '60%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  currencyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  currencyItemText: {
    fontSize: 16,
  }
});
