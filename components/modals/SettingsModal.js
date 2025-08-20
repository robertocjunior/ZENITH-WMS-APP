// components/modals/SettingsModal.js
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Modal, StyleSheet, TextInput, Keyboard, Alert, Animated, Pressable } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { SIZES } from '../../constants/theme';
import AnimatedButton from '../common/AnimatedButton';

const SettingsModal = ({ visible, onClose, onSave, currentApiUrl }) => {
    const { colors, themePreference, changeTheme } = useTheme();
    const styles = getStyles(colors);

    const [apiUrl, setApiUrl] = useState('');
    const [isModalVisible, setIsModalVisible] = useState(visible);
    const modalOpacity = useRef(new Animated.Value(0)).current;
    const modalScale = useRef(new Animated.Value(0.9)).current;
    const keyboardHeightAnim = useRef(new Animated.Value(0)).current;

    const ThemeOptionButton = ({ label, onPress, isActive }) => {
        return (
            <AnimatedButton
                onPress={onPress}
                style={[
                    styles.themeButton,
                    { backgroundColor: isActive ? colors.primary : colors.buttonSecondaryBackground }
                ]}
            >
                <Text style={[
                    styles.themeButtonText,
                    { color: isActive ? colors.white : colors.text }
                ]}>
                    {label}
                </Text>
            </AnimatedButton>
        );
    };

    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener(
            'keyboardDidShow', (e) => {
                Animated.timing(keyboardHeightAnim, { toValue: e.endCoordinates.height, duration: 250, useNativeDriver: false }).start();
            }
        );
        const keyboardDidHideListener = Keyboard.addListener(
            'keyboardDidHide', () => {
                Animated.timing(keyboardHeightAnim, { toValue: 0, duration: 200, useNativeDriver: false }).start();
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
                    <Animated.View style={[styles.centeringContainer, { paddingBottom: keyboardHeightAnim }]}>
                        <Animated.View style={[styles.modalContent, { transform: [{ scale: modalScale }] }]}>
                            <Pressable onPress={(e) => e.stopPropagation()}>
                                <Text style={styles.title}>Configurações</Text>
                                
                                <Text style={styles.label}>Tema</Text>
                                <View style={styles.themeSelectorContainer}>
                                    <ThemeOptionButton label="Automático" onPress={() => changeTheme('automatic')} isActive={themePreference === 'automatic'} />
                                    <ThemeOptionButton label="Claro" onPress={() => changeTheme('light')} isActive={themePreference === 'light'} />
                                    <ThemeOptionButton label="Escuro" onPress={() => changeTheme('dark')} isActive={themePreference === 'dark'} />
                                </View>
                                
                                <Text style={styles.label}>Endereço da API do Backend:</Text>
                                <TextInput
                                    style={styles.input}
                                    value={apiUrl}
                                    onChangeText={setApiUrl}
                                    placeholder="http://192.168.1.10:3030"
                                    placeholderTextColor={colors.textLight}
                                    autoCapitalize="none"
                                    keyboardType="url"
                                    autoFocus={true}
                                />
                                {/* ALTERAÇÃO: Removido o botão de cancelar e o container 'buttonRow' */}
                                <AnimatedButton style={styles.confirmButton} onPress={handleSave}>
                                    <Text style={styles.confirmButtonText}>Confirmar</Text>
                                </AnimatedButton>
                            </Pressable>
                        </Animated.View>
                    </Animated.View>
                </Pressable>
            </Animated.View>
        </Modal>
    );
};

const getStyles = (colors) => StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
    },
    pressableOverlay: {
        flex: 1,
        width: '100%',
    },
    centeringContainer: {
        flex: 1,
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
    title: { fontSize: 20, fontWeight: 'bold', color: colors.text, marginBottom: 20, },
    label: { fontSize: 14, color: colors.textLight, marginBottom: 10, },
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
    // ALTERAÇÃO: Estilos de botões antigos removidos e 'confirmButton' foi atualizado
    confirmButton: { 
        backgroundColor: colors.primary,
        padding: 15,
        borderRadius: SIZES.radius,
        alignItems: 'center',
        width: '100%',
    },
    confirmButtonText: { 
        color: colors.white, 
        fontSize: 16, 
        fontWeight: '500', 
    },
    themeSelectorContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 25,
        gap: 10,
    },
    themeButton: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: SIZES.radius,
        alignItems: 'center',
    },
    themeButtonText: {
        fontSize: 14,
        fontWeight: '500',
    },
});

export default SettingsModal;