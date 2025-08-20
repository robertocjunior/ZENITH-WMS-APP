// components/common/WmsLoadingAnimation.js
import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing, Dimensions, Image } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

const { width } = Dimensions.get('window');
const FORKLIFT_SIZE = 100;
const ANIMATION_DURATION = 3000;
const LETTER_SPACING = 8;

const WmsLoadingAnimation = () => {
    const { colors } = useTheme(); 
    const translateX = useRef(new Animated.Value(-FORKLIFT_SIZE)).current;
    const pulseAnimation = useRef(new Animated.Value(1)).current;
    const forkliftOpacity = useRef(new Animated.Value(1)).current;
    const appName = "ZENITH";
    const letters = appName.split('');

    useEffect(() => {
        const forkliftAnim = Animated.sequence([
            Animated.timing(translateX, {
                toValue: width,
                duration: ANIMATION_DURATION,
                easing: Easing.linear,
                useNativeDriver: true,
            }),
            Animated.timing(forkliftOpacity, {
                toValue: 0,
                duration: 0,
                useNativeDriver: true,
            }),
        ]);
        
        forkliftAnim.start();

        let pulseAnim;
        const pulseTimeout = setTimeout(() => {
            pulseAnim = Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnimation, {
                        toValue: 1.05,
                        duration: 600,
                        easing: Easing.inOut(Easing.ease),
                        useNativeDriver: true,
                    }),
                    Animated.timing(pulseAnimation, {
                        toValue: 1,
                        duration: 600,
                        easing: Easing.inOut(Easing.ease),
                        useNativeDriver: true,
                    }),
                ])
            );
            pulseAnim.start();
        }, ANIMATION_DURATION);

        return () => {
            clearTimeout(pulseTimeout);
            forkliftAnim.stop();
            if (pulseAnim) {
                pulseAnim.stop();
            }
        };
    }, []);

    const createLetterAnimation = (index) => {
        const letterSpacing = 20;
        const nameWidth = letters.length * letterSpacing;
        const nameStartPosition = (width / 2) - (nameWidth / 2);
        const letterStartPosition = nameStartPosition + (index * letterSpacing);

        const opacity = translateX.interpolate({
            inputRange: [letterStartPosition - FORKLIFT_SIZE, letterStartPosition - FORKLIFT_SIZE / 2],
            outputRange: [0, 1],
            extrapolate: 'clamp',
        });

        const translateY = translateX.interpolate({
            inputRange: [letterStartPosition - FORKLIFT_SIZE, letterStartPosition - FORKLIFT_SIZE / 2],
            outputRange: [10, 0],
            extrapolate: 'clamp',
        });

        return { opacity, transform: [{ translateY }] };
    };
    
    const styles = getStyles(colors);

    return (
        <View style={styles.container}>
            <Image
                source={colors.logo512x512}
                style={styles.logo}
            />
            
            {/* CORREÇÃO AQUI: 'a.animationArea' foi trocado por 'styles.animationArea' */}
            <View style={styles.animationArea}>
                <Animated.View style={[styles.nameContainer, { transform: [{ scale: pulseAnimation }] }]}>
                    {letters.map((letter, index) => (
                        <Animated.Text 
                            key={index} 
                            style={[
                                styles.nameText, 
                                createLetterAnimation(index),
                                (letter !== 'I' && index < letters.length - 1) && { marginRight: LETTER_SPACING }
                            ]}
                        >
                            {letter}
                        </Animated.Text>
                    ))}
                </Animated.View>

                <Animated.View style={[styles.forkliftContainer, { opacity: forkliftOpacity, transform: [{ translateX }] }]}>
                    <Image
                        source={colors.Forklift}
                        style={styles.forklift}
                    />
                </Animated.View>
            </View>
        </View>
    );
};

const getStyles = (colors) => StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
    },
    logo: {
        width: 120,
        height: 120,
        resizeMode: 'contain',
        marginBottom: 40,
    },
    animationArea: {
        height: FORKLIFT_SIZE,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    nameContainer: {
        flexDirection: 'row',
    },
    nameText: {
        fontFamily: 'Zenith-Regular',
        fontSize: 42,
        color: colors.LoadingName, 
        width: 25,
        textAlign: 'center',
    },
    forkliftContainer: {
        position: 'absolute',
    },
    forklift: {
        width: FORKLIFT_SIZE,
        height: FORKLIFT_SIZE,
        resizeMode: 'contain',
    },
});

export default WmsLoadingAnimation;