// components/modals/PickingModal.js
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Modal, StyleSheet, TextInput, Keyboard, Pressable, Animated, Platform } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { SIZES } from '../../constants/theme';
import DropDownPicker from 'react-native-dropdown-picker';
import * as api from '../../api';
import AnimatedButton from '../common/AnimatedButton';

const PickingModal = ({ visible, onClose, onConfirm, itemDetails, onValidationError, preloadedLocations }) => {
    const { colors } = useTheme();
    const styles = getStyles(colors);
    const [quantity, setQuantity] = useState('');
    
    const [open, setOpen] = useState(false);
    const [destinationValue, setDestinationValue] = useState(null);
    const [destinationItems, setDestinationItems] = useState([]);
    const [isLoadingLocations, setIsLoadingLocations] = useState(false);

    const keyboardOffset = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const handleKeyboardShow = () => {
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

    // ... (fetchLocations useEffect mantido igual ao anterior) ...
    useEffect(() => {
        const fetchLocations = async () => {
            if (visible && itemDetails) {
                if (preloadedLocations && preloadedLocations.length > 0) {
                    setDestinationItems(preloadedLocations);
                    return;
                }

                setIsLoadingLocations(true);
                setDestinationItems([]);
                try {
                    const { codarm, codprod, sequencia } = itemDetails;
                    const locationsMap = await api.fetchPickingLocations(Number(codarm), Number(codprod), Number(sequencia));
                    const locationsArray = locationsMap ? Object.values(locationsMap) : [];
                    const formattedLocations = locationsArray.map((loc) => ({
                        label: `${loc.seqEnd} - ${loc.descrProd}`,
                        value: loc.seqEnd
                    }));
                    setDestinationItems(formattedLocations);
                } catch (error) {
                    console.error("Erro picking:", error);
                    if(onValidationError) onValidationError("Erro ao carregar destinos.");
                } finally {
                    setIsLoadingLocations(false);
                }
            }
        };
        fetchLocations();
    }, [visible, itemDetails, preloadedLocations]);

    // CORREÇÃO: Auto-preenchimento
    useEffect(() => {
        if (visible && itemDetails) {
            setQuantity(itemDetails?.quantidade !== undefined ? String(itemDetails.quantidade) : '');
            setDestinationValue(null);
        }
    }, [visible, itemDetails]);

    const handleConfirm = () => {
        if (!isKgProduct && (String(quantity).includes(',') || String(quantity).includes('.'))) {
            onValidationError('Este produto não aceita casas decimais.');
            return;
        }

        const numQuantity = isKgProduct
            ? parseFloat(String(quantity).replace(',', '.'))
            : parseInt(String(quantity), 10);
        
        const maxQuantity = itemDetails?.quantidade || 0;

        if (isNaN(numQuantity) || numQuantity <= 0) {
            onValidationError('Quantidade inválida.');
            return;
        }

        // CORREÇÃO: Validação de Máximo
        if (numQuantity > maxQuantity) {
            onValidationError(`Quantidade excede o disponível que é: ${maxQuantity}.`);
            return;
        }

        if (!destinationValue) {
            onValidationError('Selecione um destino de picking.');
            return;
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
                <Animated.View style={[styles.modalContent, { transform: [{ translateY: keyboardOffset }] }]}>
                    <Text style={styles.title}>Mover para Picking</Text>
                    <Text style={styles.infoText}>
                        Disponível: <Text style={{ fontWeight: 'bold' }}>{itemDetails.qtdCompleta}</Text>
                    </Text>

                    <Text style={styles.label}>Quantidade a mover:</Text>
                    <TextInput style={styles.input} value={quantity} onChangeText={setQuantity} keyboardType={keyboardType}/>

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
    dropdownContainer: { marginBottom: 25 },
    dropdownPicker: {
        borderColor: colors.border,
        backgroundColor: colors.inputBackground
    },
    dropdownList: { borderColor: colors.border },
    buttonRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10 },
    button: { paddingVertical: 12, paddingHorizontal: 25, borderRadius: SIZES.radius, },
    cancelButton: { backgroundColor: colors.buttonSecondaryBackground },
    cancelButtonText: { color: colors.text, fontSize: 16, fontWeight: '500', },
    confirmButton: { backgroundColor: colors.orange }, 
    confirmButtonText: { color: colors.white, fontSize: 16, fontWeight: '500', },
});

export default PickingModal;