import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Colors } from '../colors';

interface CalculatorKeyboardProps {
  onPress: (val: string) => void;
  onClear: () => void;
  onDelete: () => void;
  onDone: () => void;
  theme?: 'light' | 'dark';
}

export const CalculatorKeyboard: React.FC<CalculatorKeyboardProps> = ({ 
  onPress, 
  onClear, 
  onDelete, 
  onDone,
  theme = 'light'
}) => {
  const colors = Colors[theme];
  
  const keys = [
    ['C', '%', '÷', '×'],
    ['7', '8', '9', '-'],
    ['4', '5', '6', '+'],
    ['1', '2', '3', '='],
    ['.', '0', 'delete', 'done'],
  ];

  const handlePress = (key: string) => {
    if (key === 'C') onClear();
    else if (key === 'delete') onDelete();
    else if (key === 'done') onDone();
    else onPress(key);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme === 'light' ? '#1A1A1A' : '#000' }]}>
      {keys.map((row, i) => (
        <View key={i} style={styles.row}>
          {row.map((key) => {
            const isSpecial = ['C', '%', '÷', '×', '-', '+', '=', 'done'].includes(key);
            const isDone = key === 'done';
            
            return (
              <TouchableOpacity 
                key={key} 
                style={[
                  styles.key, 
                  isDone && { backgroundColor: colors.primary },
                  !isDone && { backgroundColor: theme === 'light' ? '#333333' : '#1E1E1E' }
                ]} 
                onPress={() => handlePress(key)}
              >
                {key === 'delete' ? (
                  <Feather name="delete" size={24} color="#FFF" />
                ) : (
                  <Text style={[
                    styles.keyText,
                    { color: isDone ? (theme === 'light' ? '#000' : '#000') : '#FFF' },
                    isDone && styles.doneText
                  ]}>
                    {key === 'done' ? 'Done' : key}
                  </Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      ))}
    </View>
  );
};

const { width } = Dimensions.get('window');
const keySize = (width - 40) / 4;

const styles = StyleSheet.create({
  container: {
    padding: 10,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  key: {
    width: keySize,
    height: 54,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 27,
  },
  keyText: {
    fontSize: 20,
    fontWeight: '500',
  },
  doneText: {
    fontWeight: '700',
  },
});
