// components/common/ErrorModal.js
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Modal, StyleSheet, Animated } from 'react-native';
import { COLORS, SIZES } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import AnimatedButton from './AnimatedButton';

const ErrorModal = ({ visible, errorMessage, onClose }) => {
    const [isModalVisible, setIsModalVisible] = useState(visible);
    const modalOpacity = useRef(new Animated.Value(0)).current;
    const modalScale = useRef(new Animated.Value(0.9)).current;

    useEffect(() => {
        if (visible) {
            setIsModalVisible(true);
            Animated.parallel([
                Animated.timing(modalOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
                Animated.spring(modalScale, { toValue: 1, friction: 6, useNativeDriver: true })
            ]).start();
        } else {
            Animated.parallel([
                 Animated.timing(modalOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
                 Animated.timing(modalScale, { toValue: 0.9, duration: 200, useNativeDriver: true })
            ]).start(() => {
                setIsModalVisible(false);
            });
        }
    }, [visible]);

    return (
        <Modal
            animationType="none"
            transparent={true}
            visible={isModalVisible}
            onRequestClose={onClose}
            statusBarTranslucent={true}
        >
            <Animated.View style={[styles.overlay, { opacity: modalOpacity }]}>
                <Animated.View style={[styles.modalContent, { transform: [{ scale: modalScale }] }]}>
                    <Ionicons name="warning-outline" size={48} color={COLORS.danger} style={styles.icon} />
                    <Text style={styles.title}>Falha no Login</Text>
                    <Text style={styles.message}>{errorMessage}</Text>
                    <View style={styles.buttonRow}>
                        <AnimatedButton style={[styles.button, styles.confirmButton]} onPress={onClose}>
                            <Text style={styles.buttonText}>OK</Text>
                        </AnimatedButton>
                    </View>
                </Animated.View>
            </Animated.View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        width: '100%',
        maxWidth: 400,
        backgroundColor: COLORS.cardBackground,
        borderRadius: SIZES.radius,
        padding: SIZES.padding * 1.5,
        alignItems: 'center',
    },
    icon: {
        marginBottom: 15,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 10,
    },
    message: {
        fontSize: 16,
        color: COLORS.textLight,
        textAlign: 'center',
        marginBottom: 25,
    },
    buttonRow: {
        width: '100%',
        alignItems: 'flex-end',
    },
    button: {
        paddingVertical: 12,
        paddingHorizontal: 35,
        borderRadius: SIZES.radius,
    },
    confirmButton: {
        backgroundColor: COLORS.primary,
    },
    buttonText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: '500',
    },
});

export default ErrorModal;