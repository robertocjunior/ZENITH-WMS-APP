// components/HistoryCard.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { SIZES } from '../constants/theme';

const HistoryCard = ({ item }) => {
    const { colors } = useTheme();
    const styles = getStyles(colors);

    // Mapeamento dos campos vindos do Backend (JSON)
    const {
        tipo,
        hora,
        codArm: codarm,
        seqEnd: seqend,
        armDes: armdes,
        endDes: enddes,
        codProd: codprod,
        descrProd: descrprod,
        marca,
        derivacao,
        qtdProd,     // Campo para MOV (Transferência, Picking, Baixa)
        quantAnt,    // Campo exclusivo de CORRECAO
        qtdAtual,    // Campo exclusivo de CORRECAO
        idOperacao
    } = item;

    const isCorrection = tipo === 'CORRECAO';

    let productDisplay = descrprod || 'Produto';
    if (marca) productDisplay += ` - ${marca}`;
    if (derivacao) productDisplay += ` - ${derivacao}`;

    const renderCardBody = () => {
        // CASO 1: CORREÇÃO (Usa quantAnt e qtdAtual)
        if (isCorrection) {
            return (
                <>
                    <View style={styles.locationBox}>
                        <Text style={styles.locationLabel}>Local da Correção</Text>
                        <Text style={styles.locationText}>{codarm} → {seqend}</Text>
                    </View>
                    <View style={styles.movementBox}>
                        <View style={styles.quantityBox}>
                            <Text style={styles.quantityLabel}>Qtd. Anterior</Text>
                            <Text style={[styles.quantityValue, styles.quantityBefore]}>{quantAnt}</Text>
                        </View>
                        <Ionicons name="arrow-forward" size={24} color={colors.correctionHeader || '#ef6c00'} />
                        <View style={styles.quantityBox}>
                            <Text style={styles.quantityLabel}>Qtd. Corrigida</Text>
                            <Text style={[styles.quantityValue, styles.quantityAfter]}>{qtdAtual}</Text>
                        </View>
                    </View>
                </>
            );
        }

        // CASO 2: TRANSFERÊNCIA (Tem origem e destino) - Usa qtdProd
        if (armdes && enddes) { 
            return (
                <View style={styles.movementContainer}>
                    <View style={styles.movementBox}>
                        <View style={styles.locationOriginDest}>
                            <Text style={styles.locationLabel}>Origem</Text>
                            <Text style={styles.locationText}>{codarm} → {seqend}</Text>
                        </View>
                        <Ionicons name="arrow-forward" size={24} color={colors.primary} />
                        <View style={styles.locationOriginDest}>
                            <Text style={styles.locationLabel}>Destino</Text>
                            <Text style={styles.locationText}>{armdes} → {enddes}</Text>
                        </View>
                    </View>
                    <View style={styles.singleQuantityBox}>
                         <Text style={styles.quantityLabel}>Quantidade Movida</Text>
                         <Text style={styles.quantityValue}>{qtdProd}</Text>
                    </View>
                </View>
            );
        } 
        
        // CASO 3: BAIXA ou PICKING (Apenas origem) - Usa qtdProd
        return (
            <View style={styles.locationBox}>
                <Text style={styles.locationLabel}>
                    {tipo === 'PICKING' ? 'Origem do Picking' : 'Local da Baixa'}
                </Text>
                <Text style={styles.locationText}>{codarm} → {seqend}</Text>
                
                <Text style={[styles.quantityValue, {fontSize: 16, marginTop: 5}]}>
                    Qtd: {qtdProd}
                </Text>
            </View>
        );
    };

    return (
        <View style={[styles.card, isCorrection ? styles.correctionCard : styles.operationCard]}>
            <View style={styles.cardHeader}>
                <Text style={[styles.headerId, isCorrection && styles.correctionHeaderText]}>
                    {isCorrection ? 'Correção' : tipo}: <Text style={styles.headerIdBold}>{idOperacao}</Text>
                </Text>
                <Text style={[styles.headerTime, isCorrection && styles.correctionHeaderText]}>{hora}</Text>
            </View>
            <View style={styles.cardBody}>
                <View style={styles.productInfo}>
                    <Text style={styles.productDesc}>{productDisplay}</Text>
                    <Text style={styles.productCode}>Cód: {codprod}</Text>
                </View>
                {renderCardBody()}
            </View>
        </View>
    );
};

const getStyles = (colors) => StyleSheet.create({
    card: {
        borderRadius: SIZES.radius,
        padding: SIZES.padding,
        marginBottom: SIZES.padding,
        borderWidth: 1,
    },
    operationCard: {
        backgroundColor: colors.historyBackground || colors.cardBackground, 
        borderColor: colors.historyBorder || colors.border,
    },
    correctionCard: {
        backgroundColor: colors.correctionBackground || '#fff3e0',
        borderColor: colors.correctionBorder || '#ffe0b2',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        marginBottom: 15,
    },
    headerId: {
        fontSize: 16,
        color: colors.primary,
        fontWeight: '500',
        textTransform: 'capitalize'
    },
    headerIdBold: {
        fontWeight: 'bold',
    },
    headerTime: {
        fontSize: 14,
        color: colors.textLight,
    },
    correctionHeaderText: {
        color: colors.correctionHeader || '#ef6c00',
    },
    cardBody: {
        gap: 15,
    },
    productInfo: {
        alignItems: 'center',
    },
    productDesc: {
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
        color: colors.text,
    },
    productCode: {
        fontSize: 12,
        backgroundColor: colors.inputBackground,
        paddingVertical: 2,
        paddingHorizontal: 6,
        borderRadius: 4,
        marginTop: 5,
        color: colors.textLight,
        overflow: 'hidden'
    },
    locationBox: {
        backgroundColor: colors.background,
        padding: SIZES.padding,
        borderRadius: SIZES.radius,
        alignItems: 'center',
    },
    locationLabel: {
        fontSize: 12,
        color: colors.textLight,
        marginBottom: 2,
    },
    locationText: {
        fontSize: 16,
        fontWeight: '500',
        color: colors.text,
    },
    movementContainer: {
        gap: 10
    },
    movementBox: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 5
    },
    quantityBox: {
        backgroundColor: colors.cardBackground,
        padding: 10,
        borderRadius: SIZES.radius,
        borderWidth: 1,
        borderColor: colors.border,
        alignItems: 'center',
        flex: 1,
    },
    singleQuantityBox: {
        backgroundColor: colors.background,
        padding: 8,
        borderRadius: SIZES.radius,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
        borderStyle: 'dashed'
    },
    quantityLabel: {
        fontSize: 12,
        color: colors.textLight,
    },
    quantityValue: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 2,
        color: colors.text
    },
    quantityBefore: {
        color: colors.error || '#d32f2f',
    },
    quantityAfter: {
        color: colors.success || '#388e3c',
    },
    locationOriginDest: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: colors.background,
        padding: 8,
        borderRadius: 8
    },
});

export default HistoryCard;