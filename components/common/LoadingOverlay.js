// components/common/LoadingOverlay.js
import React, { useEffect, useRef } from 'react';
import { View, Modal, StyleSheet, Animated, Easing, Image } from 'react-native';
// Ionicons foi removido, pois não é mais usado
import { useTheme } from '../../contexts/ThemeContext';

const LoadingOverlay = ({ visible }) => {
    const { colors } = useTheme();
    const styles = getStyles(colors);
    
    // Mantemos apenas a animação de rotação
    const rotationAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            // A animação de rotação contínua
            Animated.loop(
                Animated.timing(rotationAnim, {
                    toValue: 1,
                    duration: 1000, // Duração de 1 segundo por volta
                    easing: Easing.linear,
                    useNativeDriver: true,
                })
            ).start();
        }
    }, [visible, rotationAnim]);

    // Interpola o valor da animação para graus (0 a 360)
    const spin = rotationAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    if (!visible) {
        return null;
    }

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            statusBarTranslucent={true}
        >
            <View style={styles.overlay}>
                {/* Usamos Animated.Image para poder animar a propriedade transform */}
                <Animated.Image
                    source={colors.LoadingIcon} // Usando o novo ícone do seu tema
                    style={[
                        styles.icon,
                        { transform: [{ rotate: spin }] }
                    ]}
                />
            </View>
        </Modal>
    );
};

const getStyles = (colors) => StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'transparent', // Fundo transparente, sem escurecimento
        justifyContent: 'center',
        alignItems: 'center',
    },
    icon: {
        width: 64, // Tamanho do ícone
        height: 64, // Tamanho do ícone
    }
});

export default LoadingOverlay;