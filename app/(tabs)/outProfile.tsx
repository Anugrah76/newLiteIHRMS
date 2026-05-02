import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Modal } from 'react-native';
import { User, Moon, Sun, Monitor, LogOut, Trophy } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { CorporateBackground } from '@shared/components/CorporateBackground';
import { TopBar } from '@shared/components/ui/TopBar';
import { Sidebar } from '@shared/components/Sidebar';
import { ThemeSwitcher } from '@shared/components/ThemeSwitcher';
import { useTheme } from '@shared/theme';
import { createCommonStyles } from '@shared/styles/commonStyles';
import { useAuthStore } from '@shared/store';
import { useToast } from '@shared/components/Toast';
import { removeToken } from '@shared/utils/auth';

export default function ProfileScreen() {
    const theme = useTheme();
    const commonStyles = createCommonStyles(theme.isDark);
    const user = useAuthStore((state) => state.user);
    const logout = useAuthStore((state) => state.logout);
    const router = useRouter();
    const toast = useToast();
    const [sidebarVisible, setSidebarVisible] = useState(false);
    const [logoutModalVisible, setLogoutModalVisible] = useState(false);

    const handleLogoutPress = () => {
        setLogoutModalVisible(true);
    };

    const handleLogout = async () => {
        await removeToken();
        logout();
        router.replace('/(auth)/submit');
    };

    return (

        <CorporateBackground>
            <View style={{ flex: 1 }}>
                <TopBar
                    title="Profile"
                    onMenuPress={() => setSidebarVisible(true)}
                    onSearchPress={() => toast.show('info', 'Search', 'Coming soon')}
                    onNotificationPress={() => toast.show('info', 'Notifications', 'Coming soon')}
                />
                <ScrollView
                    style={commonStyles.scrollContainer}
                    contentContainerStyle={{ paddingBottom: 40 }}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Profile Header */}
                    <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
                        <View style={styles.profileImageContainer}>
                            {user?.profile_photo ? (
                                <Image source={{ uri: user.profile_photo }} style={styles.profileImage} />
                            ) : (
                                <View
                                    style={[
                                        styles.profileImagePlaceholder,
                                        { backgroundColor: theme.colors.primary + '20' },
                                    ]}
                                >
                                    <User width={40} height={40} color={theme.colors.primary} />
                                </View>
                            )}
                        </View>
                        <Text style={[styles.name, { color: theme.colors.text }]}>
                            {user?.fullName || 'Employee'}
                        </Text>
                        <Text style={[styles.email, { color: theme.colors.textSecondary }]}>
                            {user?.email || ''}
                        </Text>
                        <Text style={[styles.empCode, { color: theme.colors.textTertiary }]}>
                            {user?.emp_code || ''}
                        </Text>
                    </View>

                    {/* Account Settings */}
                    <View style={commonStyles.section}>
                        <Text style={commonStyles.sectionTitle}>Account</Text>

                        <TouchableOpacity
                            style={[styles.menuItem, { backgroundColor: theme.colors.cardPrimary, borderColor: theme.colors.border }]}
                            onPress={() => router.push('/profile')}
                            activeOpacity={0.7}
                        >
                            <View style={styles.menuItemLeft}>
                                <User width={20} height={20} color={theme.colors.primary} />
                                <Text style={[styles.menuItemText, { color: theme.colors.text }]}>View Profile</Text>
                            </View>
                        </TouchableOpacity>

                        {/* <TouchableOpacity
                            style={[styles.menuItem, { backgroundColor: theme.colors.cardPrimary, borderColor: theme.colors.border, marginTop: 12 }]}
                            onPress={() => router.push('/gamification-wellness')}
                            activeOpacity={0.7}
                        >
                            <View style={styles.menuItemLeft}>
                                <Trophy width={20} height={20} color={theme.colors.primary} />
                                <Text style={[styles.menuItemText, { color: theme.colors.text }]}>Wellness & Achievements</Text>
                            </View>
                        </TouchableOpacity> */}

                        {/*  <TouchableOpacity
                        style={[styles.menuItem, { backgroundColor: theme.colors.cardPrimary, borderColor: theme.colors.border, marginTop: 12 }]}
                        onPress={() => router.push('/change-password')}
                        activeOpacity={0.7}
                    >
                        <View style={styles.menuItemLeft}>
                            <Monitor width={20} height={20} color={theme.colors.primary} />
                            <Text style={[styles.menuItemText, { color: theme.colors.text }]}>Change Password</Text>
                        </View>
                    </TouchableOpacity> */}
                    </View>

                    {/* Theme Switcher */}
                    <View style={commonStyles.section}>
                        <Text style={commonStyles.sectionTitle}>Appearance</Text>
                        <ThemeSwitcher />
                    </View>

                    {/* Logout Button */}
                    <View style={commonStyles.section}>
                        <TouchableOpacity
                            style={[
                                styles.logoutButton,
                                { backgroundColor: theme.colors.error + '10', borderColor: theme.colors.error },
                            ]}
                            onPress={handleLogoutPress}
                            activeOpacity={0.7}
                        >
                            <LogOut width={20} height={20} color={theme.colors.error} />
                            <Text style={[styles.logoutText, { color: theme.colors.error }]}>Logout</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>

                <Sidebar visible={sidebarVisible} onClose={() => setSidebarVisible(false)} />
            </View>
            <Modal
                visible={logoutModalVisible}
                transparent={true}
                animationType='slide'
                onRequestClose={() => setLogoutModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: theme.colors.background }]}>
                        <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Confirm Logout</Text>
                        <Text style={[styles.modalMessage, { color: theme.colors.textSecondary }]}>
                            Are you sure you want to logout?
                        </Text>
                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalButton, { backgroundColor: theme.colors.border }]}
                                onPress={() => setLogoutModalVisible(false)}
                            >
                                <Text style={[styles.modalButtonText, { color: theme.colors.text }]}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, { backgroundColor: theme.colors.error }]}
                                onPress={handleLogout}
                            >
                                <Text style={[styles.modalButtonText, { color: '#fff' }]}>Logout</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </CorporateBackground>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
    },
    modalContent: {
        width: '90%',
        borderRadius: 16,
        padding: 24,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 12,
    },
    modalMessage: {
        fontSize: 16,
        marginBottom: 24,
        textAlign: 'center',
    },
    modalButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    modalButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
    },
    modalButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
    header: {
        alignItems: 'center',
        paddingVertical: 32,
        paddingHorizontal: 16,
        marginBottom: 16,
    },
    profileImageContainer: {
        marginBottom: 16,
    },
    profileImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
    },
    profileImagePlaceholder: {
        width: 100,
        height: 100,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    name: {
        fontSize: 24,
        fontWeight: '700',
        marginBottom: 4,
    },
    email: {
        fontSize: 16,
        marginBottom: 4,
    },
    empCode: {
        fontSize: 14,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: 60,
        gap: 8,
    },
    logoutText: {
        fontSize: 16,
        fontWeight: '600',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
    },
    menuItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    menuItemText: {
        fontSize: 16,
        fontWeight: '500',
    },
});
