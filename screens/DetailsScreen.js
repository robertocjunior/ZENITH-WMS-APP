// screens/DetailsScreen.js
import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { COLORS } from '../constants/theme';

const DetailsScreen = ({ navigation }) => {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>Tela de Detalhes</Text>
            <Button title="Voltar" onPress={() => navigation.goBack()} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.background,
    },
    text: {
        fontSize: 22,
        color: COLORS.text,
    },
});

export default DetailsScreen;