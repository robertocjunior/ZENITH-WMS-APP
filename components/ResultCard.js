// components/ResultCard.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, SIZES } from '../constants/theme';
import { formatData } from '../utils/formatter';

const ResultCard = ({ item, onPress }) => {
    // Extraindo dados do array com base na sua estrutura
    const [sequencia, rua, predio, , codprod, descrprod, marca, datval, , endpic, qtdCompleta, derivacao] = item;
    
    let displayDesc = descrprod || 'Sem descrição';
    if (marca) displayDesc += ` - ${marca}`;
    if (derivacao) displayDesc += ` - ${derivacao}`;

    return (
        <TouchableOpacity 
            style={[styles.card, endpic === 'S' && styles.pickingCard]}
            onPress={() => onPress(sequencia)}
        >
            <View style={styles.header}>
                <Text>Seq: <Text style={styles.bold}>{sequencia}</Text></Text>
                <Text>Rua: <Text style={styles.bold}>{rua}</Text></Text>
                <Text>Prédio: <Text style={styles.bold}>{predio}</Text></Text>
            </View>
            <View style={styles.body}>
                <Text style={styles.productDesc}>{displayDesc}</Text>
            </View>
            <View style={styles.footer}>
                <Text style={styles.productCode}>Cód: {codprod}</Text>
                <Text>Qtd: <Text style={styles.bold}>{qtdCompleta}</Text></Text>
                <Text>Val: <Text style={styles.validity}>{formatData(datval)}</Text></Text>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: COLORS.cardBackground,
        borderRadius: SIZES.radius,
        padding: SIZES.padding,
        marginBottom: SIZES.padding,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    pickingCard: {
        backgroundColor: COLORS.pickingBackground,
        borderColor: COLORS.pickingBorder,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15,
    },
    body: {
        marginBottom: 15,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'baseline',
    },
    bold: {
        fontWeight: 'bold',
        color: COLORS.text
    },
    productDesc: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.text,
    },
    productCode: {
        backgroundColor: '#e9ecef',
        paddingVertical: 3,
        paddingHorizontal: 8,
        borderRadius: 4,
        fontSize: 12
    },
    validity: {
        fontWeight: '600',
        color: COLORS.primary
    }
});

export default ResultCard;