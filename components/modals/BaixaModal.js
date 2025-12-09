// components/modals/BaixaModal.js
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Modal, StyleSheet, TextInput, Keyboard, Pressable, Animated, Platform } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { SIZES } from '../../constants/theme';
import AnimatedButton from '../common/AnimatedButton';

const BaixaModal = ({ visible, onClose, onConfirm, itemDetails, onValidationError }) => {
    const { colors } = useTheme();
    const styles = getStyles(colors);
    const [quantity, setQuantity] = useState('');
    
    // Configuração da Animação do Teclado
    const keyboardOffset = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const handleKeyboardShow = (event) => {
            // Sobe o modal. O valor negativo move para cima.
            // Ajuste -100 conforme necessário para telas menores
            Animated.timing(keyboardOffset, {
                toValue: -100, 
                duration: 250,
                useNativeDriver: true,
            }).start();
        };

        const handleKeyboardHide = () => {
            Animated.timing(keyboardOffset, {
                toValue: 0,
                duration: 250,
                useNativeDriver: true,
            }).start();
        };

        if (visible) {
            const showSub = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow', handleKeyboardShow);
            const hideSub = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide', handleKeyboardHide);
            return () => { showSub.remove(); hideSub.remove(); };
        }
    }, [visible]);

    const isKgProduct = itemDetails?.qtdCompleta?.toUpperCase().includes('KG');
    const keyboardType = isKgProduct ? 'numeric' : 'number-pad';

    useEffect(() => {
        if (visible) setQuantity('');
    }, [visible]);

    const handleConfirm = () => {
        if (!isKgProduct && (quantity.includes(',') || quantity.includes('.'))) {
            if(onValidationError) onValidationError('Este produto não aceita casas decimais.');
            return;
        }
        
        const numQuantity = parseFloat(quantity.replace(',', '.'));
        if (isNaN(numQuantity) || numQuantity <= 0) {
            if(onValidationError) onValidationError('Por favor, insira uma quantidade válida.');
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
                {/* Transformamos a View container em Animated.View */}
                <Animated.View style={[styles.modalContent, { transform: [{ translateY: keyboardOffset }] }]}>
                    <Text style={styles.title}>Baixa de Estoque</Text>
                    <Text style={styles.infoText}>
                        Quantidade Atual: <Text style={{ fontWeight: 'bold' }}>{itemDetails.qtdCompleta}</Text>
                    </Text>

                    <Text style={styles.label}>Quantidade a baixar:</Text>
                    <TextInput
                        style={styles.input}
                        value={quantity}
                        onChangeText={setQuantity}
                        placeholder="0"
                        placeholderTextColor={colors.textLight}
                        keyboardType={keyboardType}
                        autoFocus={false} // Evita pular o teclado instantaneamente ao abrir
                    />

                    <View style={styles.buttonRow}>
                        <AnimatedButton style={[styles.button, styles.cancelButton]} onPress={onClose}>
                            <Text style={styles.cancelButtonText}>Cancelar</Text>
                        </AnimatedButton>
                        <AnimatedButton style={[styles.button, styles.confirmButton]} onPress={handleConfirm}>
                            <Text style={styles.confirmButtonText}>Confirmar</Text>
                        </AnimatedButton>
                    </View>
                </Animated.View>
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
        // Importante para a sombra não cortar na animação
        elevation: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    title: { fontSize: 20, fontWeight: 'bold', color: colors.text, marginBottom: 10 },
    infoText: { fontSize: 16, color: colors.textLight, marginBottom: 20 },
    label: { fontSize: 14, color: colors.textLight, marginBottom: 5 },
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
    buttonRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10 },
    button: { paddingVertical: 12, paddingHorizontal: 25, borderRadius: SIZES.radius },
    cancelButton: { backgroundColor: colors.buttonSecondaryBackground },
    cancelButtonText: { color: colors.text, fontSize: 16, fontWeight: '500' },
    confirmButton: { backgroundColor: colors.success }, // Cor verde para baixa
    confirmButtonText: { color: colors.white, fontSize: 16, fontWeight: '500' },
});

export default BaixaModal;