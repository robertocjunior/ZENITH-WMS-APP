// components/common/LoadingOverlay.js
import React, { useEffect, useRef } from 'react';
import { View, Modal, StyleSheet, Animated, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';

const LoadingOverlay = ({ visible }) => {
    const rotationAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            // Inicia a animação de rotação
            Animated.loop(
                Animated.timing(rotationAnim, {
                    toValue: 1,
                    duration: 1000,
                    easing: Easing.linear,
                    useNativeDriver: true,
                })
            ).start();
        }
    }, [visible, rotationAnim]);

    // Interpola o valor de 0-1 para 0-360 graus
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
                <Animated.View style={{ transform: [{ rotate: spin }] }}>
                    <Ionicons name="reload-circle-outline" size={64} color={COLORS.primary} />
                </Animated.View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
    }
});

export default LoadingOverlay;