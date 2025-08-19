// screens/LoginScreen.js
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { View, Text, TextInput, StyleSheet, Image, Alert, ActivityIndicator, TouchableWithoutFeedback, Keyboard, Platform, Animated } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { COLORS, SIZES } from '../constants/theme';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as SystemUI from 'expo-system-ui';
import SettingsModal from '../components/modals/SettingsModal';
import { initializeApiUrl, setApiUrl } from '../api';
import AnimatedButton from '../components/common/AnimatedButton';

const LoginScreen = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [isPasswordVisible, setPasswordVisible] = useState(false);
    const { login } = useAuth();
    
    const [isSettingsVisible, setSettingsVisible] = useState(false);
    const [currentApiUrl, setCurrentApiUrl] = useState('');
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
    }, [keyboardHeightAnim]);

    useEffect(() => {
        const loadUrl = async () => {
            const url = await initializeApiUrl();
            setCurrentApiUrl(url);
        };
        loadUrl();
    }, []);

    useFocusEffect(
        useCallback(() => {
            const setSystemUIColor = async () => {
                await SystemUI.setBackgroundColorAsync(COLORS.primary);
            };
            setSystemUIColor();
        }, [])
    );

    const handleLogin = async () => {
        if (!username || !password) {
            Alert.alert("Erro", "Por favor, preencha o usuário e a senha.");
            return;
        }
        setLoading(true);
        try {
            await login(username, password);
        } catch (error) {
            Alert.alert("Falha no Login", error.message);
        } finally {
            setLoading(false);
        }
    };
    
    const handleSaveSettings = async (newUrl) => {
        await setApiUrl(newUrl);
        setCurrentApiUrl(newUrl);
        setSettingsVisible(false);
        Alert.alert("Sucesso", "O endereço do servidor foi atualizado.");
    };

    return (
        <View style={styles.mainContainer}>
            <SettingsModal
                visible={isSettingsVisible}
                onClose={() => setSettingsVisible(false)}
                onSave={handleSaveSettings}
                currentApiUrl={currentApiUrl}
            />
            
            {/* Camada de Fundo: Botão de Configurações */}
            <View style={styles.headerContainer}>
                <AnimatedButton style={styles.settingsButton} onPress={() => setSettingsVisible(true)}>
                    <Ionicons name="settings-outline" size={28} color={COLORS.headerIcon} />
                </AnimatedButton>
            </View>

            {/* Camada da Frente: Formulário de Login Animado */}
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <Animated.View style={[styles.centeringContainer, { paddingBottom: keyboardHeightAnim }]}>
                    <View style={styles.loginContainer}>
                        <View style={styles.logoContainer}>
                            <Image source={require('../assets/icons/icon512x512.png')} style={styles.logoIcon} />
                            <Image source={require('../assets/icons/name.png')} style={styles.logoName} />
                        </View>
                        <Text style={styles.subtitle}>Faça login com seu usuário e senha do Sankhya.</Text>

                        <Text style={styles.label}>Usuário</Text>
                        <TextInput style={styles.input} value={username} onChangeText={setUsername} autoCapitalize="none" autoCompleteType="username" />

                        <Text style={styles.label}>Senha</Text>
                        <View style={styles.passwordContainer}>
                            <TextInput style={styles.passwordInput} value={password} onChangeText={setPassword} secureTextEntry={!isPasswordVisible} autoCapitalize="none" autoCompleteType="password" />
                            <AnimatedButton style={styles.eyeIcon} onPress={() => setPasswordVisible(!isPasswordVisible)}>
                                <Ionicons name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'} size={24} color={COLORS.textLight} />
                            </AnimatedButton>
                        </View>
                        
                        <AnimatedButton style={styles.button} onPress={handleLogin} disabled={loading}>
                            {loading ? <ActivityIndicator color={COLORS.white} /> : <Text style={styles.buttonText}>Entrar</Text>}
                        </AnimatedButton>
                    </View>
                </Animated.View>
            </TouchableWithoutFeedback>
        </View>
    );
};

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: COLORS.primary,
    },
    headerContainer: {
        ...StyleSheet.absoluteFillObject,
    },
    settingsButton: { 
        position: 'absolute', 
        top: 45, 
        right: 20, 
        padding: 10 
    },
    centeringContainer: { 
        flex: 1, 
        justifyContent: 'center',
        alignItems: 'center', 
        paddingHorizontal: 20,
        pointerEvents: 'box-none', // <-- MUDANÇA 1: Deixa cliques "atravessarem" esta view
    },
    loginContainer: { 
        backgroundColor: COLORS.cardBackground, 
        padding: 40, 
        borderRadius: 12, 
        width: '100%', 
        maxWidth: 400,
        pointerEvents: 'auto', // <-- MUDANÇA 2: Garante que o formulário e seus filhos recebam cliques
    },
    logoContainer: { 
        alignItems: 'center', 
        marginBottom: 30,
        borderRadius: 12, 
        paddingLeft: 5, 
        paddingRight: 5, 
    },
    logoIcon: { width: 80, height: 80, resizeMode: 'contain', marginBottom: 15, },
    logoName: { width: 150, height: 40, resizeMode: 'contain', },
    subtitle: { textAlign: 'center', marginBottom: 30, color: COLORS.textLight, },
    label: { color: COLORS.textLight, marginBottom: 5, fontSize: SIZES.body, },
    input: {
        width: '100%', 
        padding: 12, 
        fontSize: 16, 
        borderRadius: 5, 
        borderWidth: 1, 
        borderColor: COLORS.border, 
        marginBottom: 20,
        backgroundColor: COLORS.inputBackground,
        color: COLORS.text,
    },
    passwordContainer: {
        flexDirection: 'row', 
        alignItems: 'center', 
        width: '100%', 
        borderRadius: 5, 
        borderWidth: 1, 
        borderColor: COLORS.border, 
        marginBottom: 20,
        backgroundColor: COLORS.inputBackground,
    },
    passwordInput: {
        flex: 1, 
        padding: 12, 
        fontSize: 16,
        color: COLORS.text,
    },
    eyeIcon: { padding: 10, },
    button: { width: '100%', padding: 15, backgroundColor: COLORS.primary, borderRadius: 8, alignItems: 'center', marginTop: 15, },
    buttonText: { color: COLORS.white, fontSize: 16, fontWeight: '500', },
});

export default LoginScreen;