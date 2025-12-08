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

    // Desestrutura propriedades do JSON do backend
    const { 
        seqEnd,      
        codRua,      
        codPrd,      
        codProd,     
        descrProd,   
        marca,       
        datVal,      
        endPic,      
        qtdCompleta, 
        derivacao    
    } = item;
    
    let displayDesc = descrProd || 'Produto sem descrição';
    if (marca) displayDesc += ` - ${marca}`;
    if (derivacao) displayDesc += ` (${derivacao})`;

    return (
        <AnimatedButton 
            style={[styles.card, endPic === 'S' && styles.pickingCard]}
            onPress={() => onPress(seqEnd)}
        >
            <View style={styles.header}>
                <Text style={styles.textLight}>Seq: <Text style={styles.bold}>{seqEnd}</Text></Text>
                <Text style={styles.textLight}>Rua: <Text style={styles.bold}>{codRua || '-'}</Text></Text>
                <Text style={styles.textLight}>Prédio: <Text style={styles.bold}>{codPrd || '-'}</Text></Text>
            </View>
            <View style={styles.body}>
                <Text style={styles.productDesc}>{displayDesc}</Text>
            </View>
            <View style={styles.footer}>
                <Text style={styles.productCode}>Cód: {codProd}</Text>
                <Text style={styles.textLight}>Qtd: <Text style={styles.bold}>{qtdCompleta || '0'}</Text></Text>
                {datVal ? (
                     <Text style={styles.textLight}>Val: <Text style={styles.validity}>{formatData(datVal)}</Text></Text>
                ) : null}
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
        fontSize: 13,
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