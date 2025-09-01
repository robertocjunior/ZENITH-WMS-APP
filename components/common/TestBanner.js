// components/common/TestBanner.js
import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const TestBanner = () => {
    const insets = useSafeAreaInsets();

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <Text style={styles.text}>AMBIENTE DE TESTE</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: '#FFD700', // Cor de ouro/amarelo para destaque
        paddingBottom: 5,
        alignItems: 'center',
        justifyContent: 'flex-end',
        zIndex: 9999, // Garante que a faixa fique por cima de tudo
        elevation: 10, // Sombra para Android
    },
    text: {
        color: '#000000',
        fontSize: 12,
        fontWeight: 'bold',
    },
});

export default TestBanner;