// components/common/LoadingOverlay.js
import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet, Modal } from 'react-native';
import { COLORS } from '../../constants/theme';

const LoadingOverlay = ({ visible }) => (
    <Modal transparent={true} animationType="none" visible={visible}>
        <View style={styles.overlay}>
            <View style={styles.container}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.text}>Carregando...</Text>
            </View>
        </View>
    </Modal>
);

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    container: {
        backgroundColor: COLORS.white,
        padding: 30,
        borderRadius: 10,
        alignItems: 'center',
    },
    text: {
        marginTop: 15,
        fontSize: 16,
        color: COLORS.text,
    },
});

export default LoadingOverlay;