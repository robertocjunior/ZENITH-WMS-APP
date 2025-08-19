// components/common/AnimatedButton.js
import React from 'react';
import { Pressable, StyleSheet } from 'react-native';

const AnimatedButton = ({ onPress, children, style, disabled }) => {
    return (
        <Pressable
            onPress={onPress}
            disabled={disabled}
            style={({ pressed }) => [
                styles.buttonBase,
                style, // Aplica os estilos passados via props
                pressed && !disabled ? styles.buttonPressed : styles.buttonReleased, // Aplica a animação
                disabled ? styles.buttonDisabled : {}, // Estilo para quando estiver desabilitado
            ]}
        >
            {children}
        </Pressable>
    );
};

const styles = StyleSheet.create({
    buttonBase: {
        justifyContent: 'center',
        alignItems: 'center',
        transition: 'transform 0.1s', // Efeito de transição suave
    },
    buttonPressed: {
        transform: [{ scale: 0.97 }], // Diminui o tamanho em 3%
        opacity: 0.8,
    },
    buttonReleased: {
        transform: [{ scale: 1 }], // Volta ao tamanho original
    },
    buttonDisabled: {
        opacity: 0.5,
    },
});

export default AnimatedButton;