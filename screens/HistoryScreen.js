// screens/HistoryScreen.js
import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { COLORS } from '../constants/theme';

const HistoryScreen = ({ navigation }) => {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>Tela de Histórico</Text>
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

export default HistoryScreen;