// components/modals/TransferModal.js
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Modal, StyleSheet, TextInput, Keyboard, Pressable, Animated, Platform } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { SIZES } from '../../constants/theme';
import DropDownPicker from 'react-native-dropdown-picker';
import { Ionicons } from '@expo/vector-icons';
import AnimatedButton from '../common/AnimatedButton';

const TransferModal = ({ visible, onClose, onConfirm, itemDetails, warehouses = [], permissions = {}, onValidationError }) => {
    const { colors } = useTheme();
    const styles = getStyles(colors);
    const [quantity, setQuantity] = useState('');
    const [destinationAddress, setDestinationAddress] = useState('');
    const [isMarkedAsPicking, setMarkedAsPicking] = useState(false);

    const [open, setOpen] = useState(false);
    const [warehouseValue, setWarehouseValue] = useState(null);
    const [warehouseItems, setWarehouseItems] = useState([]);

    const keyboardOffset = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const handleKeyboardShow = () => {
            Animated.timing(keyboardOffset, {
                toValue: -120, // Sobe um pouco mais pois esse modal é maior
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
        if (visible) {
            setQuantity(String(itemDetails?.quantidade || ''));
            setDestinationAddress('');
            setMarkedAsPicking(false);
            setWarehouseValue(null);

            const formattedWarehouses = warehouses.map(wh => ({
                label: wh.nome,
                value: wh.codarm
            }));
            setWarehouseItems(formattedWarehouses);
        }
    }, [visible, itemDetails, warehouses]);

    const handleConfirm = () => {
        if (!isKgProduct && (String(quantity).includes(',') || String(quantity).includes('.'))) {
            onValidationError('Este produto não aceita casas decimais.');
            return;
        }

        const numQuantity = isKgProduct
            ? parseFloat(String(quantity).replace(',', '.'))
            : parseInt(String(quantity), 10);
            
        if (isNaN(numQuantity) || numQuantity <= 0) {
            onValidationError('Por favor, insira uma quantidade válida.');
            return;
        }
        if (!warehouseValue) {
            onValidationError('Por favor, selecione um armazém de destino.');
            return;
        }
        if (!destinationAddress.trim()) {
            onValidationError('Por favor, insira um endereço de destino.');
            return;
        }

        onConfirm({
            quantity: numQuantity,
            destinationWarehouse: warehouseValue,
            destinationAddress: destinationAddress.trim(),
            isMarkedAsPicking
        });
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
                <Animated.View style={[styles.modalContent, { transform: [{ translateY: keyboardOffset }] }]}>
                    <Text style={styles.title}>Transferir Produto</Text>
                    <Text style={styles.infoText}>
                        Disponível: <Text style={{ fontWeight: 'bold' }}>{itemDetails.qtdCompleta}</Text>
                    </Text>

                    <Text style={styles.label}>Quantidade a transferir:</Text>
                    <TextInput style={styles.input} value={quantity} onChangeText={setQuantity} keyboardType={keyboardType} />

                    <Text style={styles.label}>Armazém de Destino:</Text>
                    <DropDownPicker
                        open={open}
                        value={warehouseValue}
                        items={warehouseItems}
                        setOpen={setOpen}
                        setValue={setWarehouseValue}
                        setItems={setWarehouseItems}
                        placeholder="Selecione um Armazém"
                        style={styles.dropdownPicker}
                        containerStyle={styles.dropdownContainer}
                        dropDownContainerStyle={[styles.dropdownList, { backgroundColor: colors.cardBackground }]}
                        textStyle={{ color: colors.text }}
                        listItemLabelStyle={{ color: colors.text }}
                        zIndex={3000}
                        zIndexInverse={1000}
                        theme={colors.background === '#121212' ? "DARK" : "LIGHT"}
                    />

                    <Text style={styles.label}>Endereço de Destino:</Text>
                    <TextInput style={styles.input} value={destinationAddress} onChangeText={setDestinationAddress} keyboardType="default" placeholder="Digite o endereço" placeholderTextColor={colors.textLight} />

                    {permissions.CRIAPICK && (
                        <AnimatedButton style={styles.checkboxContainer} onPress={() => setMarkedAsPicking(!isMarkedAsPicking)}>
                            <Ionicons name={isMarkedAsPicking ? 'checkbox' : 'square-outline'} size={24} color={colors.primary} />
                            <Text style={styles.checkboxLabel}>Marcar destino como Picking</Text>
                        </AnimatedButton>
                    )}

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
    },
    title: { fontSize: 20, fontWeight: 'bold', color: colors.text, marginBottom: 10, },
    infoText: { fontSize: 16, color: colors.textLight, marginBottom: 20, },
    label: { fontSize: 14, color: colors.textLight, marginBottom: 5, },
    input: {
        width: '100%', 
        padding: 12, 
        fontSize: 16, 
        borderRadius: SIZES.radius, 
        borderWidth: 1, 
        borderColor: colors.border, 
        marginBottom: 15,
        backgroundColor: colors.inputBackground,
        color: colors.text,
    },
    dropdownContainer: { marginBottom: 15 },
    dropdownPicker: {
        borderColor: colors.border,
        backgroundColor: colors.inputBackground,
    },
    dropdownList: { borderColor: colors.border },
    checkboxContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 25, gap: 10, alignSelf: 'flex-start'},
    checkboxLabel: { fontSize: 16, color: colors.text },
    buttonRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10 },
    button: { paddingVertical: 12, paddingHorizontal: 25, borderRadius: SIZES.radius, },
    cancelButton: { backgroundColor: colors.buttonSecondaryBackground },
    cancelButtonText: { color: colors.text, fontSize: 16, fontWeight: '500', },
    confirmButton: { backgroundColor: colors.info }, // Azul para Transferência
    confirmButtonText: { color: colors.white, fontSize: 16, fontWeight: '500', },
});

export default TransferModal;