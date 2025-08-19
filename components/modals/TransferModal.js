// components/modals/TransferModal.js
import React, { useState, useEffect } from 'react';
import { View, Text, Modal, StyleSheet, TextInput, TouchableOpacity, Keyboard } from 'react-native';
import { COLORS, SIZES } from '../../constants/theme';
import DropDownPicker from 'react-native-dropdown-picker';
import { Ionicons } from '@expo/vector-icons';

const TransferModal = ({ visible, onClose, onConfirm, itemDetails, warehouses = [], permissions = {} }) => {
    const [quantity, setQuantity] = useState('');
    const [destinationAddress, setDestinationAddress] = useState('');
    const [isMarkedAsPicking, setMarkedAsPicking] = useState(false);

    const [open, setOpen] = useState(false);
    const [warehouseValue, setWarehouseValue] = useState(null);
    const [warehouseItems, setWarehouseItems] = useState([]);

    useEffect(() => {
        if (visible) {
            setQuantity(String(itemDetails?.quantidade || ''));
            setDestinationAddress('');
            setMarkedAsPicking(false);
            setWarehouseValue(null);

            const formattedWarehouses = warehouses.map(([cod, desc]) => ({
                label: desc,
                value: cod
            }));
            setWarehouseItems(formattedWarehouses);
        }
    }, [visible, itemDetails, warehouses]);

    const handleConfirm = () => {
        const numQuantity = parseInt(quantity, 10);
        if (isNaN(numQuantity) || numQuantity <= 0) {
            return alert('Por favor, insira uma quantidade válida.');
        }
        if (!warehouseValue) {
            return alert('Por favor, selecione um armazém de destino.');
        }
        if (!destinationAddress.trim()) {
            return alert('Por favor, insira um endereço de destino.');
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
        >
            <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={Keyboard.dismiss}>
                <View style={styles.modalContent}>
                    <Text style={styles.title}>Transferir Produto</Text>
                    <Text style={styles.infoText}>
                        Disponível: <Text style={{ fontWeight: 'bold' }}>{itemDetails.qtdCompleta}</Text>
                    </Text>

                    <Text style={styles.label}>Quantidade a transferir:</Text>
                    <TextInput style={styles.input} value={quantity} onChangeText={setQuantity} keyboardType="numeric" />

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
                        dropDownContainerStyle={[styles.dropdownList, { backgroundColor: COLORS.cardBackground }]}
                        textStyle={{ color: COLORS.text }}
                        listItemLabelStyle={{ color: COLORS.text }}
                        zIndex={3000}
                        zIndexInverse={1000}
                    />

                    <Text style={styles.label}>Endereço de Destino:</Text>
                    <TextInput style={styles.input} value={destinationAddress} onChangeText={setDestinationAddress} keyboardType="numeric" placeholder="Digite o endereço" placeholderTextColor={COLORS.textLight} />

                    {permissions.criaPick && (
                        <TouchableOpacity style={styles.checkboxContainer} onPress={() => setMarkedAsPicking(!isMarkedAsPicking)}>
                            <Ionicons name={isMarkedAsPicking ? 'checkbox' : 'square-outline'} size={24} color={COLORS.primary} />
                            <Text style={styles.checkboxLabel}>Marcar destino como Picking</Text>
                        </TouchableOpacity>
                    )}

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
    title: { fontSize: 20, fontWeight: 'bold', color: COLORS.text, marginBottom: 10, },
    infoText: { fontSize: 16, color: COLORS.textLight, marginBottom: 20, },
    label: { fontSize: 14, color: COLORS.textLight, marginBottom: 5, },
    input: { // <-- ALTERAÇÕES AQUI
        width: '100%', 
        padding: 12, 
        fontSize: 16, 
        borderRadius: SIZES.radius, 
        borderWidth: 1, 
        borderColor: COLORS.border, 
        marginBottom: 15,
        backgroundColor: COLORS.inputBackground,
        color: COLORS.text,
    },
    dropdownContainer: { marginBottom: 15 },
    dropdownPicker: { // <-- ALTERAÇÕES AQUI
        borderColor: COLORS.border,
        backgroundColor: COLORS.inputBackground,
    },
    dropdownList: { borderColor: COLORS.border },
    checkboxContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 25, gap: 10 },
    checkboxLabel: { fontSize: 16, color: COLORS.text },
    buttonRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10 },
    button: { paddingVertical: 12, paddingHorizontal: 25, borderRadius: SIZES.radius, },
    cancelButton: { // <-- ALTERAÇÕES AQUI
        backgroundColor: COLORS.buttonSecondaryBackground, 
    },
    cancelButtonText: { color: COLORS.text, fontSize: 16, fontWeight: '500', },
    confirmButton: { backgroundColor: COLORS.primary, },
    confirmButtonText: { color: COLORS.white, fontSize: 16, fontWeight: '500', },
});

export default TransferModal;