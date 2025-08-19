// components/HistoryCard.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants/theme';

const HistoryCard = ({ item }) => {
    const [tipo, , hora, codarm, seqend, armdes, enddes, codprod, descrprod, marca, derivacao, quantAnt, qtdAtual, idOperacao] = item;

    const isCorrection = tipo === 'CORRECAO';

    let productDisplay = descrprod || 'Produto';
    if (marca) productDisplay += ` - ${marca}`;
    if (derivacao) productDisplay += ` - ${derivacao}`;

    const renderCardBody = () => {
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
                        <Ionicons name="arrow-forward" size={24} color={isCorrection ? COLORS.correctionHeader : COLORS.primary} />
                        <View style={styles.quantityBox}>
                            <Text style={styles.quantityLabel}>Qtd. Corrigida</Text>
                            <Text style={[styles.quantityValue, styles.quantityAfter]}>{qtdAtual}</Text>
                        </View>
                    </View>
                </>
            );
        }

        if (armdes && enddes) { // Transferência
            return (
                <View style={styles.movementBox}>
                    <View style={styles.locationOriginDest}>
                        <Text style={styles.locationLabel}>Origem</Text>
                        <Text style={styles.locationText}>{codarm} → {seqend}</Text>
                    </View>
                    <Ionicons name="arrow-forward" size={24} color={COLORS.primary} />
                    <View style={styles.locationOriginDest}>
                        <Text style={styles.locationLabel}>Destino</Text>
                        <Text style={styles.locationText}>{armdes} → {enddes}</Text>
                    </View>
                </View>
            );
        } else { // Baixa
            return (
                <View style={styles.locationBox}>
                    <Text style={styles.locationLabel}>Local da Baixa</Text>
                    <Text style={styles.locationText}>{codarm} → {seqend}</Text>
                </View>
            );
        }
    };

    return (
        <View style={[styles.card, isCorrection ? styles.correctionCard : styles.operationCard]}>
            <View style={styles.cardHeader}>
                <Text style={[styles.headerId, isCorrection && styles.correctionHeaderText]}>
                    {isCorrection ? 'Correção' : 'Operação'}: <Text style={styles.headerIdBold}>{idOperacao}</Text>
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

const styles = StyleSheet.create({
    card: {
        borderRadius: SIZES.radius,
        padding: SIZES.padding,
        marginBottom: SIZES.padding,
        borderWidth: 1,
    },
    operationCard: {
        backgroundColor: COLORS.historyBackground,
        borderColor: COLORS.historyBorder,
    },
    correctionCard: {
        backgroundColor: COLORS.correctionBackground,
        borderColor: COLORS.correctionBorder,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
        marginBottom: 15,
    },
    headerId: {
        fontSize: 16,
        color: COLORS.primary,
        fontWeight: '500',
    },
    headerIdBold: {
        fontWeight: 'bold',
    },
    headerTime: {
        fontSize: 14,
        color: COLORS.textLight,
    },
    correctionHeaderText: {
        color: COLORS.correctionHeader,
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
        color: COLORS.text,
    },
    productCode: { // <-- ALTERAÇÕES AQUI
        fontSize: 12,
        backgroundColor: COLORS.inputBackground,
        paddingVertical: 2,
        paddingHorizontal: 6,
        borderRadius: 4,
        marginTop: 5,
        color: COLORS.textLight,
        overflow: 'hidden'
    },
    locationBox: { // <-- ALTERAÇÕES AQUI
        backgroundColor: COLORS.background,
        padding: SIZES.padding,
        borderRadius: SIZES.radius,
        alignItems: 'center',
    },
    locationLabel: {
        fontSize: 12,
        color: COLORS.textLight,
        marginBottom: 2,
    },
    locationText: {
        fontSize: 16,
        fontWeight: '500',
        color: COLORS.text,
    },
    movementBox: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    quantityBox: {
        backgroundColor: COLORS.cardBackground,
        padding: SIZES.padding,
        borderRadius: SIZES.radius,
        borderWidth: 1,
        borderColor: COLORS.border,
        alignItems: 'center',
        flex: 1,
    },
    quantityLabel: {
        fontSize: 12,
        color: COLORS.textLight,
    },
    quantityValue: {
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 2,
    },
    quantityBefore: {
        color: COLORS.danger,
    },
    quantityAfter: {
        color: COLORS.success,
    },
    locationOriginDest: {
        flex: 1,
        alignItems: 'center',
    },
});

export default HistoryCard;