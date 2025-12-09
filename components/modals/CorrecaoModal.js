// components/modals/CorrecaoModal.js
import React, { useState, useEffect } from 'react';
import { View, Text, Modal, StyleSheet, TextInput, Keyboard, Pressable } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { SIZES } from '../../constants/theme';
import AnimatedButton from '../common/AnimatedButton';

// ADICIONADO: onValidationError
const CorrecaoModal = ({ visible, onClose, onConfirm, itemDetails, onValidationError }) => {
    const { colors } = useTheme();
    const styles = getStyles(colors);
    const [newQuantity, setNewQuantity] = useState('');

    useEffect(() => {
        if (visible) {
            setNewQuantity('');
        }
    }, [visible]);

    const handleConfirm = () => {
        const numQuantity = parseFloat(newQuantity.replace(',', '.'));
        if (isNaN(numQuantity) || numQuantity < 0) {
            // CORREÇÃO: Usa modal de erro
            if(onValidationError) {
                onValidationError('Por favor, insira uma nova quantidade válida.');
            } else {
                alert('Por favor, insira uma nova quantidade válida.');
            }
            return;
        }
        onConfirm(numQuantity);
    };

    if (!itemDetails) return null;

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
            statusBarTranslucent={true}
        >
            <Pressable style={styles.overlay} onPress={Keyboard.dismiss}>
                <View style={styles.modalContent}>
                    <Text style={styles.title}>Corrigir Quantidade</Text>
                    <Text style={styles.infoText}>
                        Quantidade Atual: <Text style={{ fontWeight: 'bold' }}>{itemDetails.qtdCompleta}</Text>
                    </Text>

                    <Text style={styles.label}>Nova Quantidade:</Text>
                    <TextInput
                        style={styles.input}
                        value={newQuantity}
                        onChangeText={setNewQuantity}
                        placeholder="0"
                        placeholderTextColor={colors.textLight}
                        keyboardType="numeric"
                        autoFocus={true}
                    />

                    <View style={styles.buttonRow}>
                        <AnimatedButton style={[styles.button, styles.cancelButton]} onPress={onClose}>
                            <Text style={styles.cancelButtonText}>Cancelar</Text>
                        </AnimatedButton>
                        <AnimatedButton style={[styles.button, styles.confirmButton]} onPress={handleConfirm}>
                            <Text style={styles.confirmButtonText}>Confirmar</Text>
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
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 10,
    },
    infoText: {
        fontSize: 16,
        color: colors.textLight,
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        color: colors.textLight,
        marginBottom: 5,
    },
    input: {
        width: '100%',
        padding: 12,
        fontSize: 16,
        borderRadius: SIZES.radius,
        borderWidth: 1,
        borderColor: colors.border,
        marginBottom: 25,
        backgroundColor: colors.inputBackground,
        color: colors.text,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 10,
    },
    button: {
        paddingVertical: 12,
        paddingHorizontal: 25,
        borderRadius: SIZES.radius,
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

export default CorrecaoModal;