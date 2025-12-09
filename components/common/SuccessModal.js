// components/common/SuccessModal.js
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Modal, StyleSheet, Animated, Easing } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { SIZES } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import AnimatedButton from './AnimatedButton';

const AUTO_CLOSE_DURATION = 2000; // 1.5 segundos

const SuccessModal = ({ visible, title, message, onClose }) => {
    const { colors } = useTheme();
    const styles = getStyles(colors);

    const [isModalVisible, setIsModalVisible] = useState(visible);
    
    // Animações de Entrada/Saída do Modal
    const modalOpacity = useRef(new Animated.Value(0)).current;
    const modalScale = useRef(new Animated.Value(0.9)).current;
    
    // Animação de Progresso do Botão
    const progress = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        let timerAnimation;

        if (visible) {
            setIsModalVisible(true);
            progress.setValue(0); // Reseta a barra

            // 1. Animação de Entrada
            Animated.parallel([
                Animated.timing(modalOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
                Animated.spring(modalScale, { toValue: 1, friction: 6, useNativeDriver: true })
            ]).start();

            // 2. Inicia o Timer visual no botão
            timerAnimation = Animated.timing(progress, {
                toValue: 1,
                duration: AUTO_CLOSE_DURATION,
                easing: Easing.linear,
                useNativeDriver: false // Width não suporta native driver
            });

            timerAnimation.start(({ finished }) => {
                // Se a animação terminou sozinha (ninguém clicou), fecha o modal
                if (finished) {
                    handleClose();
                }
            });

        } else {
            // Animação de Saída
            Animated.parallel([
                 Animated.timing(modalOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
                 Animated.timing(modalScale, { toValue: 0.9, duration: 200, useNativeDriver: true })
            ]).start(() => {
                setIsModalVisible(false);
            });
        }

        return () => {
            if (timerAnimation) timerAnimation.stop();
        };
    }, [visible]);

    const handleClose = () => {
        // Para a animação atual se for clique manual e chama o onClose
        progress.stopAnimation(); 
        onClose();
    };

    // Interpolação para a largura da barra de progresso (0% a 100%)
    const progressWidth = progress.interpolate({
        inputRange: [0, 1],
        outputRange: ['0%', '100%']
    });

    return (
        <Modal
            animationType="none"
            transparent={true}
            visible={isModalVisible}
            onRequestClose={handleClose}
            statusBarTranslucent={true}
        >
            <Animated.View style={[styles.overlay, { opacity: modalOpacity }]}>
                <Animated.View style={[styles.modalContent, { transform: [{ scale: modalScale }] }]}>
                    
                    <View style={styles.iconContainer}>
                        <Ionicons name="checkmark-circle" size={64} color={colors.success} />
                    </View>
                    
                    <Text style={styles.title}>{title}</Text>
                    <Text style={styles.message}>{message}</Text>
                    
                    <View style={styles.buttonRow}>
                        <AnimatedButton 
                            style={[styles.button, styles.confirmButton]} 
                            onPress={handleClose}
                            activeOpacity={0.9}
                        >
                            {/* Barra de Progresso (Fundo) */}
                            <Animated.View 
                                style={[
                                    styles.progressBar, 
                                    { width: progressWidth }
                                ]} 
                            />
                            
                            {/* Texto (Frente) */}
                            <Text style={styles.buttonText}>OK</Text>
                        </AnimatedButton>
                    </View>
                </Animated.View>
            </Animated.View>
        </Modal>
    );
};

const getStyles = (colors) => StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        width: '100%',
        maxWidth: 340, // Largura um pouco menor para ficar mais elegante
        backgroundColor: colors.cardBackground,
        borderRadius: 20, // Bordas mais arredondadas
        paddingVertical: 30,
        paddingHorizontal: 20,
        alignItems: 'center',
        elevation: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
    },
    iconContainer: {
        marginBottom: 15,
        // Opcional: Sombra no ícone
        shadowColor: colors.success,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 10,
        elevation: 5,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 10,
        textAlign: 'center',
    },
    message: {
        fontSize: 16,
        color: colors.textLight,
        textAlign: 'center',
        marginBottom: 30,
        lineHeight: 22,
    },
    buttonRow: {
        width: '100%',
        alignItems: 'center', // Centraliza o botão
    },
    button: {
        width: '100%',
        height: 50,
        borderRadius: 25, // Botão pílula
        overflow: 'hidden', // Importante para a barra de progresso não vazar
        backgroundColor: colors.inputBackground, // Cor de fundo do "trilho"
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        borderWidth: 1,
        borderColor: colors.primary,
    },
    confirmButton: {
        // Removemos o background fixo aqui para usar o progress bar
    },
    progressBar: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        backgroundColor: colors.primary, // A cor que vai preencher
        opacity: 0.8, // Leve transparência para dar um efeito bonito
    },
    buttonText: {
        color: colors.text, // Começa com a cor do texto normal (contraste com inputBackground)
        // Se quiser que o texto fique branco quando cheio, precisaria de uma técnica de mascara complexa,
        // mas usar uma cor que contraste com ambos (ex: Branco com sombra ou Preto) resolve.
        // Vamos forçar branco se o primary for escuro, ou usar zIndex.
        color: colors.text, // Ajuste para 'white' se seu primary for escuro e inputBackground claro
        fontSize: 16,
        fontWeight: 'bold',
        zIndex: 1, // Garante que o texto fique sobre a barra
        // Pequena sombra para garantir leitura em qualquer fundo
        textShadowColor: 'rgba(0,0,0,0.1)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 1
    },
});

export default SuccessModal;