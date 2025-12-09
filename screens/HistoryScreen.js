// screens/HistoryScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Alert, Platform, TextInput, TouchableOpacity, Keyboard } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as api from '../api';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { SIZES } from '../constants/theme';
import * as SystemUI from 'expo-system-ui';
import HistoryCard from '../components/HistoryCard';
import AnimatedButton from '../components/common/AnimatedButton';

// Helper para data de hoje
const getTodayDate = () => {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    return `${day}/${month}/${year}`;
};

const HistoryScreen = () => {
    const { colors } = useTheme();
    const styles = getStyles(colors);
    const navigation = useNavigation();
    const { handleApiError, userSession } = useAuth(); // Precisa do userSession para o ID

    const [loading, setLoading] = useState(false);
    const [historyItems, setHistoryItems] = useState([]);
    
    // Filtros
    const [dtIni, setDtIni] = useState(getTodayDate());
    const [dtFim, setDtFim] = useState(getTodayDate());
    const [showAllUsers, setShowAllUsers] = useState(false);

    useFocusEffect(
        useCallback(() => {
            const setSystemUIColor = async () => {
                await SystemUI.setBackgroundColorAsync(colors.background);
            };
            setSystemUIColor();
            // Carrega inicialmente
            fetchHistoryData();
        }, [colors]) // Removeu fetchHistoryData das deps para evitar loop, chama manual
    );

    const fetchHistoryData = async () => {
        setLoading(true);
        Keyboard.dismiss();
        try {
            // Lógica do Payload
            const payload = {
                dtIni: dtIni,
                dtFim: dtFim
            };

            // Se "Todos" estiver marcado, manda 0. Se não, manda o ID do user logado (ou omite, dependo do backend, mas aqui mandamos explícito)
            if (showAllUsers) {
                payload.codUsu = 0;
            } else if (userSession?.codusu) {
                payload.codUsu = userSession.codusu;
            }

            const data = await api.fetchHistory(payload);
            setHistoryItems(data || []);
        } catch (error) {
            handleApiError(error);
            // Alert.alert("Erro", "Não foi possível carregar o histórico."); // handleApiError já deve tratar
        } finally {
            setLoading(false);
        }
    };

    // Máscara simples de data DD/MM/YYYY
    const handleDateChange = (text, setFunction) => {
        let formatted = text.replace(/\D/g, '');
        if (formatted.length > 2) formatted = `${formatted.slice(0, 2)}/${formatted.slice(2)}`;
        if (formatted.length > 5) formatted = `${formatted.slice(0, 5)}/${formatted.slice(5, 9)}`;
        setFunction(formatted);
    };
    
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <AnimatedButton style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color={colors.white} />
                    <Text style={styles.headerBackText}>Voltar</Text>
                </AnimatedButton>
                <Text style={styles.headerMainTitle}>Histórico</Text>
            </View>

            {/* Barra de Filtros */}
            <View style={styles.filterContainer}>
                <View style={styles.datesRow}>
                    <View style={styles.dateInputWrapper}>
                        <Text style={styles.label}>Início</Text>
                        <TextInput 
                            style={styles.dateInput} 
                            value={dtIni} 
                            onChangeText={(t) => handleDateChange(t, setDtIni)}
                            keyboardType="numeric"
                            maxLength={10}
                            placeholder="DD/MM/AAAA"
                            placeholderTextColor={colors.textLight}
                        />
                    </View>
                    <View style={styles.dateInputWrapper}>
                        <Text style={styles.label}>Fim</Text>
                        <TextInput 
                            style={styles.dateInput} 
                            value={dtFim} 
                            onChangeText={(t) => handleDateChange(t, setDtFim)}
                            keyboardType="numeric"
                            maxLength={10}
                            placeholder="DD/MM/AAAA"
                            placeholderTextColor={colors.textLight}
                        />
                    </View>
                </View>

                <View style={styles.controlsRow}>
                    <TouchableOpacity 
                        style={styles.checkboxContainer} 
                        activeOpacity={0.7}
                        onPress={() => setShowAllUsers(!showAllUsers)}
                    >
                        <Ionicons 
                            name={showAllUsers ? "checkbox" : "square-outline"} 
                            size={24} 
                            color={colors.primary} 
                        />
                        <Text style={styles.checkboxLabel}>Ver todos os usuários</Text>
                    </TouchableOpacity>

                    <AnimatedButton style={styles.searchButton} onPress={fetchHistoryData}>
                        <Ionicons name="search" size={20} color={colors.white} />
                        <Text style={styles.searchButtonText}>Filtrar</Text>
                    </AnimatedButton>
                </View>
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : (
                <FlatList
                    data={historyItems}
                    keyExtractor={(item, index) => `${item.idOperacao || index}-${index}`} // Ajustado para ser mais robusto
                    renderItem={({ item }) => <HistoryCard item={item} />}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={() => (
                        <View style={styles.emptyContainer}>
                            <Ionicons name="time-outline" size={60} color={colors.textLight} />
                            <Text style={styles.emptyText}>Nenhuma operação encontrada</Text>
                            <Text style={styles.emptySubText}>Tente ajustar os filtros de data.</Text>
                        </View>
                    )}
                />
            )}
        </View>
    );
};

const getStyles = (colors) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        backgroundColor: colors.primary,
        paddingTop: Platform.OS === 'android' ? 40 : 50,
        paddingBottom: SIZES.padding,
        paddingHorizontal: SIZES.padding,
        flexDirection: 'row',
        alignItems: 'center',
        height: Platform.OS === 'android' ? 90 : 100,
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        zIndex: 1, 
        paddingRight: 10,
    },
    headerBackText: {
        color: colors.white,
        fontSize: 16,
        marginLeft: 8,
    },
    headerMainTitle: {
        color: colors.white,
        fontSize: 20,
        fontWeight: 'bold',
        position: 'absolute',
        left: 0,
        right: 0,
        textAlign: 'center',
        paddingTop: Platform.OS === 'android' ? 40 : 50,
    },
    // Estilos dos Filtros
    filterContainer: {
        backgroundColor: colors.cardBackground,
        padding: SIZES.padding,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    datesRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 10,
        marginBottom: 15,
    },
    dateInputWrapper: {
        flex: 1,
    },
    label: {
        fontSize: 12,
        color: colors.textLight,
        marginBottom: 4,
    },
    dateInput: {
        backgroundColor: colors.inputBackground,
        borderRadius: SIZES.radius,
        borderWidth: 1,
        borderColor: colors.border,
        padding: 10,
        color: colors.text,
        fontSize: 16,
        textAlign: 'center',
    },
    controlsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    checkboxLabel: {
        color: colors.text,
        fontSize: 14,
    },
    searchButton: {
        backgroundColor: colors.secondary,
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: SIZES.radius,
        gap: 5,
    },
    searchButtonText: {
        color: colors.white,
        fontWeight: 'bold',
        fontSize: 14,
    },
    // Lista e Empty
    list: { 
        padding: SIZES.padding,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: SIZES.padding,
        marginTop: '20%',
    },
    emptyText: { 
        color: colors.text, 
        fontSize: 18, 
        marginTop: 15,
        fontWeight: 'bold',
    },
    emptySubText: { 
        color: colors.textLight, 
        fontSize: 14,
        textAlign: 'center',
        marginTop: 5,
    }
});

export default HistoryScreen;