import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';

interface DataItem {
  value: number;
  color: string;
}

interface DonutChartProps {
  size?: number;
  strokeWidth?: number;
  data?: DataItem[];
  text?: string;
  theme?: 'light' | 'dark';
}

export const DonutChart: React.FC<DonutChartProps> = ({ 
  size = 200, 
  strokeWidth = 30, 
  data = [], 
  text = 'No data',
  theme = 'light'
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const total = data.reduce((sum, item) => sum + item.value, 0);

  let currentOffset = 0;

  return (
    <View style={styles.container}>
      <Svg width={size} height={size}>
        <G rotation="-90" origin={`${size / 2}, ${size / 2}`}>
          {/* Background Circle */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={theme === 'light' ? '#F0F0F0' : '#2C2C2C'}
            strokeWidth={strokeWidth}
            fill="none"
          />
          
          {total > 0 && data.map((item, index) => {
            const percentage = item.value / total;
            const strokeDashoffset = circumference - percentage * circumference;
            const rotation = (currentOffset / total) * 360;
            currentOffset += item.value;

            return (
              <G key={index} rotation={rotation} origin={`${size / 2}, ${size / 2}`}>
                <Circle
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  stroke={item.color}
                  strokeWidth={strokeWidth}
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="none"
                />
              </G>
            );
          })}
        </G>
      </Svg>
      <View style={[styles.textContainer, { width: size, height: size }]}>
        <Text style={[styles.text, { color: theme === 'light' ? '#000' : '#FFF' }]}>{text}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  textContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  text: {
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '600',
  },
});
