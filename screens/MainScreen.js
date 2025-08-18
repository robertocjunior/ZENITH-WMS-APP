// screens/MainScreen.js
import React, { useState, useEffect } from 'react';
// A linha de import duplicada foi removida e 'Keyboard' foi adicionado aqui.
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, Alert, ActivityIndicator, Keyboard } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import * as api from '../api';
import { COLORS, SIZES } from '../constants/theme';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import LoadingOverlay from '../components/common/LoadingOverlay';
import ResultCard from '../components/ResultCard';
import ProfilePanel from '../components/ProfilePanel';

const MainScreen = ({ navigation }) => {
    const { logout, handleApiError, userSession } = useAuth();
    const [warehouses, setWarehouses] = useState([]);
    const [selectedWarehouse, setSelectedWarehouse] = useState(null);
    const [filter, setFilter] = useState('');
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [isPanelVisible, setPanelVisible] = useState(false);

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const whs = await api.fetchWarehouses();
                setWarehouses(whs);
            } catch (error) {
                handleApiError(error);
                Alert.alert("Erro", "Não foi possível carregar os armazéns.");
            } finally {
                setInitialLoading(false);
            }
        };
        loadInitialData();
    }, []);

    const handleSearch = async () => {
        Keyboard.dismiss();
        if (!selectedWarehouse) {
            Alert.alert("Atenção", "Selecione um armazém para buscar.");
            return;
        }
        setLoading(true);
        try {
            const result = await api.searchItems(String(selectedWarehouse), filter);
            setItems(result);
        } catch (error) {
            handleApiError(error);
            Alert.alert("Erro na Busca", error.message);
        } finally {
            setLoading(false);
        }
    };
    
    const handleShowDetails = (sequencia) => {
        navigation.navigate('Details', { sequencia, codArm: selectedWarehouse });
    };
    
    const handleNavigateToHistory = () => {
        setPanelVisible(false);
        navigation.navigate('History');
    };

    const handleLogout = () => {
        setPanelVisible(false);
        logout();
    };


    if (initialLoading) {
        return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><ActivityIndicator size="large" color={COLORS.primary} /></View>;
    }

    return (
        <View style={styles.container}>
            <LoadingOverlay visible={loading} />
            <ProfilePanel 
                visible={isPanelVisible}
                onClose={() => setPanelVisible(false)}
                onNavigateToHistory={handleNavigateToHistory}
                onLogout={handleLogout}
            />

            {/* ===== NOVO CABEÇALHO ===== */}
            <View style={styles.header}>
                <View style={styles.topHeaderRow}>
                    <View style={styles.pickerContainer}>
                         <Picker
                            selectedValue={selectedWarehouse}
                            onValueChange={(itemValue) => setSelectedWarehouse(itemValue)}
                            style={styles.picker}
                        >
                            <Picker.Item label="Selecione um Armazém" value={null} />
                            {warehouses.map(([cod, desc]) => (
                                <Picker.Item key={cod} label={desc} value={cod} />
                            ))}
                        </Picker>
                    </View>
                    <TouchableOpacity style={styles.profileButton} onPress={() => setPanelVisible(true)}>
                        <Ionicons name="person-circle-outline" size={32} color={COLORS.white} />
                    </TouchableOpacity>
                </View>
                <View style={styles.searchBar}>
                    <View style={styles.searchInputWrapper}>
                        <Ionicons name="search" size={20} color={COLORS.textLight} style={{marginLeft: 10}} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Buscar..."
                            value={filter}
                            onChangeText={setFilter}
                            onSubmitEditing={handleSearch}
                        />
                    </View>
                    <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
                        <Text style={styles.searchButtonText}>Buscar</Text>
                    </TouchableOpacity>
                </View>
            </View>
            {/* ===== FIM DO NOVO CABEÇALHO ===== */}

            <FlatList
                data={items}
                keyExtractor={(item) => item[0].toString()}
                renderItem={({ item }) => <ResultCard item={item} onPress={handleShowDetails} />}
                contentContainerStyle={styles.list}
                ListEmptyComponent={() => (
                    <View style={styles.emptyContainer}>
                        <Ionicons name="home-outline" size={60} color={COLORS.textLight} />
                        <Text style={styles.emptyText}>Nenhum resultado para exibir</Text>
                        <Text style={styles.emptySubText}>Selecione um armazém para começar</Text>
                    </View>
                )}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    header: {
        backgroundColor: COLORS.primary,
        padding: SIZES.padding,
        paddingTop: 50, // Ajuste para safe area
    },
    topHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SIZES.padding,
    },
    pickerContainer: {
        flex: 1,
        backgroundColor: COLORS.white,
        borderRadius: SIZES.radius,
        marginRight: 10,
        height: 48, 
        justifyContent: 'center'
    },
    picker: { 
      width: '100%',
    },
    profileButton: {
        padding: 5,
    },
    searchBar: { 
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    searchInputWrapper: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        borderRadius: SIZES.radius,
        height: 48,
    },
    searchInput: {
        flex: 1,
        paddingHorizontal: SIZES.padding / 2,
        fontSize: 16,
    },
    searchButton: {
        backgroundColor: COLORS.secondary,
        height: 48,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
        borderRadius: SIZES.radius,
    },
    searchButtonText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: '500',
    },
    list: { padding: SIZES.padding, flexGrow: 1 },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: '30%',
    },
    emptyText: { color: COLORS.textLight, fontSize: 18, marginTop: 15 },
    emptySubText: { color: COLORS.textLight, fontSize: 14 }
});

export default MainScreen;