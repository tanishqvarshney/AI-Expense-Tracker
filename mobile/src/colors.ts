export const Colors = {
  light: {
    background: '#FFFFFF',
    text: '#000000',
    textSecondary: '#666666',
    border: '#F0F0F0',
    card: '#FAFAFA',
    primary: '#004B23', // Dark Green
    accent: '#DAF7A6', // Light Green
    error: '#FF3B30',
    surface: '#FFFFFF',
    inputBackground: '#FAFAFA',
    fab: '#000000',
    fabIcon: '#FFFFFF',
  },
  dark: {
    background: '#121212',
    text: '#FFFFFF',
    textSecondary: '#A0A0A0',
    border: '#2C2C2C',
    card: '#1E1E1E',
    primary: '#DAF7A6', // Light Green for dark mode readability
    accent: '#004B23',
    error: '#FF453A',
    surface: '#1E1E1E',
    inputBackground: '#2C2C2C',
    fab: '#DAF7A6',
    fabIcon: '#000000',
  }
};

export type Theme = 'light' | 'dark';
