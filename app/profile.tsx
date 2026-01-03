import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { CorporateBackground } from '@shared/components/CorporateBackground';
import { TopBar } from '@shared/components/ui/TopBar';
import { Sidebar } from '@shared/components/Sidebar';
import { useAuthStore } from '@shared/store';
import { useToast } from '@shared/components/Toast';
import { useTheme } from '@shared/theme';
import { User, Briefcase, Building, Mail, Phone, Users, Calendar, CreditCard, MapPin, Hash, Globe, UserCheck } from 'lucide-react-native';
import { SkeletonProfileHeader, SkeletonCard } from '@shared/components/Skeleton';
import { useProfileInfo } from '@features/profile/api/profileApi';

export default function ProfileScreen() {
    const router = useRouter();
    const theme = useTheme();
    const toast = useToast();
    const user = useAuthStore(state => state.user);

    const [sidebarVisible, setSidebarVisible] = useState(false);

    // Use React Query hook instead of manual fetch
    const { data: profileInfo, isLoading, error } = useProfileInfo();

    // Show error toast if API fails
    if (error) {
        toast.show('error', 'Failed to load profile');
    }

    const InfoCard = ({ title, icon: IconComponent, color, children }: any) => (
        <View style={[styles.infoCard, { backgroundColor: theme.colors.cardPrimary, borderColor: theme.colors.border, borderTopColor: color }]}>
            <View style={[styles.cardHeader, { borderBottomColor: theme.colors.border }]}>
                <View style={[styles.cardIcon, { backgroundColor: color + '15' }]}>
                    <IconComponent size={20} color={color} />
                </View>
                <Text style={[styles.cardTitle, { color: theme.colors.text }]}>{title}</Text>
            </View>
            <View style={styles.cardContent}>
                {children}
            </View>
        </View>
    );

    const InfoRow = ({ icon: IconComponent, label, value, color = theme.colors.textSecondary }: any) => (
        <View style={styles.infoRow}>
            <View style={styles.iconContainer}>
                <IconComponent size={16} color={color} />
            </View>
            <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>{label}:</Text>
            <Text style={[styles.infoValue, { color: theme.colors.text }]}>{value || "N/A"}</Text>
        </View>
    );

    return (
        <CorporateBackground>
            <TopBar title="Employee Profile" onMenuPress={() => setSidebarVisible(true)} showBack />
            <ScrollView style={styles.container} contentContainerStyle={styles.content}>
                {isLoading ? (
                    <>
                        <SkeletonProfileHeader />
                        <SkeletonCard />
                        <SkeletonCard />
                        <SkeletonCard />
                    </>
                ) : (
                    <>
                        {/* Profile Header */}
                        <View style={[styles.profileHeader, { backgroundColor: theme.colors.cardPrimary, borderColor: theme.colors.border }]}>
                            <View style={styles.profileImageContainer}>
                                <Image
                                    source={user?.profile_photo ? { uri: user.profile_photo } : require('@/assets/images/default-pfp.png')}
                                    style={styles.profileImage}
                                />
                            </View>
                            <Text style={[styles.profileName, { color: theme.colors.text }]}>{user?.fullName || "Employee Name"}</Text>
                            <View style={styles.profileBadge}>
                                <UserCheck size={14} color="#10B981" />
                                <Text style={styles.profileBadgeText}>{user?.emp_code || "Employee Code"}</Text>
                            </View>
                        </View>

                        {/* Personal Details */}
                        <InfoCard title="Personal Details" icon={User} color="#06B6D4">
                            <InfoRow icon={Briefcase} label="Designation" value={profileInfo?.personal?.designation} color="#06B6D4" />
                            <InfoRow icon={Building} label="Company" value={profileInfo?.personal?.company} color="#06B6D4" />
                            <InfoRow icon={Mail} label="Email" value={profileInfo?.personal?.email} color="#06B6D4" />
                            <InfoRow icon={Phone} label="Contact" value={profileInfo?.personal?.mobile} color="#06B6D4" />
                        </InfoCard>

                        {/* Work Details */}
                        <InfoCard title="Work Information" icon={Briefcase} color="#8B5CF6">
                            <InfoRow icon={Globe} label="Circle" value={profileInfo?.personal?.circle} color="#8B5CF6" />
                            <InfoRow icon={Users} label="Manager" value={profileInfo?.personal?.reporting_manager_name} color="#8B5CF6" />
                            <InfoRow icon={Mail} label="Manager Email" value={profileInfo?.personal?.reporting_manager_email} color="#8B5CF6" />
                            <InfoRow icon={Phone} label="Manager Contact" value={profileInfo?.personal?.reporting_manager_contact} color="#8B5CF6" />
                            <InfoRow icon={Calendar} label="Joining Date" value={profileInfo?.personal?.joining_date} color="#8B5CF6" />
                        </InfoCard>

                        {/* Bank Details */}
                        <InfoCard title="Banking Information" icon={CreditCard} color="#10B981">
                            <InfoRow icon={Building} label="Bank Name" value={profileInfo?.bank?.bank_name} color="#10B981" />
                            <InfoRow icon={MapPin} label="Bank Address" value={profileInfo?.bank?.bank_address} color="#10B981" />
                            <InfoRow icon={User} label="Account Holder" value={profileInfo?.bank?.account_holder_name} color="#10B981" />
                            <InfoRow icon={Hash} label="Account Number" value={profileInfo?.bank?.account_number} color="#10B981" />
                            <InfoRow icon={Hash} label="IFSC Code" value={profileInfo?.bank?.ifsc} color="#10B981" />
                        </InfoCard>
                    </>
                )}
            </ScrollView>
            <Sidebar visible={sidebarVisible} onClose={() => setSidebarVisible(false)} />
        </CorporateBackground>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { padding: 16, paddingBottom: 30 },
    loadingContainer: { paddingVertical: 50, alignItems: 'center' },
    loadingText: { marginTop: 16, fontSize: 16 },
    profileHeader: { borderRadius: 20, padding: 24, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 6, borderWidth: 1, alignItems: 'center' },
    profileImageContainer: { marginBottom: 16 },
    profileImage: { width: 120, height: 120, borderRadius: 60, borderWidth: 4, borderColor: '#E5E7EB' },
    profileName: { fontSize: 24, fontWeight: '800', marginBottom: 4, textAlign: 'center' },
    profileBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#10B98120', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
    profileBadgeText: { fontSize: 12, fontWeight: '600', color: '#10B981', marginLeft: 6 },
    infoCard: { borderRadius: 16, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 6, borderTopWidth: 4, borderWidth: 1 },
    cardHeader: { flexDirection: 'row', alignItems: 'center', padding: 20, borderBottomWidth: 1 },
    cardIcon: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    cardTitle: { fontSize: 18, fontWeight: '700' },
    cardContent: { padding: 20, gap: 16 },
    infoRow: { flexDirection: 'row', alignItems: 'center' },
    iconContainer: { width: 24, alignItems: 'center', marginRight: 12 },
    infoLabel: { width: 120, fontSize: 14, fontWeight: '600' },
    infoValue: { flex: 1, fontSize: 14, fontWeight: '500' },
});
