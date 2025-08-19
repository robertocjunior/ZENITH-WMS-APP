
// components/modals/SettingsModal.js
import React, { useState, useEffect } from 'react';
import { View, Text, Modal, StyleSheet, TextInput, TouchableOpacity, Keyboard, Alert } from 'react-native';
import { COLORS, SIZES } from '../../constants/theme';

const SettingsModal = ({ visible, onClose, onSave, currentApiUrl }) => {
    const [apiUrl, setApiUrl] = useState('');

    useEffect(() => {
        // Preenche o campo com a URL atual quando o modal abre
        if (visible) {
            setApiUrl(currentApiUrl);
        }
    }, [visible, currentApiUrl]);

    const handleSave = () => {
        if (!apiUrl || !apiUrl.startsWith('http')) {
            Alert.alert("Erro", "Por favor, insira um endereço de servidor válido (ex: http://192.168.1.10:3030).");
            return;
        }
        // Remove a /api do final se o usuário digitar, para padronizar
        const cleanedUrl = apiUrl.endsWith('/api') ? apiUrl.slice(0, -4) : apiUrl;
        onSave(cleanedUrl);
    };

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={Keyboard.dismiss}>
                <View style={styles.modalContent}>
                    <Text style={styles.title}>Configurações do Servidor</Text>
                    <Text style={styles.label}>Endereço da API do Backend:</Text>
                    <TextInput
                        style={styles.input}
                        value={apiUrl}
                        onChangeText={setApiUrl}
                        placeholder="http://192.168.1.10:3030"
                        autoCapitalize="none"
                        keyboardType="url"
                        autoFocus={true}
                    />

                    <View style={styles.buttonRow}>
                        <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onClose}>
                            <Text style={styles.cancelButtonText}>Cancelar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.button, styles.confirmButton]} onPress={handleSave}>
                            <Text style={styles.confirmButtonText}>Salvar</Text>
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
    title: { fontSize: 20, fontWeight: 'bold', color: COLORS.text, marginBottom: 20, },
    label: { fontSize: 14, color: COLORS.textLight, marginBottom: 5, },
    input: { width: '100%', padding: 12, fontSize: 16, borderRadius: SIZES.radius, borderWidth: 1, borderColor: COLORS.border, marginBottom: 25, },
    buttonRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10 },
    button: { paddingVertical: 12, paddingHorizontal: 25, borderRadius: SIZES.radius, },
    cancelButton: { backgroundColor: '#f0f2f5', },
    cancelButtonText: { color: COLORS.text, fontSize: 16, fontWeight: '500', },
    confirmButton: { backgroundColor: COLORS.primary, },
    confirmButtonText: { color: COLORS.white, fontSize: 16, fontWeight: '500', },
});

export default SettingsModal;