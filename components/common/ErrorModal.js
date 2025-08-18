// components/common/ErrorModal.js
import React from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, ScrollView, useWindowDimensions } from 'react-native';
import RenderHTML from 'react-native-render-html';
import { COLORS, SIZES } from '../../constants/theme';

const ErrorModal = ({ visible, onClose, errorMessage }) => {
    const { width } = useWindowDimensions();

    const tagsStyles = {
        body: {
            whiteSpace: 'normal',
            color: COLORS.textLight,
        },
        p: {
            marginVertical: 5,
        },
        b: {
            fontWeight: 'bold',
            color: COLORS.text,
        }
    };

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.modalContent}>
                    <Text style={styles.title}>Erro na Baixa</Text>
                    <ScrollView style={styles.scroll}>
                        <RenderHTML
                            contentWidth={width - (SIZES.padding * 4)} // Subtrai o padding do modal
                            source={{ html: errorMessage || '' }}
                            tagsStyles={tagsStyles}
                        />
                    </ScrollView>
                    <TouchableOpacity style={styles.button} onPress={onClose}>
                        <Text style={styles.buttonText}>OK</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        width: '100%',
        maxHeight: '80%',
        backgroundColor: COLORS.cardBackground,
        borderRadius: SIZES.radius,
        padding: SIZES.padding * 1.5,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 15,
    },
    scroll: {
        marginBottom: 20,
    },
    button: {
        backgroundColor: COLORS.primary,
        paddingVertical: 12,
        borderRadius: SIZES.radius,
        alignItems: 'center',
    },
    buttonText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: '500',
    },
});

export default ErrorModal;