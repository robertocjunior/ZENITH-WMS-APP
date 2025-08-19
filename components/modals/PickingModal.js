// components/modals/PickingModal.js
import React, { useState, useEffect } from 'react';
import { View, Text, Modal, StyleSheet, TextInput, TouchableOpacity, Keyboard } from 'react-native';
import { COLORS, SIZES } from '../../constants/theme';
import DropDownPicker from 'react-native-dropdown-picker';
import * as api from '../../api';

const PickingModal = ({ visible, onClose, onConfirm, itemDetails }) => {
    const [quantity, setQuantity] = useState('');
    
    const [open, setOpen] = useState(false);
    const [destinationValue, setDestinationValue] = useState(null);
    const [destinationItems, setDestinationItems] = useState([]);
    const [isLoadingLocations, setIsLoadingLocations] = useState(false);

    useEffect(() => {
        const fetchLocations = async () => {
            if (visible && itemDetails) {
                setIsLoadingLocations(true);
                setDestinationItems([]);
                try {
                    const { codarm, codprod, sequencia } = itemDetails;
                    const locations = await api.fetchPickingLocations(Number(codarm), Number(codprod), Number(sequencia));
                    
                    const formattedLocations = locations.map(([seqEnd, descrProd]) => ({
                        label: `${seqEnd} - ${descrProd}`,
                        value: seqEnd
                    }));
                    setDestinationItems(formattedLocations);

                } catch (error) {
                    console.error("Erro ao buscar locais de picking:", error);
                    alert("Não foi possível carregar os destinos de picking.");
                } finally {
                    setIsLoadingLocations(false);
                }
            }
        };

        fetchLocations();
    }, [visible, itemDetails]);

    useEffect(() => {
        if (visible && itemDetails) {
            setQuantity(String(itemDetails.quantidade || ''));
            setDestinationValue(null);
        }
    }, [visible, itemDetails]);

    const handleConfirm = () => {
        const numQuantity = parseInt(quantity, 10);
        if (isNaN(numQuantity) || numQuantity <= 0) {
            return alert('Por favor, insira uma quantidade válida.');
        }
        if (!destinationValue) {
            return alert('Por favor, selecione um destino de picking.');
        }
        
        onConfirm({
            quantity: numQuantity,
            destinationSequence: destinationValue
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
                    <Text style={styles.title}>Mover para Picking</Text>
                    <Text style={styles.infoText}>
                        Disponível: <Text style={{ fontWeight: 'bold' }}>{itemDetails.qtdCompleta}</Text>
                    </Text>

                    <Text style={styles.label}>Quantidade a mover:</Text>
                    <TextInput style={styles.input} value={quantity} onChangeText={setQuantity} keyboardType="number-pad"/>

                    <Text style={styles.label}>Destino de Picking:</Text>
                    <DropDownPicker
                        open={open}
                        value={destinationValue}
                        items={destinationItems}
                        setOpen={setOpen}
                        setValue={setDestinationValue}
                        setItems={setDestinationItems}
                        placeholder="Selecione um destino"
                        loading={isLoadingLocations}
                        disabled={isLoadingLocations}
                        style={styles.dropdownPicker}
                        containerStyle={styles.dropdownContainer}
                        dropDownContainerStyle={[styles.dropdownList, { backgroundColor: COLORS.cardBackground }]}
                        textStyle={{ color: COLORS.text }}
                        listItemLabelStyle={{ color: COLORS.text }}
                        zIndex={3000}
                        zIndexInverse={1000}
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
    dropdownContainer: { marginBottom: 25 },
    dropdownPicker: { // <-- ALTERAÇÕES AQUI
        borderColor: COLORS.border,
        backgroundColor: COLORS.inputBackground
    },
    dropdownList: { borderColor: COLORS.border },
    buttonRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10 },
    button: { paddingVertical: 12, paddingHorizontal: 25, borderRadius: SIZES.radius, },
    cancelButton: { // <-- ALTERAÇÕES AQUI
        backgroundColor: COLORS.buttonSecondaryBackground, 
    },
    cancelButtonText: { color: COLORS.text, fontSize: 16, fontWeight: '500', },
    confirmButton: { backgroundColor: COLORS.primary, },
    confirmButtonText: { color: COLORS.white, fontSize: 16, fontWeight: '500', },
});

export default PickingModal;