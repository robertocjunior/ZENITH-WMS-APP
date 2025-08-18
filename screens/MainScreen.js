// screens/MainScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import * as api from '../api';
import { COLORS, SIZES } from '../constants/theme';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import LoadingOverlay from '../components/common/LoadingOverlay';
import ResultCard from '../components/ResultCard'; // Criaremos este componente a seguir

const MainScreen = ({ navigation }) => {
    const { logout, handleApiError } = useAuth();
    const [warehouses, setWarehouses] = useState([]);
    const [selectedWarehouse, setSelectedWarehouse] = useState(null);
    const [filter, setFilter] = useState('');
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);

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
        if (!selectedWarehouse) {
            Alert.alert("Atenção", "Selecione um armazém para buscar.");
            return;
        }
        setLoading(true);
        try {
            const result = await api.searchItems(selectedWarehouse, filter);
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

    if (initialLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <LoadingOverlay visible={loading} />
            <View style={styles.header}>
                <Text style={styles.label}>Armazém</Text>
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

                <View style={styles.searchBar}>
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Buscar por sequência, produto..."
                        value={filter}
                        onChangeText={setFilter}
                    />
                    <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
                        <Ionicons name="search" size={24} color={COLORS.white} />
                    </TouchableOpacity>
                </View>
                 <TouchableOpacity onPress={logout} style={styles.logoutButton}>
                    <Ionicons name="log-out-outline" size={30} color={COLORS.white} />
                </TouchableOpacity>
            </View>
            <FlatList
                data={items}
                keyExtractor={(item) => item[0].toString()} // sequencia é a chave
                renderItem={({ item }) => <ResultCard item={item} onPress={handleShowDetails} />}
                contentContainerStyle={styles.list}
                ListEmptyComponent={() => (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>Nenhum resultado encontrado.</Text>
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
        borderBottomLeftRadius: SIZES.radius,
        borderBottomRightRadius: SIZES.radius,
    },
    label: { color: COLORS.white, marginBottom: 5 },
    pickerContainer: {
        backgroundColor: COLORS.white,
        borderRadius: SIZES.radius,
        marginBottom: SIZES.padding,
    },
    picker: { height: 50, width: '100%' },
    searchBar: { flexDirection: 'row', alignItems: 'center' },
    searchInput: {
        flex: 1,
        backgroundColor: COLORS.white,
        paddingHorizontal: SIZES.padding,
        height: 50,
        borderRadius: SIZES.radius,
        marginRight: 10,
    },
    searchButton: {
        backgroundColor: COLORS.secondary,
        padding: 12,
        borderRadius: SIZES.radius,
    },
    list: { padding: SIZES.padding },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 50,
    },
    emptyText: { color: COLORS.textLight, fontSize: 16 },
    logoutButton: { position: 'absolute', top: 55, right: 15 }
});

export default MainScreen;