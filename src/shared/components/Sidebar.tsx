import React from 'react';
import {
    Modal,
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    Dimensions,
} from 'react-native';
import {
    Home,
    X,
    User,
    ChevronRight,
    Fingerprint,
    ListTodo,
    ClipboardCheck,
    Ticket,
    PlaneTakeoff,
    ScrollText,
    SquareMenu,
    IdCard,
    Calendar,
    MapPin,
    BarChart3,
    MessagesSquare,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@shared/theme';
import { useAuthStore } from '@shared/store';
import Constants from 'expo-constants';

interface SidebarProps {
    visible: boolean;
    onClose: () => void;
}

/**
 * Sidebar Drawer Component
 * Professional navigation menu with user profile
 */
export const Sidebar: React.FC<SidebarProps> = ({ visible, onClose }) => {
    const router = useRouter();
    const theme = useTheme();
    const user = useAuthStore((state) => state.user);
    const appVersion = Constants.expoConfig?.version || '1.0.0';

    const menuItems = [
        { icon: User, label: 'Profile', route: '/profile' },
        { icon: Calendar, label: 'Attendance Management', route: '/attendance-options' },
        //  { icon: MapPin, label: 'Trip Tracking', route: '/trip-tracking' },
        //{ icon: BarChart3, label: 'Analytics', route: '/analytics' },
        { icon: ListTodo, label: 'Time Sheet', route: '/timesheet' },
        { icon: ClipboardCheck, label: 'Staff Management', route: '/staff-management' },
        { icon: Ticket, label: 'Support', route: '/ticket-hub' },
        { icon: PlaneTakeoff, label: 'BTA Management', route: '/bta-hub' },
        { icon: ScrollText, label: 'Dependents', route: '/dependents' },
        { icon: SquareMenu, label: 'Other Options', route: '/miscellaneous-hub' },
        { icon: IdCard, label: 'Visitor Notification', route: '/visitors' },
        // { icon: MessagesSquare, label: 'Chat', route: '/chat' },
    ];

    const handleNavigation = (route: string) => {
        router.push(route as any);
        onClose();
    };

    if (!visible) return null;

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
            statusBarTranslucent
        >
            <View style={styles.overlay}>
                {/* Overlay Background */}
                <TouchableOpacity
                    style={styles.overlayTouchable}
                    activeOpacity={1}
                    onPress={onClose}
                />

                {/* Sidebar */}
                <View style={[styles.sidebar, { backgroundColor: theme.colors.surface }]}>
                    {/* Header */}


                    <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
                        <TouchableOpacity
                            onPress={() => handleNavigation('/')}
                            style={[styles.closeButton, { borderBottomColor: theme.colors.surfaceVariant }]}>
                            <Home width={25} height={24} color={theme.colors.text} />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.closeButton, { backgroundColor: theme.colors.surfaceVariant }]}
                            onPress={onClose}
                            activeOpacity={0.7}
                        >
                            <X width={24} height={24} color={theme.colors.text} />
                        </TouchableOpacity>
                    </View>

                    {/* Profile Section */}
                    <View style={[styles.profileSection, {
                        borderBottomColor: theme.colors.border,
                        backgroundColor: theme.isDark ? theme.colors.surfaceVariant : '#FAFAFA'
                    }]}>
                        <View style={styles.profileImageContainer}>
                            <Image
                                source={
                                    user?.profile_photo
                                        ? { uri: user.profile_photo }
                                        : require('../../../assets/images/default-pfp.png')
                                }
                                style={[styles.profileImage, { borderColor: theme.colors.surface }]}
                            />
                            <View style={styles.onlineIndicator} />
                        </View>

                        <Text style={[styles.profileName, { color: theme.colors.text }]}>
                            {user?.fullName || 'Employee Name'}
                        </Text>

                        <View style={[styles.profileBadge, { backgroundColor: theme.colors.success + '20' }]}>
                            <User width={12} height={12} color={theme.colors.success} />
                            <Text style={[styles.profileBadgeText, { color: theme.colors.success }]}>
                                {user?.emp_code || 'EMP-CODE'}
                            </Text>
                        </View>
                    </View>

                    {/* Menu Items */}
                    <ScrollView
                        style={styles.menuContainer}
                        contentContainerStyle={styles.menuContent}
                        showsVerticalScrollIndicator={false}
                    >
                        {menuItems.map((item, index) => (
                            <TouchableOpacity
                                key={index}
                                style={[styles.menuItem, { borderBottomColor: theme.colors.border }]}
                                onPress={() => handleNavigation(item.route)}
                                activeOpacity={0.7}
                            >
                                <View style={[styles.menuIcon, { backgroundColor: theme.colors.surfaceVariant }]}>
                                    <item.icon width={20} height={20} color={theme.colors.textSecondary} />
                                </View>
                                <Text style={[styles.menuLabel, { color: theme.colors.text }]}>
                                    {item.label}
                                </Text>
                                <ChevronRight width={16} height={16} color={theme.colors.textTertiary} />
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    <View style={[styles.footer, { borderBottomColor: theme.colors.border }]}>
                        <View style={[styles.versionBadge, { backgroundColor: theme.colors.surfaceVariant }]}>
                            <Text style={[styles.versionText, { color: theme.colors.textSecondary }]}>
                                v{appVersion}
                            </Text>
                        </View>

                    </View>
                </View>
            </View>
        </Modal>
    );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    overlayTouchable: {
        flex: 1,
    },
    sidebar: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: width * 0.75,
        maxWidth: 320,
        shadowColor: '#000',
        shadowOffset: { width: 2, height: 0 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 20,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        paddingTop: Constants.statusBarHeight + 12,
        borderBottomWidth: 1,
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        paddingBottom: 36,
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    versionBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    versionText: {
        fontSize: 12,
        fontWeight: '600',
    },
    closeButton: {
        padding: 8,
        borderRadius: 8,
    },
    profileSection: {
        alignItems: 'center',
        paddingVertical: 24,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
    },
    profileImageContainer: {
        position: 'relative',
        marginBottom: 16,
    },
    profileImage: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 3,
    },
    onlineIndicator: {
        position: 'absolute',
        bottom: 2,
        right: 2,
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: '#10B981',
        borderWidth: 2,
        borderColor: '#FFFFFF',
    },
    profileName: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 8,
        textAlign: 'center',
    },
    profileBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    profileBadgeText: {
        fontSize: 12,
        fontWeight: '600',
        marginLeft: 6,
    },
    menuContainer: {
        flex: 1,
    },
    menuContent: {
        paddingBottom: 20,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
    },
    menuIcon: {
        width: 32,
        height: 32,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
        borderRadius: 8,
    },
    menuLabel: {
        flex: 1,
        fontSize: 16,
        fontWeight: '500',
    },
});
