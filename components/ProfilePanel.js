// components/ProfilePanel.js
import React, { useEffect, useRef } from 'react';
import { View, Text, Modal, StyleSheet, Pressable, Animated, Dimensions } from 'react-native';
// 1. Importar o hook 'useSafeAreaInsets'
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { SIZES } from '../constants/theme';
import AnimatedButton from './common/AnimatedButton';

const { width } = Dimensions.get('window');

const ProfilePanel = ({ visible, onClose, onNavigateToHistory, onLogout }) => {
    const { userSession } = useAuth();
    const { colors } = useTheme();
    // 2. Obter os valores da área segura
    const insets = useSafeAreaInsets();
    const styles = getStyles(colors);

    const slideAnim = useRef(new Animated.Value(width)).current;
    const panelWidth = Math.min(width * 0.85, 320);
    const panelVisiblePosition = width - panelWidth;

    useEffect(() => {
        if (visible) {
            Animated.timing(slideAnim, {
                toValue: panelVisiblePosition,
                duration: 300,
                useNativeDriver: true,
            }).start();
        }
    }, [visible]);

    const handleClose = () => {
        Animated.timing(slideAnim, {
            toValue: width,
            duration: 300,
            useNativeDriver: true,
        }).start(() => {
            onClose();
        });
    };

    if (!visible) {
        return null;
    }

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={handleClose}
            statusBarTranslucent={true}
        >
            <Pressable style={styles.overlay} onPress={handleClose}>
                <Animated.View
                    style={[
                        styles.panel,
                        { width: panelWidth, transform: [{ translateX: slideAnim }] }
                    ]}
                >
                    {/* 3. Aplicar os valores de 'insets' como padding no container do conteúdo */}
                    <Pressable
                        style={[
                            styles.panelContentContainer,
                            {
                                paddingTop: insets.top,
                                paddingBottom: insets.bottom,
                            }
                        ]}
                        onPress={(e) => e.stopPropagation()}
                    >
                        <View>
                            <View style={styles.panelHeader}>
                                <View style={styles.userInfo}>
                                    <Ionicons name="person-circle" size={24} color={colors.primary} />
                                    <Text style={styles.userInfoText}>
                                        {userSession ? `${userSession.codusu} - ${userSession.username}` : ''}
                                    </Text>
                                </View>
                                <AnimatedButton onPress={handleClose}>
                                    <Ionicons name="close" size={28} color={colors.textLight} />
                                </AnimatedButton>
                            </View>

                            <View style={styles.panelBody}>
                                <AnimatedButton style={styles.panelButton} onPress={onNavigateToHistory}>
                                    <Ionicons name="time-outline" size={22} color={colors.text} />
                                    <Text style={styles.panelButtonText}>Histórico de Operações</Text>
                                </AnimatedButton>
                            </View>
                        </View>

                        <View style={styles.panelFooter}>
                            <AnimatedButton style={styles.panelButton} onPress={onLogout}>
                                <Ionicons name="log-out-outline" size={22} color={colors.danger} />
                                <Text style={[styles.panelButtonText, { color: colors.danger }]}>Sair</Text>
                            </AnimatedButton>
                        </View>
                    </Pressable>
                </Animated.View>
            </Pressable>
        </Modal>
    );
};

const getStyles = (colors) => StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    panel: {
        height: '100%',
        backgroundColor: colors.cardBackground,
        position: 'absolute',
        top: 0,
        // *** ALTERAÇÃO REVERTIDA: Voltando para 'left: 0' como era no seu original ***
        left: 0,
    },
    panelContentContainer: {
        flex: 1,
        justifyContent: 'space-between',
    },
    panelHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: SIZES.padding,
        paddingTop: SIZES.padding,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        // Adicionado para evitar que o nome de usuário empurre o botão de fechar
        flexShrink: 1,
    },
    userInfoText: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.primary,
        flexShrink: 1,
    },
    panelBody: {
        padding: SIZES.padding / 2,
    },
    panelFooter: {
        paddingHorizontal: SIZES.padding,
        paddingBottom: SIZES.padding,
    },
    panelButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SIZES.padding,
        borderRadius: SIZES.radius,
        gap: 15,
    },
    panelButtonText: {
        fontSize: 16,
        color: colors.text,
    },
});

export default ProfilePanel;