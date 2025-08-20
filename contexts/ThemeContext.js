// contexts/ThemeContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import { Appearance } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightColors, darkColors } from '../constants/theme';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    // 'automatic' | 'light' | 'dark'
    const [themePreference, setThemePreference] = useState('automatic'); 
    const [theme, setTheme] = useState(Appearance.getColorScheme() || 'light');

    // Carrega a preferência salva ao iniciar o app
    useEffect(() => {
        const loadThemePreference = async () => {
            const savedPreference = await AsyncStorage.getItem('themePreference');
            if (savedPreference) {
                setThemePreference(savedPreference);
            }
        };
        loadThemePreference();
    }, []);

    // Listener para mudanças de tema no dispositivo
    useEffect(() => {
        const subscription = Appearance.addChangeListener(({ colorScheme }) => {
            if (themePreference === 'automatic') {
                setTheme(colorScheme || 'light');
            }
        });
        return () => subscription.remove();
    }, [themePreference]);

    // Aplica o tema correto baseado na preferência do usuário
    useEffect(() => {
        if (themePreference === 'automatic') {
            setTheme(Appearance.getColorScheme() || 'light');
        } else {
            setTheme(themePreference);
        }
    }, [themePreference]);

    const changeTheme = async (newPreference) => {
        await AsyncStorage.setItem('themePreference', newPreference);
        setThemePreference(newPreference);
    };

    // Seleciona o objeto de cores correto
    const colors = theme === 'dark' ? darkColors : lightColors;

    return (
        <ThemeContext.Provider value={{ theme, colors, themePreference, changeTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);