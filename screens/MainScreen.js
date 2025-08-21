// screens/MainScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, Keyboard } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import * as api from '../api';
import { SIZES } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRoute } from '@react-navigation/native';
import * as SystemUI from 'expo-system-ui';
import LoadingOverlay from '../components/common/LoadingOverlay';
import ResultCard from '../components/ResultCard';
import ProfilePanel from '../components/ProfilePanel';
import AnimatedButton from '../components/common/AnimatedButton';
import ErrorModal from '../components/common/ErrorModal';
import CustomDropdown from '../components/common/CustomDropdown';

const MainScreen = ({ navigation }) => {
    const { userSession, logout, handleApiError, warehouses, lastWarehouse, saveLastWarehouse } = useAuth();
    const { colors } = useTheme();
    const styles = getStyles(colors);
    const route = useRoute();
    const [warehouseValue, setWarehouseValue] = useState(null);
    const [warehouseItems, setWarehouseItems] = useState([]);
    const [filter, setFilter] = useState('');
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isPanelVisible, setPanelVisible] = useState(false);
    const [error, setError] = useState(null);

    const handleSearch = async (searchWarehouse, searchFilter) => {
        const wh = searchWarehouse || warehouseValue;
        const ft = searchFilter !== undefined ? searchFilter : filter;
        Keyboard.dismiss();
        if (!wh) {
            if (route.params?.refresh) return;
            setError("Selecione um armazém para buscar.");
            return;
        }
        setLoading(true);
        try {
            const result = await api.searchItems(String(wh), ft);
            setItems(result);
        } catch (err) {
            // Esta chamada agora acionará o auto-logout se a sessão expirar
            handleApiError(err); 
            // setError(err.message || "Erro na busca."); // Opcional: pode remover se handleApiError já mostra um modal
        } finally {
            setLoading(false);
        }
    };
    
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

    useFocusEffect(
        useCallback(() => {
            const setSystemUIColor = async () => {
                await SystemUI.setBackgroundColorAsync(colors.background);
            };
            setSystemUIColor();

            if (route.params?.refresh) {
                const { warehouseValue: refreshWh, filter: refreshFt } = route.params;
                setWarehouseValue(refreshWh);
                setFilter(refreshFt);
                handleSearch(refreshWh, refreshFt);
                navigation.setParams({ refresh: false });
            }
        }, [route.params?.refresh, colors])
    );
    
    useEffect(() => {
        if (warehouses && warehouses.length > 0) {
            const formattedWarehouses = warehouses.map(([cod, desc]) => ({ label: desc, value: cod }));
            setWarehouseItems(formattedWarehouses);

            const lastUsedIsValid = formattedWarehouses.some(wh => wh.value === lastWarehouse);

            if (lastWarehouse && lastUsedIsValid) {
                setWarehouseValue(lastWarehouse);
            } else if (formattedWarehouses.length === 1) {
                setWarehouseValue(formattedWarehouses[0].value);
            }
        } else {
            setWarehouseItems([]);
        }
    }, [warehouses, lastWarehouse]);

    useEffect(() => {
        if (warehouseValue && userSession?.codusu) {
            saveLastWarehouse(userSession.codusu, warehouseValue);
        }
    }, [warehouseValue]);

    return (
        <View style={styles.container}>
            <LoadingOverlay visible={loading} /> 
            <ProfilePanel 
                visible={isPanelVisible}
                onClose={() => setPanelVisible(false)}
                onNavigateToHistory={handleNavigateToHistory}
                onLogout={handleLogout}
            />
            <ErrorModal
                visible={!!error}
                errorMessage={error}
                onClose={() => setError(null)}
            />

            <View style={styles.header}>
                <View style={styles.topHeaderRow}>
                    <View style={styles.pickerWrapper}>
                        <CustomDropdown
                            items={warehouseItems}
                            value={warehouseValue}
                            onChange={setWarehouseValue}
                            placeholder="Selecione um Armazém"
                            colors={colors}
                            disabled={warehouseItems.length === 1}
                        />
                    </View>
                    <AnimatedButton style={styles.profileButton} onPress={() => setPanelVisible(true)}>
                        <Ionicons name="person-circle-outline" size={32} color={colors.headerIcon} />
                    </AnimatedButton>
                </View>
                <View style={styles.searchBar}>
                    <View style={styles.searchInputWrapper}>
                        <Ionicons name="search" size={20} color={colors.textLight} style={{marginLeft: 10}} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Buscar..."
                            placeholderTextColor={colors.textLight}
                            value={filter}
                            onChangeText={setFilter}
                            onSubmitEditing={() => handleSearch()}
                        />
                    </View>
                    <AnimatedButton style={styles.searchButton} onPress={() => handleSearch()}>
                        <Text style={styles.searchButtonText}>Buscar</Text>
                    </AnimatedButton>
                </View>
            </View>

            <FlatList
                data={items}
                keyExtractor={(item) => item[0].toString()}
                renderItem={({ item }) => <ResultCard item={item} onPress={handleShowDetails} />}
                contentContainerStyle={styles.list}
                ListEmptyComponent={() => (
                    <View style={styles.emptyContainer}>
                        <Ionicons name="home-outline" size={60} color={colors.textLight} />
                        <Text style={styles.emptyText}>Nenhum resultado para exibir</Text>
                        <Text style={styles.emptySubText}>Selecione um armazém para começar</Text>
                    </View>
                )}
            />
        </View>
    );
};

const getStyles = (colors) => StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
        backgroundColor: colors.primary,
        padding: SIZES.padding,
        paddingTop: 50,
        zIndex: 1,
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
        backgroundColor: colors.inputBackground,
        borderRadius: SIZES.radius,
        height: 48,
    },
    searchInput: {
        flex: 1,
        paddingHorizontal: SIZES.padding / 2,
        fontSize: 16,
        color: colors.text,
    },
    searchButton: {
        backgroundColor: colors.secondary,
        height: 48,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
        borderRadius: SIZES.radius,
    },
    searchButtonText: {
        color: colors.white,
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
    emptyText: { color: colors.textLight, fontSize: 18, marginTop: 15 },
    emptySubText: { color: colors.textLight, fontSize: 14 }
});

export default MainScreen;