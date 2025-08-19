// components/ProfilePanel.js
import React, { useEffect, useRef } from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, Pressable, Animated, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { COLORS, SIZES } from '../constants/theme';

const { width } = Dimensions.get('window');

const ProfilePanel = ({ visible, onClose, onNavigateToHistory, onLogout }) => {
    const { userSession } = useAuth();
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
        >
            <Pressable style={styles.overlay} onPress={handleClose}>
                <Animated.View
                    style={[
                        styles.panel,
                        { width: panelWidth, transform: [{ translateX: slideAnim }] }
                    ]}
                >
                    <Pressable style={styles.panelContentContainer}>
                        <View>
                            <View style={styles.panelHeader}>
                                <View style={styles.userInfo}>
                                    <Ionicons name="person-circle" size={24} color={COLORS.primary} />
                                    <Text style={styles.userInfoText}>
                                        {userSession ? `${userSession.codusu} - ${userSession.username}` : ''}
                                    </Text>
                                </View>
                                <TouchableOpacity onPress={handleClose}>
                                    <Ionicons name="close" size={28} color={COLORS.textLight} />
                                </TouchableOpacity>
                            </View>

                            <View style={styles.panelBody}>
                                <TouchableOpacity style={styles.panelButton} onPress={onNavigateToHistory}>
                                    <Ionicons name="time-outline" size={22} color={COLORS.text} />
                                    <Text style={styles.panelButtonText}>Histórico de Operações</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={styles.panelFooter}>
                            <TouchableOpacity style={[styles.panelButton, styles.logoutButton]} onPress={onLogout}>
                                <Ionicons name="log-out-outline" size={22} color={COLORS.danger} />
                                <Text style={[styles.panelButtonText, { color: COLORS.danger }]}>Sair</Text>
                            </TouchableOpacity>
                        </View>
                    </Pressable>
                </Animated.View>
            </Pressable>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    panel: {
        height: '100%',
        backgroundColor: COLORS.cardBackground,
        position: 'absolute',
        top: 0,
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
        padding: SIZES.padding,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    userInfoText: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.primary,
    },
    panelBody: {
        padding: SIZES.padding / 2,
    },
    panelFooter: {
        padding: SIZES.padding,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
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
        color: COLORS.text,
    },
    logoutButton: {},
});

export default ProfilePanel;