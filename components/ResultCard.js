// components/ResultCard.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { SIZES } from '../constants/theme';
import { formatData } from '../utils/formatter';
import AnimatedButton from './common/AnimatedButton';

const ResultCard = ({ item, onPress }) => {
    const { colors } = useTheme();
    const styles = getStyles(colors);

    const [sequencia, rua, predio, , codprod, descrprod, marca, datval, , endpic, qtdCompleta, derivacao] = item;
    
    let displayDesc = descrprod || 'Sem descrição';
    if (marca) displayDesc += ` - ${marca}`;
    if (derivacao) displayDesc += ` - ${derivacao}`;

    return (
        <AnimatedButton 
            style={[styles.card, endpic === 'S' && styles.pickingCard]}
            onPress={() => onPress(sequencia)}
        >
            <View style={styles.header}>
                <Text style={styles.textLight}>Seq: <Text style={styles.bold}>{sequencia}</Text></Text>
                <Text style={styles.textLight}>Rua: <Text style={styles.bold}>{rua}</Text></Text>
                <Text style={styles.textLight}>Prédio: <Text style={styles.bold}>{predio}</Text></Text>
            </View>
            <View style={styles.body}>
                <Text style={styles.productDesc}>{displayDesc}</Text>
            </View>
            <View style={styles.footer}>
                <Text style={styles.productCode}>Cód: {codprod}</Text>
                <Text style={styles.textLight}>Qtd: <Text style={styles.bold}>{qtdCompleta}</Text></Text>
                <Text style={styles.textLight}>Val: <Text style={styles.validity}>{formatData(datval)}</Text></Text>
            </View>
        </AnimatedButton>
    );
};

const getStyles = (colors) => StyleSheet.create({
    card: {
        backgroundColor: colors.cardBackground,
        borderRadius: SIZES.radius,
        padding: SIZES.padding,
        marginBottom: SIZES.padding,
        borderWidth: 1,
        borderColor: colors.border,
        alignItems: 'stretch',
    },
    pickingCard: {
        backgroundColor: colors.pickingBackground,
        borderColor: colors.pickingBorder,
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
    textLight: {
        color: colors.textLight,
    },
    bold: {
        fontWeight: 'bold',
        color: colors.text
    },
    productDesc: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.text,
    },
    productCode: {
        backgroundColor: colors.inputBackground,
        color: colors.textLight,
        paddingVertical: 3,
        paddingHorizontal: 8,
        borderRadius: 4,
        fontSize: 12,
        overflow: 'hidden',
    },
    validity: {
        fontWeight: '600',
        color: colors.primary
    }
});

export default ResultCard;