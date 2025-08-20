// components/common/LoadingOverlay.js
import React, { useEffect, useRef } from 'react';
import { View, Modal, StyleSheet, Animated, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';

const LoadingOverlay = ({ visible }) => {
    const { colors } = useTheme();
    const styles = getStyles(colors);
    
    const rotationAnim = useRef(new Animated.Value(0)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        if (visible) {
            const rotation = Animated.loop(
                Animated.timing(rotationAnim, {
                    toValue: 1,
                    duration: 1200,
                    easing: Easing.linear,
                    useNativeDriver: true,
                })
            );

            const pulse = Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, {
                        toValue: 1.2,
                        duration: 600,
                        easing: Easing.inOut(Easing.ease),
                        useNativeDriver: true,
                    }),
                    Animated.timing(pulseAnim, {
                        toValue: 1,
                        duration: 600,
                        easing: Easing.inOut(Easing.ease),
                        useNativeDriver: true,
                    }),
                ])
            );
            
            Animated.parallel([rotation, pulse]).start();

        }
    }, [visible, rotationAnim, pulseAnim]);

    const spin = rotationAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    const opacity = pulseAnim.interpolate({
        inputRange: [1, 1.1, 1.2],
        outputRange: [1, 0.7, 1]
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
                <Animated.View style={{
                    opacity: opacity,
                    transform: [{ rotate: spin }, { scale: pulseAnim }]
                }}>
                    <Ionicons name="reload-circle-outline" size={64} color={colors.primary} />
                </Animated.View>
            </View>
        </Modal>
    );
};

const getStyles = (colors) => StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'transparent',
        justifyContent: 'center',
        alignItems: 'center',
    }
});

export default LoadingOverlay;