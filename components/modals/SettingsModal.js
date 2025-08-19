// components/modals/SettingsModal.js
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Modal, StyleSheet, TextInput, Keyboard, Alert, Animated, Platform, Pressable } from 'react-native';
import { COLORS, SIZES } from '../../constants/theme';
import AnimatedButton from '../common/AnimatedButton';

const SettingsModal = ({ visible, onClose, onSave, currentApiUrl }) => {
    const [apiUrl, setApiUrl] = useState('');
    
    const [isModalVisible, setIsModalVisible] = useState(visible);
    const modalOpacity = useRef(new Animated.Value(0)).current;
    const modalScale = useRef(new Animated.Value(0.9)).current;

    // 1. Adicionar a mesma lógica de animação do teclado da tela de login
    const keyboardHeightAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener(
            'keyboardDidShow',
            (e) => {
                Animated.timing(keyboardHeightAnim, {
                    toValue: e.endCoordinates.height,
                    duration: 250,
                    useNativeDriver: false,
                }).start();
            }
        );
        const keyboardDidHideListener = Keyboard.addListener(
            'keyboardDidHide',
            () => {
                Animated.timing(keyboardHeightAnim, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: false,
                }).start();
            }
        );

        return () => {
            keyboardDidHideListener.remove();
            keyboardDidShowListener.remove();
        };
    }, []);


    useEffect(() => {
        if (visible) {
            setIsModalVisible(true);
            setApiUrl(currentApiUrl);
            Animated.parallel([
                Animated.timing(modalOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
                Animated.spring(modalScale, { toValue: 1, friction: 6, useNativeDriver: true })
            ]).start();
        } else {
            Animated.parallel([
                 Animated.timing(modalOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
                 Animated.timing(modalScale, { toValue: 0.9, duration: 200, useNativeDriver: true })
            ]).start(() => {
                setIsModalVisible(false);
            });
        }
    }, [visible, currentApiUrl]);

    const handleSave = () => {
        if (!apiUrl || !apiUrl.startsWith('http')) {
            Alert.alert("Erro", "Por favor, insira um endereço de servidor válido (ex: http://192.168.1.10:3030).");
            return;
        }
        const cleanedUrl = apiUrl.endsWith('/api') ? apiUrl.slice(0, -4) : apiUrl;
        onSave(cleanedUrl);
        onClose();
    };

    const handleClose = () => {
        Keyboard.dismiss();
        onClose();
    };
    
    return (
        <Modal
            animationType="none"
            transparent={true}
            visible={isModalVisible}
            onRequestClose={handleClose}
            statusBarTranslucent={true}
        >
            <Animated.View style={[styles.overlay, { opacity: modalOpacity }]}>
                <Pressable style={styles.pressableOverlay} onPress={handleClose}>
                     {/* 2. Aplicar o paddingBottom animado a este container */}
                    <Animated.View style={[styles.centeringContainer, { paddingBottom: keyboardHeightAnim }]}>
                        <Animated.View style={[styles.modalContent, { transform: [{ scale: modalScale }] }]}>
                            {/* Adicionado um Pressable para o conteúdo não fechar ao ser tocado */}
                            <Pressable onPress={(e) => e.stopPropagation()}>
                                <Text style={styles.title}>Configurações do Servidor</Text>
                                <Text style={styles.label}>Endereço da API do Backend:</Text>
                                <TextInput
                                    style={styles.input}
                                    value={apiUrl}
                                    onChangeText={setApiUrl}
                                    placeholder="http://192.168.1.10:3030"
                                    placeholderTextColor={COLORS.textLight}
                                    autoCapitalize="none"
                                    keyboardType="url"
                                    autoFocus={true}
                                />
                                <View style={styles.buttonRow}>
                                    <AnimatedButton style={[styles.button, styles.cancelButton]} onPress={handleClose}>
                                        <Text style={styles.cancelButtonText}>Cancelar</Text>
                                    </AnimatedButton>
                                    <AnimatedButton style={[styles.button, styles.confirmButton]} onPress={handleSave}>
                                        <Text style={styles.confirmButtonText}>Salvar</Text>
                                    </AnimatedButton>
                                </View>
                            </Pressable>
                        </Animated.View>
                    </Animated.View>
                </Pressable>
            </Animated.View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
    },
    pressableOverlay: {
        flex: 1,
        width: '100%',
    },
    // Container que será animado para cima
    centeringContainer: {
        flex: 1,
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
    title: { fontSize: 20, fontWeight: 'bold', color: COLORS.text, marginBottom: 20, },
    label: { fontSize: 14, color: COLORS.textLight, marginBottom: 5, },
    input: {
        width: '100%', 
        padding: 12, 
        fontSize: 16, 
        borderRadius: SIZES.radius, 
        borderWidth: 1, 
        borderColor: COLORS.border, 
        marginBottom: 25,
        backgroundColor: COLORS.inputBackground,
        color: COLORS.text,
    },
    buttonRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10 },
    button: { paddingVertical: 12, paddingHorizontal: 25, borderRadius: SIZES.radius, },
    cancelButton: {
        backgroundColor: COLORS.buttonSecondaryBackground, 
    },
    cancelButtonText: { color: COLORS.text, fontSize: 16, fontWeight: '500', },
    confirmButton: { backgroundColor: COLORS.primary, },
    confirmButtonText: { color: COLORS.white, fontSize: 16, fontWeight: '500', },
});

export default SettingsModal;