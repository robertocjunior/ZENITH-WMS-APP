// screens/DetailsScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Platform } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import * as api from '../api';
import { useAuth } from '../contexts/AuthContext';
import { COLORS, SIZES } from '../constants/theme';
import { formatData } from '../utils/formatter';
import LoadingOverlay from '../components/common/LoadingOverlay';
import BaixaModal from '../components/modals/BaixaModal';
import TransferModal from '../components/modals/TransferModal';
import PickingModal from '../components/modals/PickingModal';
import CorrecaoModal from '../components/modals/CorrecaoModal'; // <-- 1. Importe o novo modal

const DetailItem = ({ label, value }) => (
    <View style={styles.detailItem}>
        <Text style={styles.detailItemLabel}>{label}</Text>
        <Text style={styles.detailItemValue}>{value}</Text>
    </View>
);

const DetailsScreen = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const { permissions, handleApiError, refreshPermissions, warehouses } = useAuth();
    
    const { sequencia, codArm, filter } = route.params;

    const [loading, setLoading] = useState(true);
    const [details, setDetails] = useState(null);
    const [isBaixaModalVisible, setBaixaModalVisible] = useState(false);
    const [isTransferModalVisible, setTransferModalVisible] = useState(false);
    const [isPickingModalVisible, setPickingModalVisible] = useState(false);
    const [isCorrecaoModalVisible, setCorrecaoModalVisible] = useState(false); // <-- 2. Estado para o modal

    useEffect(() => {
        const loadScreenData = async () => {
            if (!codArm || !sequencia) return;
            setLoading(true);
            try {
                const [detailsData] = await Promise.all([
                    api.fetchItemDetails(String(codArm), sequencia),
                    refreshPermissions()
                ]);
                
                const [codarm, seq, rua, predio, apto, codprod, descrprod, marca, datval, quantidade, endpic, qtdCompleta, derivacao] = detailsData;
                setDetails({ codarm, sequencia: seq, rua, predio, apto, codprod, descrprod, marca, datval, quantidade, endpic, qtdCompleta, derivacao });

            } catch (error) {
                handleApiError(error);
                Alert.alert("Erro", "Não foi possível carregar os dados do item.", [{ text: 'OK', onPress: () => navigation.goBack() }]);
            } finally {
                setLoading(false);
            }
        };

        loadScreenData();
    }, [codArm, sequencia]);
    
    const handleConfirmBaixa = async (quantity) => {
        setBaixaModalVisible(false);
        setLoading(true);
        try {
            const payload = { codarm: details.codarm, sequencia: details.sequencia, quantidade: quantity };
            const result = await api.executeTransaction('baixa', payload);
            Alert.alert("Sucesso", result.message || "Baixa realizada com sucesso!");
            navigation.navigate('Main', { refresh: true, warehouseValue: details.codarm, filter });
        } catch (error) {
            handleApiError(error);
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmTransfer = async (transferData) => {
        setTransferModalVisible(false);
        setLoading(true);
        try {
            const payload = {
                origem: details,
                destino: {
                    armazemDestino: transferData.destinationWarehouse,
                    enderecoDestino: transferData.destinationAddress,
                    quantidade: transferData.quantity,
                    criarPick: transferData.isMarkedAsPicking
                }
            };
            const result = await api.executeTransaction('transferencia', payload);
            Alert.alert("Sucesso", result.message || "Transferência realizada com sucesso!");
            navigation.navigate('Main', { refresh: true, warehouseValue: details.codarm, filter });
        } catch (error) {
            handleApiError(error);
        } finally {
            setLoading(false);
        }
    };
    
    const handleConfirmPicking = async (pickingData) => {
        setPickingModalVisible(false);
        setLoading(true);
        try {
            const payload = {
                origem: details,
                destino: {
                    armazemDestino: details.codarm,
                    enderecoDestino: pickingData.destinationSequence,
                    quantidade: pickingData.quantity
                }
            };
            const result = await api.executeTransaction('picking', payload);
            Alert.alert("Sucesso", result.message || "Movido para picking com sucesso!");
            navigation.navigate('Main', { refresh: true, warehouseValue: details.codarm, filter });
        } catch (error) {
            handleApiError(error);
        } finally {
            setLoading(false);
        }
    };
    
    // --- 3. FUNÇÃO PARA CONFIRMAR A CORREÇÃO ---
    const handleConfirmCorrecao = async (newQuantity) => {
        setCorrecaoModalVisible(false);
        setLoading(true);
        try {
            const payload = {
                codarm: details.codarm,
                sequencia: details.sequencia,
                newQuantity: newQuantity
            };
            const result = await api.executeTransaction('correcao', payload);
            Alert.alert("Sucesso", result.message || "Quantidade corrigida com sucesso!");
            navigation.navigate('Main', { refresh: true, warehouseValue: details.codarm, filter });
        } catch (error) {
            handleApiError(error);
        } finally {
            setLoading(false);
        }
    };

    const renderActionButtons = () => {
        if (!details || !permissions) return null;

        const showBaixa = (details.endpic === 'S') ? permissions.bxaPick : permissions.baixa;
        const showPicking = permissions.pick && details.endpic !== 'S';

        const hasAnyAction = showBaixa || permissions.transfer || showPicking || permissions.corre;
        if (!hasAnyAction) return null;

        return (
            <View style={styles.actionsFooter}>
                {showBaixa && <TouchableOpacity style={[styles.actionButton, styles.btnBaixar]} onPress={() => setBaixaModalVisible(true)}><Text style={styles.actionButtonText}>Baixar</Text></TouchableOpacity>}
                {permissions.transfer && <TouchableOpacity style={[styles.actionButton, styles.btnTransferir]} onPress={() => setTransferModalVisible(true)}><Text style={styles.actionButtonText}>Transferir</Text></TouchableOpacity>}
                {showPicking && <TouchableOpacity style={[styles.actionButton, styles.btnPicking]} onPress={() => setPickingModalVisible(true)}><Text style={styles.actionButtonText}>Picking</Text></TouchableOpacity>}
                {/* --- 4. AÇÃO onPress ATUALIZADA --- */}
                {permissions.corre && <TouchableOpacity style={[styles.actionButton, styles.btnCorrecao]} onPress={() => setCorrecaoModalVisible(true)}><Text style={styles.actionButtonText}>Correção</Text></TouchableOpacity>}
            </View>
        );
    };

    if (loading || !details) {
        return <LoadingOverlay visible={true} />;
    }

    return (
        <View style={styles.container}>
            <BaixaModal
                visible={isBaixaModalVisible}
                onClose={() => setBaixaModalVisible(false)}
                onConfirm={handleConfirmBaixa}
                itemDetails={details}
            />
            <TransferModal
                visible={isTransferModalVisible}
                onClose={() => setTransferModalVisible(false)}
                onConfirm={handleConfirmTransfer}
                itemDetails={details}
                warehouses={warehouses}
                permissions={permissions}
            />
            <PickingModal
                visible={isPickingModalVisible}
                onClose={() => setPickingModalVisible(false)}
                onConfirm={handleConfirmPicking}
                itemDetails={details}
            />
            {/* --- 5. RENDERIZE O NOVO MODAL --- */}
            <CorrecaoModal
                visible={isCorrecaoModalVisible}
                onClose={() => setCorrecaoModalVisible(false)}
                onConfirm={handleConfirmCorrecao}
                itemDetails={details}
            />
            
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.white} />
                    <Text style={styles.headerBackText}>Voltar</Text>
                </TouchableOpacity>
                <Text style={styles.headerMainTitle}>Detalhes</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={[styles.heroCard, details.endpic === 'S' && styles.pickedHeroCard]}>
                    <Text style={styles.heroTitle}>{details.descrprod} - {details.marca}</Text>
                    <Text style={styles.heroSubtitle}>Cód. Prod.: {details.codprod}</Text>
                </View>

                <Text style={styles.sectionTitle}>INFORMAÇÕES</Text>
                <DetailItem label="Derivação" value={details.derivacao || 'N/A'} />
                <DetailItem label="Validade" value={formatData(details.datval)} />
                <DetailItem label="Quantidade" value={details.qtdCompleta || '0'} />

                <Text style={styles.sectionTitle}>LOCALIZAÇÃO</Text>
                <DetailItem label="Armazém" value={details.codarm} />
                <DetailItem label="Rua" value={details.rua} />
                <DetailItem label="Prédio" value={details.predio} />
                <DetailItem label="Sequência" value={details.sequencia} />
                <DetailItem label="Apto" value={details.apto} />
            </ScrollView>

            {renderActionButtons()}
        </View>
    );
};

// ... Seus estilos permanecem os mesmos
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        backgroundColor: COLORS.primary,
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
    },
    headerBackText: {
        color: COLORS.white,
        fontSize: 16,
        marginLeft: 8,
    },
    headerMainTitle: {
        color: COLORS.white,
        fontSize: 20,
        fontWeight: 'bold',
        position: 'absolute',
        left: 0,
        right: 0,
        textAlign: 'center',
        paddingTop: Platform.OS === 'android' ? 40 : 50,
    },
    scrollContainer: {
        padding: SIZES.padding,
    },
    heroCard: {
        backgroundColor: COLORS.cardBackground,
        padding: SIZES.padding * 1.5,
        borderRadius: SIZES.radius,
        alignItems: 'center',
        marginBottom: SIZES.padding * 2,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    pickedHeroCard: {
        backgroundColor: COLORS.pickingBackground,
        borderColor: COLORS.pickingBorder,
    },
    heroTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        color: COLORS.text,
    },
    heroSubtitle: {
        fontSize: 14,
        color: COLORS.textLight,
        marginTop: 5,
    },
    sectionTitle: {
        fontSize: 14,
        color: COLORS.textLight,
        fontWeight: 'bold',
        marginBottom: 10,
        textTransform: 'uppercase',
    },
    detailItem: {
        backgroundColor: COLORS.cardBackground,
        padding: SIZES.padding,
        borderRadius: SIZES.radius,
        marginBottom: 10,
    },
    detailItemLabel: {
        fontSize: 14,
        color: COLORS.textLight,
    },
    detailItemValue: {
        fontSize: 18,
        fontWeight: '500',
        color: COLORS.text,
        marginTop: 4,
    },
    actionsFooter: {
        padding: SIZES.padding,
        backgroundColor: COLORS.cardBackground,
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
    },
    actionButton: {
        flexGrow: 1,
        flexBasis: '40%',
        padding: 18,
        borderRadius: SIZES.radius,
        alignItems: 'center',
        justifyContent: 'center',
    },
    actionButtonText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: 'bold',
    },
    btnBaixar: { backgroundColor: COLORS.success },
    btnTransferir: { backgroundColor: COLORS.info },
    btnPicking: { backgroundColor: COLORS.orange },
    btnCorrecao: { backgroundColor: COLORS.warning },
});

export default DetailsScreen;