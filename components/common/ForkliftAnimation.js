// components/common/ForkliftAnimation.js
import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing, Dimensions, Image } from 'react-native';

const { width } = Dimensions.get('window');

const ForkliftAnimation = () => {
    // A animação moverá a empilhadeira da esquerda para a direita
    const translateX = useRef(new Animated.Value(-100)).current; // Começa fora da tela, à esquerda

    useEffect(() => {
        // A animação é um loop infinito
        Animated.loop(
            // A sequência de animação
            Animated.sequence([
                // 1. Move a empilhadeira para o centro da tela
                Animated.timing(translateX, {
                    toValue: width / 2 - 50, // Centraliza a empilhadeira (50 é metade da largura da imagem)
                    duration: 1500,
                    easing: Easing.bezier(0.42, 0, 0.58, 1), // Acelera e desacelera
                    useNativeDriver: true,
                }),
                // 2. Pausa por um momento no centro
                Animated.delay(500),
                // 3. Move a empilhadeira para o final da tela (direita)
                Animated.timing(translateX, {
                    toValue: width + 100, // Move para fora da tela, à direita
                    duration: 1500,
                    easing: Easing.bezier(0.42, 0, 0.58, 1),
                    useNativeDriver: true,
                }),
                // 4. Pausa invisível antes de reiniciar
                Animated.delay(500),
            ])
        ).start();
    }, []);

    // Reinicia a posição da empilhadeira quando ela sai da tela
    translateX.addListener(({ value }) => {
        if (value >= width + 100) {
            translateX.setValue(-100); // Reposiciona instantaneamente à esquerda
        }
    });

    return (
        <View style={styles.container}>
            <Animated.View style={{ transform: [{ translateX }] }}>
                <Image
                    source={require('../../assets/icons/forklift.png')} // Caminho para a sua imagem
                    style={styles.forklift}
                />
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    forklift: {
        width: 100, // Ajuste a largura conforme sua imagem
        height: 100, // Ajuste a altura conforme sua imagem
        resizeMode: 'contain',
    },
});

export default ForkliftAnimation;