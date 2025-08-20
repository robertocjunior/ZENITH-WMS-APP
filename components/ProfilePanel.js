// components/ProfilePanel.js
import React, { useEffect, useRef } from 'react';
import { View, Text, Modal, StyleSheet, Pressable, Animated, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Application from 'expo-application';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { SIZES } from '../constants/theme';
import AnimatedButton from './common/AnimatedButton';

const { width } = Dimensions.get('window');

const ProfilePanel = ({ visible, onClose, onNavigateToHistory, onLogout }) => {
    const { userSession } = useAuth();
    const { colors } = useTheme();
    const insets = useSafeAreaInsets();
    const styles = getStyles(colors, insets);

    const slideAnim = useRef(new Animated.Value(width)).current;
    const panelWidth = Math.min(width * 0.85, 320);
    const panelVisiblePosition = width - panelWidth;
    const appVersion = Application.nativeApplicationVersion;

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
                    <Pressable
                        style={styles.panelContentContainer}
                        onPress={(e) => e.stopPropagation()}
                    >
                        <View>
                            {/* -- CABEÇALHO -- */}
                            <View style={styles.header}>
                                <View style={styles.profileInfo}>
                                    <Ionicons name="person-circle" size={50} color={colors.primary} />
                                    <View>
                                        <Text style={styles.userName}>{userSession?.username || 'Usuário'}</Text>
                                        <Text style={styles.userId}>Cód: {userSession?.codusu || 'N/A'}</Text>
                                    </View>
                                </View>
                                <AnimatedButton style={styles.closeButton} onPress={handleClose}>
                                    <Ionicons name="close" size={28} color={colors.textLight} />
                                </AnimatedButton>
                            </View>

                            {/* -- CORPO (MENU) -- */}
                            <View style={styles.body}>
                                <AnimatedButton style={styles.panelButton} onPress={onNavigateToHistory}>
                                    <Ionicons name="time-outline" size={22} color={colors.text} />
                                    <Text style={styles.panelButtonText}>Histórico de Operações</Text>
                                </AnimatedButton>
                            </View>
                        </View>

                        {/* -- RODAPÉ -- */}
                        <View style={styles.footer}>
                            <AnimatedButton style={[styles.panelButton, styles.logoutButton]} onPress={onLogout}>
                                <Ionicons name="log-out-outline" size={22} color={colors.danger} />
                                <Text style={[styles.panelButtonText, { color: colors.danger }]}>Sair</Text>
                            </AnimatedButton>
                            <Text style={styles.versionText}>Versão {appVersion}</Text>
                        </View>
                    </Pressable>
                </Animated.View>
            </Pressable>
        </Modal>
    );
};

const getStyles = (colors, insets) => StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    panel: {
        height: '100%',
        backgroundColor: colors.cardBackground,
        position: 'absolute',
        top: 0,
        left: 0,
    },
    panelContentContainer: {
        flex: 1,
        justifyContent: 'space-between',
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
    },
    header: {
        padding: SIZES.padding * 1.5,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    profileInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
    },
    userName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.text,
    },
    userId: {
        fontSize: 14,
        color: colors.textLight,
    },
    closeButton: {
        padding: 5,
    },
    body: {
        paddingHorizontal: SIZES.padding,
        marginTop: SIZES.padding,
    },
    panelButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SIZES.padding,
        borderRadius: SIZES.radius,
        gap: 15,
        backgroundColor: colors.background, // Fundo sutil para os botões
    },
    panelButtonText: {
        fontSize: 16,
        color: colors.text,
        fontWeight: '500',
    },
    footer: {
        padding: SIZES.padding,
        alignItems: 'center',
    },
    logoutButton: {
        backgroundColor: colors.danger_light, // Um fundo vermelho claro para o botão de sair
        width: '100%',
    },
    versionText: {
        marginTop: SIZES.padding * 1.5,
        fontSize: 12,
        color: colors.textLight,
    },
});

export default ProfilePanel;