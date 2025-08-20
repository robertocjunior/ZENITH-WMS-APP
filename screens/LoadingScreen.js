// screens/LoadingScreen.js
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import WmsLoadingAnimation from '../components/common/WmsLoadingAnimation'; // 1. Importe a nova animação

const LoadingScreen = () => {
    const { colors } = useTheme();

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* 2. Use o novo componente */}
            <WmsLoadingAnimation />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default LoadingScreen;