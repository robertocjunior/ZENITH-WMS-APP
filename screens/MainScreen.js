// screens/MainScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, Alert, ActivityIndicator, Keyboard } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import * as api from '../api';
import { COLORS, SIZES } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import * as SystemUI from 'expo-system-ui';
import DropDownPicker from 'react-native-dropdown-picker';
import LoadingOverlay from '../components/common/LoadingOverlay';
import ResultCard from '../components/ResultCard';
import ProfilePanel from '../components/ProfilePanel';

const MainScreen = ({ navigation }) => {
    const { logout, handleApiError } = useAuth();
    
    const [open, setOpen] = useState(false);
    const [warehouseValue, setWarehouseValue] = useState(null);
    const [warehouseItems, setWarehouseItems] = useState([]);
    
    const [filter, setFilter] = useState('');
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [isPanelVisible, setPanelVisible] = useState(false);

    useFocusEffect(
        useCallback(() => {
            const setSystemUIColor = async () => {
                await SystemUI.setBackgroundColorAsync(COLORS.background);
            };
            setSystemUIColor();
        }, [])
    );

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const whs = await api.fetchWarehouses();
                const formattedWarehouses = whs.map(([cod, desc]) => ({
                    label: desc,
                    value: cod
                }));
                setWarehouseItems(formattedWarehouses);
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
        if (!warehouseValue) {
            Alert.alert("Atenção", "Selecione um armazém para buscar.");
            return;
        }
        setLoading(true);
        try {
            const result = await api.searchItems(String(warehouseValue), filter);
            setItems(result);
        } catch (error) {
            handleApiError(error);
            Alert.alert("Erro na Busca", error.message);
        } finally {
            setLoading(false);
        }
    };
    
    const handleShowDetails = (sequencia) => {
        navigation.navigate('Details', { sequencia, codArm: warehouseValue });
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

            <View style={styles.header}>
                <View style={styles.topHeaderRow}>
                    {/* --- 1. Adicionado um <View> em volta do DropDownPicker --- */}
                    <View style={styles.pickerWrapper}>
                        <DropDownPicker
                            open={open}
                            value={warehouseValue}
                            items={warehouseItems}
                            setOpen={setOpen}
                            setValue={setWarehouseValue}
                            setItems={setWarehouseItems}
                            placeholder="Selecione um Armazém"
                            style={styles.dropdownPicker} // Estilo do picker interno
                            containerStyle={styles.dropdownContainer} // Estilo do container do picker
                            dropDownContainerStyle={styles.dropdownList} // Estilo da lista que abre
                            zIndex={3000}
                            zIndexInverse={1000}
                        />
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
        paddingTop: 50,
    },
    topHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SIZES.padding,
    },
    // --- 2. Novos estilos e modificações ---
    pickerWrapper: {
        flex: 1,
        marginRight: 10,
        borderRadius: SIZES.radius,
        borderWidth: 1,
        borderColor: COLORS.border, // Borda fica neste container
        backgroundColor: COLORS.white, // Fundo branco fica aqui
        height: 48,
        justifyContent: 'center',
    },
    dropdownContainer: {
        height: 48,
    },
    dropdownPicker: {
        borderWidth: 0, // Remove a borda do componente interno
        backgroundColor: 'transparent', // Remove o fundo do componente interno
    },
    dropdownList: {
        borderColor: COLORS.border,
    },
    // ------------------------------------
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