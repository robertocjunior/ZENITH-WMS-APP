// components/modals/BaixaModal.js
import React, { useState, useEffect } from 'react';
import { View, Text, Modal, StyleSheet, TextInput, Keyboard, Pressable } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { SIZES } from '../../constants/theme';
import AnimatedButton from '../common/AnimatedButton';

// ALTERADO: Adiciona a nova prop onValidationError
const BaixaModal = ({ visible, onClose, onConfirm, itemDetails, onValidationError }) => {
    const { colors } = useTheme();
    const styles = getStyles(colors);
    const [quantity, setQuantity] = useState('');

    const isKgProduct = itemDetails?.qtdCompleta?.toUpperCase().includes('KG');
    const keyboardType = isKgProduct ? 'numeric' : 'number-pad';

    useEffect(() => {
        if (visible && itemDetails) {
            setQuantity(String(itemDetails.quantidade || ''));
        }
    }, [visible, itemDetails]);

    const handleConfirm = () => {
        if (!isKgProduct && (String(quantity).includes(',') || String(quantity).includes('.'))) {
            // ALTERADO: Usa a nova função de erro em vez do alert
            onValidationError('Este produto não aceita casas decimais. Por favor, insira um número inteiro.');
            return;
        }

        const numQuantity = isKgProduct
            ? parseFloat(String(quantity).replace(',', '.'))
            : parseInt(String(quantity), 10);
            
        if (isNaN(numQuantity) || numQuantity <= 0) {
            // ALTERADO: Usa a nova função de erro em vez do alert
            onValidationError('Por favor, insira uma quantidade válida.');
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
                    <Text style={styles.title}>Dar Baixa no Produto</Text>
                    <Text style={styles.infoText}>
                        Disponível: <Text style={{ fontWeight: 'bold' }}>{itemDetails.qtdCompleta}</Text>
                    </Text>

                    <Text style={styles.label}>Quantidade a baixar:</Text>
                    <TextInput
                        style={styles.input}
                        value={quantity}
                        onChangeText={setQuantity}
                        keyboardType={keyboardType}
                        placeholder="Digite a quantidade"
                        placeholderTextColor={colors.textLight}
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

// ... (o restante do arquivo getStyles permanece o mesmo)
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

export default BaixaModal;