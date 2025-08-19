// components/common/ErrorModal.js
import React from 'react';
import { View, Text, Modal, StyleSheet } from 'react-native';
import { COLORS, SIZES } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import AnimatedButton from './AnimatedButton';

const ErrorModal = ({ visible, errorMessage, onClose }) => {
    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.modalContent}>
                    <Ionicons name="warning-outline" size={48} color={COLORS.danger} style={styles.icon} />
                    <Text style={styles.title}>Ocorreu um Erro</Text>
                    <Text style={styles.message}>{errorMessage}</Text>
                    <AnimatedButton style={styles.button} onPress={onClose}>
                        <Text style={styles.buttonText}>Fechar</Text>
                    </AnimatedButton>
                </View>
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
    button: {
        backgroundColor: COLORS.danger,
        paddingVertical: 12,
        paddingHorizontal: 40,
        borderRadius: SIZES.radius,
    },
    buttonText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: '500',
    },
});

export default ErrorModal;