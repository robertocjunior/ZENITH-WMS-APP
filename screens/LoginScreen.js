// screens/LoginScreen.js
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { View, Text, TextInput, StyleSheet, Image, ActivityIndicator, TouchableWithoutFeedback, Keyboard, Platform, Animated } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { SIZES } from '../constants/theme';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as SystemUI from 'expo-system-ui';
import SettingsModal from '../components/modals/SettingsModal';
import { initializeApiUrl, setApiUrl } from '../api';
import AnimatedButton from '../components/common/AnimatedButton';

const LoginScreen = () => {
    const { colors } = useTheme();
    const styles = getStyles(colors);

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isButtonLoading, setIsButtonLoading] = useState(false);
    const [isPasswordVisible, setPasswordVisible] = useState(false);
    const { login } = useAuth();
    
    const [isSettingsVisible, setSettingsVisible] = useState(false);
    const [currentApiUrl, setCurrentApiUrl] = useState('');
    const keyboardHeightAnim = useRef(new Animated.Value(0)).current;
    const isSettingsVisibleRef = useRef(isSettingsVisible);

    useEffect(() => {
        isSettingsVisibleRef.current = isSettingsVisible;
    }, [isSettingsVisible]);

    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', (e) => {
            if (!isSettingsVisibleRef.current) {
                Animated.timing(keyboardHeightAnim, { toValue: e.endCoordinates.height, duration: 250, useNativeDriver: false }).start();
            }
        });
        const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
            Animated.timing(keyboardHeightAnim, { toValue: 0, duration: 200, useNativeDriver: false }).start();
        });
        return () => {
            keyboardDidHideListener.remove();
            keyboardDidShowListener.remove();
        };
    }, []);

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
                await SystemUI.setBackgroundColorAsync(colors.primary);
            };
            setSystemUIColor();
        }, [colors])
    );

    const handleLogin = async () => {
        Keyboard.dismiss();
        if (!username || !password) return;
        setIsButtonLoading(true);
        try {
            await login(username, password);
        } catch (error) {
            console.log("Login failed, context will handle error display");
        } finally {
            setIsButtonLoading(false);
        }
    };
    
    const handleSaveSettings = async (newUrl) => {
        await setApiUrl(newUrl);
        setCurrentApiUrl(newUrl);
        setSettingsVisible(false);
    };

    return (
        <View style={styles.mainContainer}>
            <SettingsModal
                visible={isSettingsVisible}
                onClose={() => setSettingsVisible(false)}
                onSave={handleSaveSettings}
                currentApiUrl={currentApiUrl}
            />
            
            <View style={styles.headerContainer}>
                <AnimatedButton style={styles.settingsButton} onPress={() => setSettingsVisible(true)}>
                    <Ionicons name="settings-outline" size={28} color={colors.headerIcon} />
                </AnimatedButton>
            </View>

            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <Animated.View style={[styles.centeringContainer, { paddingBottom: keyboardHeightAnim }]}>
                    <View style={styles.loginContainer}>
                        <View style={styles.logoContainer}>
                            <Image source={colors.logo512x512} style={styles.logoIcon} />
                            <Image source={colors.logoName} style={styles.logoName} />
                        </View>
                        <Text style={styles.subtitle}>Faça login com seu usuário e senha do Sankhya.</Text>

                        <Text style={styles.label}>Usuário</Text>
                        <TextInput 
                            style={styles.input} 
                            value={username} 
                            // --- ALTERAÇÃO AQUI ---
                            // Remove espaços em branco (/\s/g) do texto inserido
                            onChangeText={(text) => setUsername(text.replace(/\s/g, ''))} 
                            autoCapitalize="none" 
                            autoCompleteType="username" 
                            placeholderTextColor={colors.textLight}
                        />

                        <Text style={styles.label}>Senha</Text>
                        <View style={styles.passwordContainer}>
                            <TextInput style={styles.passwordInput} value={password} onChangeText={setPassword} secureTextEntry={!isPasswordVisible} autoCapitalize="none" autoCompleteType="password" placeholderTextColor={colors.textLight}/>
                            <AnimatedButton style={styles.eyeIcon} onPress={() => setPasswordVisible(!isPasswordVisible)}>
                                <Ionicons name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'} size={24} color={colors.textLight} />
                            </AnimatedButton>
                        </View>
                        
                        <AnimatedButton style={styles.button} onPress={handleLogin} disabled={isButtonLoading}>
                            {isButtonLoading ? <ActivityIndicator color={colors.white} /> : <Text style={styles.buttonText}>Entrar</Text>}
                        </AnimatedButton>
                    </View>
                </Animated.View>
            </TouchableWithoutFeedback>
        </View>
    );
};

const getStyles = (colors) => StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: colors.primary,
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
        pointerEvents: 'box-none',
    },
    loginContainer: { 
        backgroundColor: colors.cardBackground, 
        padding: 40, 
        borderRadius: 12, 
        width: '100%', 
        maxWidth: 400,
        pointerEvents: 'auto',
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
    subtitle: { textAlign: 'center', marginBottom: 30, color: colors.textLight, },
    label: { color: colors.textLight, marginBottom: 5, fontSize: SIZES.body, },
    input: {
        width: '100%', 
        padding: 12, 
        fontSize: 16, 
        borderRadius: 5, 
        borderWidth: 1, 
        borderColor: colors.border, 
        marginBottom: 20,
        backgroundColor: colors.inputBackground,
        color: colors.text,
    },
    passwordContainer: {
        flexDirection: 'row', 
        alignItems: 'center', 
        width: '100%', 
        borderRadius: 5, 
        borderWidth: 1, 
        borderColor: colors.border, 
        marginBottom: 20,
        backgroundColor: colors.inputBackground,
    },
    passwordInput: {
        flex: 1, 
        padding: 12, 
        fontSize: 16,
        color: colors.text,
    },
    eyeIcon: { padding: 10, },
    button: { width: '100%', padding: 15, backgroundColor: colors.primary, borderRadius: 8, alignItems: 'center', marginTop: 15, },
    buttonText: { color: colors.white, fontSize: 16, fontWeight: '500', },
});

export default LoginScreen;