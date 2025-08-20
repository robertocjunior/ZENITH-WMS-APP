// components/modals/PickingModal.js
import React, { useState, useEffect } from 'react';
import { View, Text, Modal, StyleSheet, TextInput, Keyboard, Pressable } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { SIZES } from '../../constants/theme';
import DropDownPicker from 'react-native-dropdown-picker';
import * as api from '../../api';
import AnimatedButton from '../common/AnimatedButton';

const PickingModal = ({ visible, onClose, onConfirm, itemDetails }) => {
    const { colors } = useTheme();
    const styles = getStyles(colors);
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
            statusBarTranslucent={true}
        >
            <Pressable style={styles.overlay} onPress={Keyboard.dismiss}>
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
                        dropDownContainerStyle={[styles.dropdownList, { backgroundColor: colors.cardBackground }]}
                        textStyle={{ color: colors.text }}
                        listItemLabelStyle={{ color: colors.text }}
                        zIndex={3000}
                        zIndexInverse={1000}
                        theme={colors.background === '#121212' ? "DARK" : "LIGHT"}
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
    dropdownContainer: { marginBottom: 25 },
    dropdownPicker: {
        borderColor: colors.border,
        backgroundColor: colors.inputBackground
    },
    dropdownList: { borderColor: colors.border },
    buttonRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10 },
    button: { paddingVertical: 12, paddingHorizontal: 25, borderRadius: SIZES.radius, },
    cancelButton: {
        backgroundColor: colors.buttonSecondaryBackground, 
    },
    cancelButtonText: { color: colors.text, fontSize: 16, fontWeight: '500', },
    confirmButton: { backgroundColor: colors.primary, },
    confirmButtonText: { color: colors.white, fontSize: 16, fontWeight: '500', },
});

export default PickingModal;