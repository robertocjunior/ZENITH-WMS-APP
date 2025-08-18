// screens/MainScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, Alert, ActivityIndicator, Keyboard } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import * as api from '../api';
import { COLORS, SIZES } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRoute } from '@react-navigation/native';
import * as SystemUI from 'expo-system-ui';
import DropDownPicker from 'react-native-dropdown-picker';
import LoadingOverlay from '../components/common/LoadingOverlay';
import ResultCard from '../components/ResultCard';
import ProfilePanel from '../components/ProfilePanel';

const MainScreen = ({ navigation }) => {
    const { logout, handleApiError } = useAuth();
    const route = useRoute();
    
    const [open, setOpen] = useState(false);
    const [warehouseValue, setWarehouseValue] = useState(null);
    const [warehouseItems, setWarehouseItems] = useState([]);
    
    const [filter, setFilter] = useState('');
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [isPanelVisible, setPanelVisible] = useState(false);

    // --- 1. FUNÇÃO DE BUSCA MODIFICADA PARA ACEITAR PARÂMETROS ---
    const handleSearch = async (searchWarehouse, searchFilter) => {
        const wh = searchWarehouse || warehouseValue;
        const ft = searchFilter !== undefined ? searchFilter : filter;

        Keyboard.dismiss();
        if (!wh) {
            if (route.params?.refresh) return;
            Alert.alert("Atenção", "Selecione um armazém para buscar.");
            return;
        }
        setLoading(true);
        try {
            const result = await api.searchItems(String(wh), ft);
            setItems(result);
        } catch (error) {
            handleApiError(error);
            Alert.alert("Erro na Busca", error.message);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            const setSystemUIColor = async () => {
                await SystemUI.setBackgroundColorAsync(COLORS.background);
            };
            setSystemUIColor();

            // --- 2. LÓGICA DE ATUALIZAÇÃO ---
            if (route.params?.refresh) {
                const { warehouseValue: refreshWh, filter: refreshFt } = route.params;
                
                // Atualiza a UI para refletir os critérios da busca
                setWarehouseValue(refreshWh);
                setFilter(refreshFt);
                
                // Executa a busca com os critérios recebidos
                handleSearch(refreshWh, refreshFt);
                
                // Limpa o parâmetro para evitar re-buscas
                navigation.setParams({ refresh: false });
            }
        }, [route.params?.refresh])
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
    
    // --- 3. PASSANDO O FILTRO PARA A TELA DE DETALHES ---
    const handleShowDetails = (sequencia) => {
        navigation.navigate('Details', { sequencia, codArm: warehouseValue, filter: filter });
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
                    <View style={styles.pickerWrapper}>
                        <DropDownPicker
                            open={open}
                            value={warehouseValue}
                            items={warehouseItems}
                            setOpen={setOpen}
                            setValue={setWarehouseValue}
                            setItems={setWarehouseItems}
                            placeholder="Selecione um Armazém"
                            style={styles.dropdownPicker}
                            containerStyle={styles.dropdownContainer}
                            dropDownContainerStyle={styles.dropdownList}
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
                            onSubmitEditing={() => handleSearch()} // Chamada sem parâmetros
                        />
                    </View>
                    <TouchableOpacity style={styles.searchButton} onPress={() => handleSearch()}>
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
// ... Seus estilos permanecem os mesmos
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
    pickerWrapper: {
        flex: 1,
        marginRight: 10,
        borderRadius: SIZES.radius,
        borderWidth: 1,
        borderColor: COLORS.border,
        backgroundColor: COLORS.white,
        height: 48,
        justifyContent: 'center',
    },
    dropdownContainer: {
        height: 48,
    },
    dropdownPicker: {
        borderWidth: 0,
        backgroundColor: 'transparent',
    },
    dropdownList: {
        borderColor: COLORS.border,
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