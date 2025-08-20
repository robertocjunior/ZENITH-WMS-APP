// screens/HistoryScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Alert, Platform } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as api from '../api';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { SIZES } from '../constants/theme';
import * as SystemUI from 'expo-system-ui';
import HistoryCard from '../components/HistoryCard';
import AnimatedButton from '../components/common/AnimatedButton';

const HistoryScreen = () => {
    const { colors } = useTheme();
    const styles = getStyles(colors);
    const navigation = useNavigation();
    const { handleApiError } = useAuth();

    const [loading, setLoading] = useState(true);
    const [historyItems, setHistoryItems] = useState([]);

    useFocusEffect(
        useCallback(() => {
            const setSystemUIColor = async () => {
                await SystemUI.setBackgroundColorAsync(colors.background);
            };
            setSystemUIColor();
            fetchHistoryData();
        }, [colors])
    );

    const fetchHistoryData = async () => {
        setLoading(true);
        try {
            const data = await api.fetchHistory();
            setHistoryItems(data || []);
        } catch (error) {
            handleApiError(error);
            Alert.alert("Erro", "Não foi possível carregar o histórico.");
        } finally {
            setLoading(false);
        }
    };
    
    if (loading) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <AnimatedButton style={styles.backButton} onPress={() => navigation.goBack()}>
                        <Ionicons name="arrow-back" size={24} color={colors.white} />
                        <Text style={styles.headerBackText}>Voltar</Text>
                    </AnimatedButton>
                    <Text style={styles.headerMainTitle}>Histórico de Hoje</Text>
                </View>
                <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 50 }} />
            </View>
        );
    }
    
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <AnimatedButton style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color={colors.white} />
                    <Text style={styles.headerBackText}>Voltar</Text>
                </AnimatedButton>
                <Text style={styles.headerMainTitle}>Histórico de Hoje</Text>
            </View>

            <FlatList
                data={historyItems}
                keyExtractor={(item, index) => `${item[13]}-${index}`}
                renderItem={({ item }) => <HistoryCard item={item} />}
                contentContainerStyle={styles.list}
                ListEmptyComponent={() => (
                    <View style={styles.emptyContainer}>
                        <Ionicons name="time-outline" size={60} color={colors.textLight} />
                        <Text style={styles.emptyText}>Nenhuma operação hoje</Text>
                        <Text style={styles.emptySubText}>Nenhum registro foi encontrado para você na data de hoje.</Text>
                    </View>
                )}
            />
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
    list: { 
        padding: SIZES.padding,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: SIZES.padding,
        marginTop: '30%',
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