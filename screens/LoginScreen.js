// screens/LoginScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert, ActivityIndicator } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { COLORS, SIZES } from '../constants/theme';

const LoginScreen = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();

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

    return (
        <View style={styles.container}>
            <View style={styles.loginContainer}>
                <View style={styles.logoContainer}>
                    <Image source={require('../assets/icons/icon512x512transparent.png')} style={styles.logoIcon} />
                    <Image source={require('../assets/icons/name-transparent.png')} style={styles.logoName} />
                </View>
                <Text style={styles.subtitle}>Faça login com seu usuário e senha do Sankhya.</Text>
                
                <Text style={styles.label}>Usuário</Text>
                <TextInput
                    style={styles.input}
                    value={username}
                    onChangeText={setUsername}
                    autoCapitalize="none"
                    autoCompleteType="username"
                />
                
                <Text style={styles.label}>Senha</Text>
                <TextInput
                    style={styles.input}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    autoCompleteType="password"
                />
                
                <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
                    {loading ? <ActivityIndicator color={COLORS.white} /> : <Text style={styles.buttonText}>Entrar</Text>}
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.primary,
    },
    loginContainer: {
        backgroundColor: COLORS.cardBackground,
        padding: 40,
        borderRadius: 12,
        width: '90%',
        maxWidth: 400,
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 30,
    },
    logoIcon: {
        width: 80,
        height: 80,
        resizeMode: 'contain',
        marginBottom: 15,
    },
    logoName: {
        width: 150,
        height: 40,
        resizeMode: 'contain',
    },
    subtitle: {
        textAlign: 'center',
        marginBottom: 30,
        color: COLORS.textLight,
    },
    label: {
        color: COLORS.textLight,
        marginBottom: 5,
        fontSize: SIZES.body,
    },
    input: {
        width: '100%',
        padding: 12,
        fontSize: 16,
        borderRadius: 5,
        borderWidth: 1,
        borderColor: COLORS.border,
        marginBottom: 20,
    },
    button: {
        width: '100%',
        padding: 15,
        backgroundColor: COLORS.primary,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 15,
    },
    buttonText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: '500',
    },
});

export default LoginScreen;