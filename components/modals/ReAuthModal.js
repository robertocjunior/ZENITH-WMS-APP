// components/modals/ReAuthModal.js
import React, { useState, useEffect } from 'react';
import { View, Text, Modal, StyleSheet, TextInput, Keyboard, Pressable, ActivityIndicator } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { SIZES } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import AnimatedButton from '../common/AnimatedButton';

const ReAuthModal = ({ visible, onConfirm, onCancel, loading }) => {
    const { colors } = useTheme();
    const styles = getStyles(colors);
    const [password, setPassword] = useState('');

    useEffect(() => {
        if (!visible) {
            setPassword('');
        }
    }, [visible]);

    const handleConfirm = () => {
        if (!password) return;
        Keyboard.dismiss();
        onConfirm(password);
    };

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={onCancel}
            statusBarTranslucent={true}
        >
            <Pressable style={styles.overlay} onPress={Keyboard.dismiss}>
                <View style={styles.modalContent}>
                    <Ionicons name="warning-outline" size={48} color={colors.warning} style={styles.icon} />
                    <Text style={styles.title}>Sua sessão expirou</Text>
                    <Text style={styles.message}>Para validar a operação, por favor insira sua senha novamente.</Text>
                    
                    <TextInput
                        style={styles.input}
                        value={password}
                        onChangeText={setPassword}
                        placeholder="Insira sua senha"
                        placeholderTextColor={colors.textLight}
                        secureTextEntry
                        autoFocus
                    />

                    <View style={styles.buttonRow}>
                        <AnimatedButton style={[styles.button, styles.cancelButton]} onPress={onCancel} disabled={loading}>
                            <Text style={styles.cancelButtonText}>Cancelar</Text>
                        </AnimatedButton>
                        <AnimatedButton style={[styles.button, styles.confirmButton]} onPress={handleConfirm} disabled={loading}>
                            {loading ? <ActivityIndicator color={colors.white} /> : <Text style={styles.confirmButtonText}>Confirmar</Text>}
                        </AnimatedButton>
                    </View>
                </View>
            </Pressable>
        </Modal>
    );
};

const getStyles = (colors) => StyleSheet.create({
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
        backgroundColor: colors.cardBackground,
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
        color: colors.text,
        marginBottom: 10,
    },
    message: {
        fontSize: 16,
        color: colors.textLight,
        textAlign: 'center',
        marginBottom: 25,
    },
    input: {
        width: '100%',
        padding: 12,
        fontSize: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.border,
        marginBottom: 25,
        backgroundColor: colors.inputBackground,
        color: colors.text,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        gap: 10,
    },
    button: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: SIZES.radius,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: colors.buttonSecondaryBackground,
    },
    cancelButtonText: {
        color: colors.text,
        fontSize: 16,
        fontWeight: '500',
    },
    confirmButton: {
        backgroundColor: colors.primary,
    },
    confirmButtonText: {
        color: colors.white,
        fontSize: 16,
        fontWeight: '500',
    },
});

export default ReAuthModal;