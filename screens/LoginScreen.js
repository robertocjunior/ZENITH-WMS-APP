// screens/LoginScreen.js
import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert, ActivityIndicator, KeyboardAvoidingView, ScrollView, TouchableWithoutFeedback, Keyboard, Platform } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { COLORS, SIZES } from '../constants/theme';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as SystemUI from 'expo-system-ui';
import SettingsModal from '../components/modals/SettingsModal'; // <-- Importe o modal
import { initializeApiUrl, setApiUrl } from '../api'; // <-- Importe as funções da API

const LoginScreen = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [isPasswordVisible, setPasswordVisible] = useState(false);
    const { login } = useAuth();
    
    // Estados para o modal de configurações
    const [isSettingsVisible, setSettingsVisible] = useState(false);
    const [currentApiUrl, setCurrentApiUrl] = useState('');

    useEffect(() => {
        // Carrega a URL da API ao iniciar a tela
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
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <SettingsModal
                visible={isSettingsVisible}
                onClose={() => setSettingsVisible(false)}
                onSave={handleSaveSettings}
                currentApiUrl={currentApiUrl}
            />

            {/* Ícone de Configurações */}
            <TouchableOpacity style={styles.settingsButton} onPress={() => setSettingsVisible(true)}>
                <Ionicons name="settings-outline" size={28} color={COLORS.white} />
            </TouchableOpacity>

            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <ScrollView contentContainerStyle={styles.scrollContainer}>
                    <View style={styles.loginContainer}>
                        <View style={styles.logoContainer}>
                            <Image source={require('../assets/icons/icon512x512transparent.png')} style={styles.logoIcon} />
                            <Image source={require('../assets/icons/name-transparent.png')} style={styles.logoName} />
                        </View>
                        <Text style={styles.subtitle}>Faça login com seu usuário e senha do Sankhya.</Text>

                        <Text style={styles.label}>Usuário</Text>
                        <TextInput style={styles.input} value={username} onChangeText={setUsername} autoCapitalize="none" autoCompleteType="username" />

                        <Text style={styles.label}>Senha</Text>
                        <View style={styles.passwordContainer}>
                            <TextInput style={styles.passwordInput} value={password} onChangeText={setPassword} secureTextEntry={!isPasswordVisible} autoCapitalize="none" autoCompleteType="password" />
                            <TouchableOpacity style={styles.eyeIcon} onPress={() => setPasswordVisible(!isPasswordVisible)}>
                                <Ionicons name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'} size={24} color={COLORS.textLight} />
                            </TouchableOpacity>
                        </View>
                        
                        <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
                            {loading ? <ActivityIndicator color={COLORS.white} /> : <Text style={styles.buttonText}>Entrar</Text>}
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.primary, },
    settingsButton: { position: 'absolute', top: 45, right: 20, zIndex: 10, padding: 10 },
    scrollContainer: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 20, },
    loginContainer: { backgroundColor: COLORS.cardBackground, padding: 40, borderRadius: 12, width: '100%', maxWidth: 400, },
    logoContainer: { alignItems: 'center', marginBottom: 30, },
    logoIcon: { width: 80, height: 80, resizeMode: 'contain', marginBottom: 15, },
    logoName: { width: 150, height: 40, resizeMode: 'contain', },
    subtitle: { textAlign: 'center', marginBottom: 30, color: COLORS.textLight, },
    label: { color: COLORS.textLight, marginBottom: 5, fontSize: SIZES.body, },
    input: { width: '100%', padding: 12, fontSize: 16, borderRadius: 5, borderWidth: 1, borderColor: COLORS.border, marginBottom: 20, },
    passwordContainer: { flexDirection: 'row', alignItems: 'center', width: '100%', borderRadius: 5, borderWidth: 1, borderColor: COLORS.border, marginBottom: 20, },
    passwordInput: { flex: 1, padding: 12, fontSize: 16, },
    eyeIcon: { padding: 10, },
    button: { width: '100%', padding: 15, backgroundColor: COLORS.primary, borderRadius: 8, alignItems: 'center', marginTop: 15, },
    buttonText: { color: COLORS.white, fontSize: 16, fontWeight: '500', },
});

export default LoginScreen;