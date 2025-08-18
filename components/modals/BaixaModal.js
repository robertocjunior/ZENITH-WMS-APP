// components/modals/BaixaModal.js
import React, { useState, useEffect } from 'react';
import { View, Text, Modal, StyleSheet, TextInput, TouchableOpacity, Keyboard } from 'react-native';
import { COLORS, SIZES } from '../../constants/theme';

const BaixaModal = ({ visible, onClose, onConfirm, itemDetails }) => {
    const [quantity, setQuantity] = useState('');

    useEffect(() => {
        // Preenche a quantidade total quando o modal se torna visível
        if (visible && itemDetails) {
            setQuantity(String(itemDetails.quantidade || ''));
        }
    }, [visible, itemDetails]);

    const handleConfirm = () => {
        const numQuantity = parseInt(quantity, 10);
        if (isNaN(numQuantity) || numQuantity <= 0) {
            alert('Por favor, insira uma quantidade válida.');
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
        >
            <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={Keyboard.dismiss}>
                <View style={styles.modalContent}>
                    <Text style={styles.title}>Dar Baixa no Produto</Text>
                    <Text style={styles.infoText}>
                        Disponível: <Text style={{ fontWeight: 'bold' }}>{itemDetails.qtdCompleta}</Text>
                    </Text>

                    <Text style={styles.label}>Quantidade a baixar:</Text>
                    <TextInput
                        style={styles.input}
                        value={quantity}
                        onChangeText={setQuantity}
                        keyboardType="numeric"
                        placeholder="Digite a quantidade"
                        autoFocus={true}
                    />

                    <View style={styles.buttonRow}>
                        <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onClose}>
                            <Text style={styles.cancelButtonText}>Cancelar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.button, styles.confirmButton]} onPress={handleConfirm}>
                            <Text style={styles.confirmButtonText}>Confirmar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </TouchableOpacity>
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
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 10,
    },
    infoText: {
        fontSize: 16,
        color: COLORS.textLight,
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        color: COLORS.textLight,
        marginBottom: 5,
    },
    input: {
        width: '100%',
        padding: 12,
        fontSize: 16,
        borderRadius: SIZES.radius,
        borderWidth: 1,
        borderColor: COLORS.border,
        marginBottom: 25,
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
        backgroundColor: '#f0f2f5',
    },
    cancelButtonText: {
        color: COLORS.text,
        fontSize: 16,
        fontWeight: '500',
    },
    confirmButton: {
        backgroundColor: COLORS.primary,
    },
    confirmButtonText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: '500',
    },
});

export default BaixaModal;