import React, { useState } from 'react';
import { 
  StyleSheet, Text, View, TouchableOpacity, 
  ScrollView, TextInput, Modal, FlatList 
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Expense } from '../types';
import { Colors } from '../colors';

interface Product {
  id: string;
  name: string;
  price: number;
}

interface MerchantDetailsProps {
  expense: Expense;
  onBack: () => void;
  onDelete: (id: number) => void;
  onUpdate: (id: number, updates: Partial<Expense>) => void;
  theme: 'light' | 'dark';
}

export const MerchantDetails: React.FC<MerchantDetailsProps> = ({ 
  expense, 
  onBack, 
  onDelete,
  onUpdate,
  theme
}) => {
  const [sections, setSections] = useState({
    merchant: true,
    receipt: true,
    products: true,
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editedMerchant, setEditedMerchant] = useState(expense.merchant || expense.description || '');
  const [editedAmount, setEditedAmount] = useState(expense.amount.toString());
  const [editedCategory, setEditedCategory] = useState(expense.category || '');
  const [address, setAddress] = useState(expense.merchant_address || 'N/A');
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      return expense.products ? JSON.parse(expense.products) : [];
    } catch {
      return [];
    }
  });
  const [isAddProductModalVisible, setIsAddProductModalVisible] = useState(false);
  const [newProductName, setNewProductName] = useState('');
  const [newProductPrice, setNewProductPrice] = useState('');

  const colors = Colors[theme];

  const toggleSection = (name: keyof typeof sections) => {
    setSections(prev => ({ ...prev, [name]: !prev[name] }));
  };

  const saveAddress = () => {
    setIsEditingAddress(false);
    onUpdate(expense.id, { merchant_address: address });
  };

  const handleFullSave = () => {
    onUpdate(expense.id, {
      merchant: editedMerchant,
      amount: parseFloat(editedAmount) || 0,
      category: editedCategory
    });
    setIsEditing(false);
  };

  const addProduct = () => {
    if (!newProductName || !newProductPrice) return;
    const newProduct: Product = {
      id: Math.random().toString(36).substr(2, 9),
      name: newProductName,
      price: parseFloat(newProductPrice) || 0,
    };
    const updatedProducts = [...products, newProduct];
    setProducts(updatedProducts);
    onUpdate(expense.id, { products: JSON.stringify(updatedProducts) });
    setNewProductName('');
    setNewProductPrice('');
    setIsAddProductModalVisible(false);
  };

  const removeProduct = (id: string) => {
    const updatedProducts = products.filter(p => p.id !== id);
    setProducts(updatedProducts);
    onUpdate(expense.id, { products: JSON.stringify(updatedProducts) });
  };

  const merchantName = (isEditing ? editedMerchant : (expense.merchant || expense.description || "Unnamed Merchant")).toUpperCase();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={onBack}>
          <Feather name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{merchantName}</Text>
        <TouchableOpacity onPress={() => setIsEditing(!isEditing)}>
          <Feather name={isEditing ? "x" : "more-vertical"} size={24} color={isEditing ? colors.error : colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Merchant Information Section */}
        <TouchableOpacity 
          style={[styles.sectionHeader, { borderTopColor: colors.border }]} 
          onPress={() => toggleSection('merchant')}
        >
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Merchant Information</Text>
          <Feather name={sections.merchant ? "chevron-up" : "chevron-down"} size={20} color={colors.text} />
        </TouchableOpacity>
        {sections.merchant && (
          <View style={styles.sectionContent}>
             {isEditing ? (
               <View style={styles.detailRow}>
                 <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Name</Text>
                 <TextInput 
                   style={[styles.input, { color: colors.text, borderColor: colors.border }]}
                   value={editedMerchant}
                   onChangeText={setEditedMerchant}
                 />
               </View>
             ) : null}
             
             {isEditingAddress ? (
               <View style={styles.editRow}>
                 <TextInput 
                   style={[styles.input, { color: colors.text, borderColor: colors.border }]}
                   value={address}
                   onChangeText={setAddress}
                   autoFocus
                 />
                 <TouchableOpacity onPress={saveAddress}>
                   <Feather name="check" size={20} color={colors.primary} />
                 </TouchableOpacity>
               </View>
             ) : (
               <TouchableOpacity style={styles.detailRow} onPress={() => setIsEditingAddress(true)}>
                 <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Address</Text>
                 <Text style={[styles.detailValue, { color: colors.text }]}>{address}</Text>
               </TouchableOpacity>
             )}
          </View>
        )}

        {/* Receipt Details Section */}
        <TouchableOpacity 
          style={[styles.sectionHeader, { borderTopColor: colors.border }]} 
          onPress={() => toggleSection('receipt')}
        >
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Receipt Details</Text>
          <Feather name={sections.receipt ? "chevron-up" : "chevron-down"} size={20} color={colors.text} />
        </TouchableOpacity>
        {sections.receipt && (
          <View style={styles.sectionContent}>
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Note</Text>
              <Text style={[styles.detailValue, { color: colors.text }]}>{expense.description || "Add note"}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Tags / Category</Text>
              {isEditing ? (
                <TextInput 
                  style={[styles.input, { color: colors.text, borderColor: colors.border }]}
                  value={editedCategory}
                  onChangeText={setEditedCategory}
                />
              ) : (
                <Text style={[styles.detailValue, { color: colors.text }]}>{expense.category || "Add Tags"}</Text>
              )}
            </View>
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Date</Text>
              <Text style={[styles.detailValue, { color: colors.text }]}>{new Date(expense.created_at || new Date()).toLocaleString()}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Total Amount</Text>
              {isEditing ? (
                <TextInput 
                  style={[styles.input, { color: colors.text, borderColor: colors.border }]}
                  value={editedAmount}
                  onChangeText={setEditedAmount}
                  keyboardType="numeric"
                />
              ) : (
                <Text style={[styles.detailValue, { color: colors.text }]}>₹{expense.amount.toFixed(2)}</Text>
              )}
            </View>
          </View>
        )}

        {/* Products Section */}
        <TouchableOpacity 
          style={[styles.sectionHeader, { borderTopColor: colors.border }]} 
          onPress={() => toggleSection('products')}
        >
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Products</Text>
          <Feather name={sections.products ? "chevron-up" : "chevron-down"} size={20} color={colors.text} />
        </TouchableOpacity>
        {sections.products && (
          <View style={styles.sectionContent}>
             {products.map(p => (
               <View key={p.id} style={styles.productItem}>
                 <Text style={[styles.productName, { color: colors.text }]}>{p.name}</Text>
                 <Text style={[styles.productPrice, { color: colors.text }]}>₹{p.price.toFixed(2)}</Text>
                 <TouchableOpacity onPress={() => removeProduct(p.id)}>
                   <Feather name="trash-2" size={16} color={colors.error} />
                 </TouchableOpacity>
               </View>
             ))}
             <TouchableOpacity 
               style={[styles.addButton, { borderColor: colors.text }]}
               onPress={() => setIsAddProductModalVisible(true)}
             >
               <Text style={[styles.addButtonText, { color: colors.text }]}>Add product</Text>
             </TouchableOpacity>
          </View>
        )}

        <View style={[styles.totalRow, { borderTopColor: colors.border }]}>
          <Text style={[styles.totalLabel, { color: colors.text }]}>Total</Text>
          <Text style={[styles.totalValue, { color: colors.text }]}>₹{isEditing ? parseFloat(editedAmount || '0').toFixed(2) : expense.amount.toFixed(2)}</Text>
        </View>

        {isEditing && (
          <TouchableOpacity 
            style={[styles.saveAllButton, { backgroundColor: colors.primary }]}
            onPress={handleFullSave}
          >
            <Text style={styles.saveAllText}>Save Changes</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Add Product Modal */}
      <Modal visible={isAddProductModalVisible} transparent animationType="slide">
         <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
               <Text style={[styles.modalTitle, { color: colors.text }]}>Add New Product</Text>
               <TextInput 
                 placeholder="Product Name" 
                 placeholderTextColor={colors.textSecondary}
                 style={[styles.modalInput, { color: colors.text, borderColor: colors.border }]}
                 value={newProductName}
                 onChangeText={setNewProductName}
               />
               <TextInput 
                 placeholder="Price" 
                 placeholderTextColor={colors.textSecondary}
                 style={[styles.modalInput, { color: colors.text, borderColor: colors.border }]}
                 keyboardType="numeric"
                 value={newProductPrice}
                 onChangeText={setNewProductPrice}
               />
               <View style={styles.modalButtons}>
                 <TouchableOpacity onPress={() => setIsAddProductModalVisible(false)} style={styles.modalButton}>
                   <Text style={{ color: colors.error }}>Cancel</Text>
                 </TouchableOpacity>
                 <TouchableOpacity onPress={addProduct} style={[styles.modalButton, styles.addBtn]}>
                   <Text style={{ color: colors.primary, fontWeight: '700' }}>Add</Text>
                 </TouchableOpacity>
               </View>
            </View>
         </View>
      </Modal>

      {/* Footer Actions */}
      <View style={[styles.footer, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
        <TouchableOpacity style={styles.footerAction} onPress={() => onDelete(expense.id)}>
          <Feather name="trash-2" size={24} color={colors.text} />
          <Text style={[styles.footerText, { color: colors.text }]}>Delete</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.footerAction} onPress={() => setIsEditing(!isEditing)}>
          <Feather name={isEditing ? "edit-3" : "edit-2"} size={24} color={isEditing ? colors.primary : colors.text} />
          <Text style={[styles.footerText, { color: isEditing ? colors.primary : colors.text }]}>{isEditing ? "Quit" : "Edit"}</Text>
        </TouchableOpacity>
      </View>
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
  headerTitle: { fontSize: 14, fontWeight: '700', letterSpacing: 1 },
  scroll: { padding: 16, paddingBottom: 100 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, borderTopWidth: 1 },
  sectionTitle: { fontSize: 16, fontWeight: '700' },
  sectionContent: { paddingBottom: 16 },
  detailRow: { marginBottom: 16 },
  detailLabel: { fontSize: 12, marginBottom: 4 },
  detailValue: { fontSize: 16, fontWeight: '500' },
  editRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  input: { flex: 1, borderWidth: 1, borderRadius: 8, padding: 8, marginRight: 10 },
  productItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 0.5, borderBottomColor: '#EEE' },
  productName: { flex: 1, fontSize: 15 },
  productPrice: { width: 80, textAlign: 'right', fontSize: 15, fontWeight: '600', marginRight: 10 },
  addButton: { borderWidth: 1, borderRadius: 8, paddingVertical: 12, alignItems: 'center', marginTop: 16 },
  addButtonText: { fontSize: 16, fontWeight: '500' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 24, borderTopWidth: 2, marginTop: 20 },
  totalLabel: { fontSize: 18, fontWeight: '700' },
  totalValue: { fontSize: 18, fontWeight: '700' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { borderRadius: 16, padding: 24 },
  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 20 },
  modalInput: { borderWidth: 1, borderRadius: 8, padding: 12, marginBottom: 16, fontSize: 16 },
  modalButtons: { flexDirection: 'row', justifyContent: 'flex-end' },
  modalButton: { padding: 10, marginLeft: 10 },
  addBtn: { backgroundColor: 'transparent' },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 80, flexDirection: 'row', borderTopWidth: 1, paddingBottom: 20 },
  footerAction: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  footerText: { fontSize: 12, marginTop: 4 },
  saveAllButton: {
    marginTop: 20,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  saveAllText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  }
});
