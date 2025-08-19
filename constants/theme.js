// constants/theme.js
import { Appearance } from 'react-native';

const colorScheme = Appearance.getColorScheme();

const lightColors = {
    primary: '#00529B',
    secondary: '#00A3E0',
    background: '#f0f2f5',
    cardBackground: '#ffffff',
    text: '#333333',
    textLight: '#777777',
    border: '#e0e0e0',
    white: '#ffffff',
    black: '#000000',
    success: '#28a745',
    info: '#007bff',
    warning: '#ffc107',
    orange: '#fd7e14',
    danger: '#dc3545',
    pickingBackground: '#fffbe6',
    pickingBorder: '#ffe58f',
    historyBackground: '#f0f8ff',
    historyBorder: '#d6e8fa',
    historyHeader: '#4a6a9b',
    correctionBackground: '#fff8e1',
    correctionBorder: '#ffecb3',
    correctionHeader: '#c09b00',
};

const darkColors = {
    primary: '#007bff', // Um azul mais vibrante para o tema escuro
    secondary: '#00A3E0',
    background: '#121212',
    cardBackground: '#1e1e1e',
    text: '#e0e0e0',
    textLight: '#a0a0a0',
    border: '#333333',
    white: '#ffffff',
    black: '#000000',
    success: '#28a745',
    info: '#007bff',
    warning: '#ffc107',
    orange: '#fd7e14',
    danger: '#dc3545',
    pickingBackground: '#4d441f',
    pickingBorder: '#8c7b3f',
    historyBackground: '#2a3b4d',
    historyBorder: '#4a6a9b',
    historyHeader: '#6a8bbd',
    correctionBackground: '#4d452d',
    correctionBorder: '#8c7e5a',
    correctionHeader: '#e0c466',
};

export const COLORS = colorScheme === 'dark' ? darkColors : lightColors;

export const SIZES = {
    padding: 15,
    radius: 8,
    base: 8,
    font: 14,
    h1: 30,
    h2: 22,
    h3: 16,
    body: 14,
};