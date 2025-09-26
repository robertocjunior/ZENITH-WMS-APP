// screens/DetailsScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as api from '../api';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { SIZES } from '../constants/theme';
import { formatData } from '../utils/formatter';
import LoadingOverlay from '../components/common/LoadingOverlay';
import BaixaModal from '../components/modals/BaixaModal';
import TransferModal from '../components/modals/TransferModal';
import PickingModal from '../components/modals/PickingModal';
import CorrecaoModal from '../components/modals/CorrecaoModal';
import AnimatedButton from '../components/common/AnimatedButton';
import SuccessModal from '../components/common/SuccessModal';
import ErrorModal from '../components/common/ErrorModal';

const DetailsScreen = () => {
    const { colors } = useTheme();
    const insets = useSafeAreaInsets();
    const styles = getStyles(colors, insets);
    const route = useRoute();
    const navigation = useNavigation();
    const { permissions, handleApiError, warehouses } = useAuth();
    
    const { sequencia, codArm, filter } = route.params;

    const [loading, setLoading] = useState(true);
    const [details, setDetails] = useState(null);
    const [isBaixaModalVisible, setBaixaModalVisible] = useState(false);
    const [isTransferModalVisible, setTransferModalVisible] = useState(false);
    const [isPickingModalVisible, setPickingModalVisible] = useState(false);
    const [isCorrecaoModalVisible, setCorrecaoModalVisible] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [validationError, setValidationError] = useState(null);

    const DetailItem = ({ label, value }) => (
        <View style={styles.detailItem}>
            <Text style={styles.detailItemLabel}>{label}</Text>
            <Text style={styles.detailItemValue}>{value}</Text>
        </View>
    );

    useEffect(() => {
        const loadScreenData = async () => {
            if (!codArm || !sequencia) return;
            setLoading(true);
            try {
                const detailsData = await api.fetchItemDetails(String(codArm), sequencia);
                const [codarm, seq, rua, predio, apto, codprod, descrprod, marca, datval, quantidade, endpic, qtdCompleta, derivacao] = detailsData;
                setDetails({ codarm, sequencia: seq, rua, predio, apto, codprod, descrprod, marca, datval, quantidade, endpic, qtdCompleta, derivacao });
            } catch (err) {
                handleApiError(err); // Não precisa de retry aqui
                setError("Não foi possível carregar os dados do item.");
            } finally {
                setLoading(false);
            }
        };
        loadScreenData();
    }, [codArm, sequencia]);
    
    const closeErrorAndGoBack = () => {
        setError(null);
        navigation.goBack();
    }
    
    const clearValidationError = () => {
        setValidationError(null);
    }

    const closeSuccessAndRefresh = () => {
        setSuccess(null);
        navigation.navigate('Main', { refresh: true, warehouseValue: details.codarm, filter });
    }

    const handleConfirmBaixa = async (quantity) => {
        setBaixaModalVisible(false);
        setLoading(true);

        const doRequest = async () => {
            const payload = { codarm: details.codarm, sequencia: details.sequencia, quantidade: quantity };
            const result = await api.executeTransaction('baixa', payload);
            setSuccess(result.message || "Baixa realizada com sucesso!");
        };

        try {
            await doRequest();
        } catch (error) {
            handleApiError(error, doRequest);
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmTransfer = async (transferData) => {
        setTransferModalVisible(false);
        setLoading(true);
        
        const doRequest = async () => {
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
            setSuccess(result.message || "Transferência realizada com sucesso!");
        };

        try {
            await doRequest();
        } catch (error) {
            handleApiError(error, doRequest);
        } finally {
            setLoading(false);
        }
    };
    
    const handleConfirmPicking = async (pickingData) => {
        setPickingModalVisible(false);
        setLoading(true);

        const doRequest = async () => {
            const payload = {
                origem: details,
                destino: {
                    armazemDestino: details.codarm,
                    enderecoDestino: pickingData.destinationSequence,
                    quantidade: pickingData.quantity
                }
            };
            const result = await api.executeTransaction('picking', payload);
            setSuccess(result.message || "Movido para picking com sucesso!");
        };

        try {
            await doRequest();
        } catch (error) {
            handleApiError(error, doRequest);
        } finally {
            setLoading(false);
        }
    };
    
    const handleConfirmCorrecao = async (newQuantity) => {
        setCorrecaoModalVisible(false);
        setLoading(true);
        
        const doRequest = async () => {
            const payload = {
                codarm: details.codarm,
                sequencia: details.sequencia,
                newQuantity: newQuantity
            };
            const result = await api.executeTransaction('correcao', payload);
            setSuccess(result.message || "Quantidade corrigida com sucesso!");
        };

        try {
            await doRequest();
        } catch (error) {
            handleApiError(error, doRequest);
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
                {showBaixa && <AnimatedButton style={[styles.actionButton, styles.btnBaixar]} onPress={() => setBaixaModalVisible(true)}><Text style={styles.actionButtonText}>Baixar</Text></AnimatedButton>}
                {permissions.transfer && <AnimatedButton style={[styles.actionButton, styles.btnTransferir]} onPress={() => setTransferModalVisible(true)}><Text style={styles.actionButtonText}>Transferir</Text></AnimatedButton>}
                {showPicking && <AnimatedButton style={[styles.actionButton, styles.btnPicking]} onPress={() => setPickingModalVisible(true)}><Text style={styles.actionButtonText}>Picking</Text></AnimatedButton>}
                {permissions.corre && <AnimatedButton style={[styles.actionButton, styles.btnCorrecao]} onPress={() => setCorrecaoModalVisible(true)}><Text style={styles.actionButtonText}>Correção</Text></AnimatedButton>}
            </View>
        );
    };

    if (loading || !details) {
        return (
            <View style={{ flex: 1, backgroundColor: colors.background }}>
                <LoadingOverlay visible={loading} />
                <ErrorModal visible={!!error} errorMessage={error} onClose={closeErrorAndGoBack} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <SuccessModal
                visible={!!success}
                title="Sucesso!"
                message={success}
                onClose={closeSuccessAndRefresh}
            />
            <ErrorModal
                visible={!!error}
                errorMessage={error}
                onClose={closeErrorAndGoBack}
            />
            <ErrorModal
                visible={!!validationError}
                errorMessage={validationError}
                onClose={clearValidationError}
            />

            <BaixaModal
                visible={isBaixaModalVisible}
                onClose={() => setBaixaModalVisible(false)}
                onConfirm={handleConfirmBaixa}
                itemDetails={details}
                onValidationError={setValidationError}
            />
            <TransferModal
                visible={isTransferModalVisible}
                onClose={() => setTransferModalVisible(false)}
                onConfirm={handleConfirmTransfer}
                itemDetails={details}
                warehouses={warehouses}
                permissions={permissions}
                onValidationError={setValidationError}
            />
            <PickingModal
                visible={isPickingModalVisible}
                onClose={() => setPickingModalVisible(false)}
                onConfirm={handleConfirmPicking}
                itemDetails={details}
                onValidationError={setValidationError}
            />
            <CorrecaoModal
                visible={isCorrecaoModalVisible}
                onClose={() => setCorrecaoModalVisible(false)}
                onConfirm={handleConfirmCorrecao}
                itemDetails={details}
            />
            
            <View style={styles.header}>
                <AnimatedButton style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color={colors.white} />
                    <Text style={styles.headerBackText}>Voltar</Text>
                </AnimatedButton>
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
const getStyles = (colors, insets) => StyleSheet.create({
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
    scrollContainer: {
        padding: SIZES.padding,
        paddingBottom: SIZES.padding * 2,
    },
    heroCard: {
        backgroundColor: colors.cardBackground,
        padding: SIZES.padding * 1.5,
        borderRadius: SIZES.radius,
        alignItems: 'center',
        marginBottom: SIZES.padding * 2,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    pickedHeroCard: {
        backgroundColor: colors.pickingBackground,
        borderColor: colors.pickingBorder,
    },
    heroTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        color: colors.text,
    },
    heroSubtitle: {
        fontSize: 14,
        color: colors.textLight,
        marginTop: 5,
    },
    sectionTitle: {
        fontSize: 14,
        color: colors.textLight,
        fontWeight: 'bold',
        marginBottom: 10,
        textTransform: 'uppercase',
    },
    detailItem: {
        backgroundColor: colors.cardBackground,
        padding: SIZES.padding,
        borderRadius: SIZES.radius,
        marginBottom: 10,
    },
    detailItemLabel: {
        fontSize: 14,
        color: colors.textLight,
    },
    detailItemValue: {
        fontSize: 18,
        fontWeight: '500',
        color: colors.text,
        marginTop: 4,
    },
    actionsFooter: {
        padding: SIZES.padding,
        paddingBottom: SIZES.padding + insets.bottom,
        backgroundColor: colors.cardBackground,
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        borderTopWidth: 1,
        borderTopColor: colors.border,
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
        color: colors.white,
        fontSize: 16,
        fontWeight: 'bold',
    },
    btnBaixar: { backgroundColor: colors.success },
    btnTransferir: { backgroundColor: colors.info },
    btnPicking: { backgroundColor: colors.orange },
    btnCorrecao: { backgroundColor: colors.warning },
});

export default DetailsScreen;