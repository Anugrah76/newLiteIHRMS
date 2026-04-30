import { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Platform
} from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import { File, Paths } from 'expo-file-system/next';
import * as Sharing from 'expo-sharing';
import { useRouter } from 'expo-router';
import { CorporateBackground } from '@shared/components/CorporateBackground';
import { TopBar } from '@shared/components/ui/TopBar';
import { Sidebar } from '@shared/components/Sidebar';
import { SelectField } from '@shared/components/SelectField';
import { useToast } from '@shared/components/Toast';
import { useTheme } from '@shared/theme';
import { useTransferredSalary, type SalaryRecord } from '@features/salary/api/salaryApi';
import { IndianRupee, Download, TrendingUp, CheckCircle, FileText } from 'lucide-react-native';

export default function TransferredSalaryScreen() {
    const router = useRouter();
    const theme = useTheme();
    const toast = useToast();

    const [sidebarVisible, setSidebarVisible] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
    const [salaryData, setSalaryData] = useState<SalaryRecord[]>([]);
    const [totalTransferred, setTotalTransferred] = useState(0);

    const { mutate: fetchSalary, isPending: loading } = useTransferredSalary();

    useEffect(() => {
        authenticateUser();
    }, []);

    const authenticateUser = async () => {
        try {
            const hasHardware = await LocalAuthentication.hasHardwareAsync();
            if (!hasHardware) {
                // For simulator/dev, you might skip this or show alert
                // Alert.alert('Error', 'Biometric authentication not available');
                setIsAuthenticated(true); // Allow bypass if no hardware
                return;
            }

            const isEnrolled = await LocalAuthentication.isEnrolledAsync();
            if (!isEnrolled) {
                // Alert.alert('Error', 'No biometric data enrolled');
                setIsAuthenticated(true);
                return;
            }

            const result = await LocalAuthentication.authenticateAsync({
                promptMessage: 'Authenticate to access salary information',
                cancelLabel: 'Cancel',
            });

            if (result.success) {
                setIsAuthenticated(true);
            } else {
                router.back();
            }
        } catch (error) {
            console.error('Authentication error:', error);
            setIsAuthenticated(true); // Fallback for dev
        }
    };

    const handleSubmit = () => {
        setSalaryData([]);
        setTotalTransferred(0);

        fetchSalary({ year: selectedYear }, {
            onSuccess: (data) => {
                if (data.response === 200 && data.status) {
                    const validSalaryData = data.year_salary || [];
                    setSalaryData(validSalaryData);

                    // Calculate total using the parsed values we added in the API layer
                    const total = validSalaryData.reduce((sum, item) => {
                        return sum + (item.paid_salary_parsed || 0);
                    }, 0);

                    setTotalTransferred(total);
                    toast.show('success', 'Loaded', 'Salary data loaded successfully');
                } else {
                    toast.show('error', 'Failed', 'Failed to fetch salary data');
                }
            },
            onError: () => {
                toast.show('error', 'Error', 'Failed to submit request');
            }
        });
    };

    // Helper function to format numbers with commas (Indian numbering system)
    const formatNumberWithCommas = (num: number | string | undefined) => {
        if (num === undefined || num === null || num === '') return '0.00';

        const numStr = String(num);
        const parts = numStr.split('.');
        let integerPart = parts[0];
        const decimalPart = parts.length > 1 ? '.' + parts[1] : '';

        // Add commas to integer part (Indian numbering system)
        let lastThree = integerPart.substring(integerPart.length - 3);
        const otherNumbers = integerPart.substring(0, integerPart.length - 3);

        if (otherNumbers !== '') {
            lastThree = ',' + lastThree;
        }

        const formattedInteger = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;
        return formattedInteger + decimalPart;
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '';
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    const getMonthName = (dateString: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '';
        return date.toLocaleDateString('default', { month: 'long' });
    };

    const handleDownload = async (url: string, salaryMonth: string = '') => {
        if (!url) {
            toast.show('error', 'Error', 'Download URL not available');
            return;
        }

        try {
            const monthShort = salaryMonth ? salaryMonth.substring(0, 3).toUpperCase() : 'SAL';
            const fileName = `Salary_Slip_${monthShort}_${new Date().toISOString().split('T')[0]}.pdf`;

            const destination = new File(Paths.cache, fileName);
            if (destination.exists) {
                destination.delete();
            }
            const outputFile = await File.downloadFileAsync(url, destination);

            if (outputFile.exists) {
                if (await Sharing.isAvailableAsync()) {
                    await Sharing.shareAsync(outputFile.uri, {
                        mimeType: 'application/pdf',
                        dialogTitle: 'Share Salary Slip',
                        UTI: 'public.pdf'
                    });
                }
                toast.show('success', 'Downloaded', `Salary slip downloaded`);
            }
        } catch (error: any) {
            console.error('Download error:', error);
            toast.show('error', 'Error', 'Failed to download salary slip');
        }
    };

    const currentYear = new Date().getFullYear();
    const yearOptions = Array.from({ length: 8 }, (_, i) => ({
        label: `${currentYear - i}`,
        value: `${currentYear - i}`
    }));

    if (!isAuthenticated) {
        return (
            <CorporateBackground>
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                    <Text style={[styles.loadingText, { color: theme.colors.text }]}>Authenticating...</Text>
                </View>
            </CorporateBackground>
        );
    }

    return (
        <CorporateBackground>
            <TopBar title="Salary Details" onMenuPress={() => setSidebarVisible(true)} showBack />
            <ScrollView style={styles.container} contentContainerStyle={styles.content}>
                <View style={[styles.formCard, { backgroundColor: theme.colors.cardPrimary, borderColor: theme.colors.border }]}>
                    <SelectField label="Year" value={selectedYear} onValueChange={setSelectedYear} options={yearOptions} />
                    <TouchableOpacity
                        style={[styles.button, { backgroundColor: loading ? theme.colors.primary + '80' : theme.colors.primary }]}
                        onPress={handleSubmit}
                        disabled={loading}
                    >
                        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Search</Text>}
                    </TouchableOpacity>
                </View>

                {salaryData.length > 0 && (
                    <>
                        <View style={styles.summaryContainer}>
                            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Salary Summary</Text>
                            <View style={styles.summaryGrid}>
                                <View style={[styles.summaryCard, { backgroundColor: theme.colors.cardPrimary, borderColor: theme.colors.border, borderLeftColor: '#3B82F6' }]}>
                                    <View style={[styles.summaryIcon, { backgroundColor: '#3B82F620' }]}>
                                        <TrendingUp size={20} color="#3B82F6" />
                                    </View>
                                    <View style={styles.summaryText}>
                                        <Text style={[styles.summaryTitle, { color: theme.colors.textSecondary }]}>Monthly CTC</Text>
                                        <Text style={[styles.summaryAmount, { color: theme.colors.text }]}>
                                            ₹{formatNumberWithCommas(salaryData[0]?.monthly_ctc_parsed)}
                                        </Text>
                                    </View>
                                </View>
                                <View style={[styles.summaryCard, { backgroundColor: theme.colors.cardPrimary, borderColor: theme.colors.border, borderLeftColor: '#10B981' }]}>
                                    <View style={[styles.summaryIcon, { backgroundColor: '#10B98120' }]}>
                                        <CheckCircle size={20} color="#10B981" />
                                    </View>
                                    <View style={styles.summaryText}>
                                        <Text style={[styles.summaryTitle, { color: theme.colors.textSecondary }]}>Paid Salary</Text>
                                        <Text style={[styles.summaryAmount, { color: theme.colors.text }]}>
                                            ₹{formatNumberWithCommas(salaryData[0]?.paid_salary_parsed)}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        </View>

                        <View style={styles.salaryContainer}>
                            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Salary Records</Text>
                            {salaryData.map((salary, index) => (
                                salary && (
                                    <View key={index} style={[styles.salaryCard, { backgroundColor: theme.colors.cardPrimary, borderColor: theme.colors.border }]}>
                                        <View style={styles.salaryHeader}>
                                            <Text style={[styles.salaryMonth, { color: theme.colors.text }]}>{getMonthName(salary?.date || '')}</Text>
                                            <Text style={[styles.salaryDate, { color: theme.colors.textSecondary }]}>{formatDate(salary?.date || '')}</Text>
                                        </View>

                                        <View style={styles.salaryAmountContainer}>
                                            <IndianRupee size={24} color="#059669" />
                                            <Text style={styles.salaryAmount}>{formatNumberWithCommas(salary?.paid_salary_parsed)}</Text>
                                        </View>

                                        <View style={[styles.salaryDetails, { borderTopColor: theme.colors.border }]}>
                                            <View style={styles.detailRow}>
                                                <FileText size={16} color={theme.colors.textSecondary} />
                                                <Text style={[styles.detailText, { color: theme.colors.textSecondary }]} numberOfLines={1}>
                                                    CTC: ₹{formatNumberWithCommas(salary?.monthly_ctc_parsed)}
                                                </Text>
                                            </View>

                                            <TouchableOpacity
                                                style={styles.downloadButton}
                                                onPress={() => handleDownload(salary?.salary_slip_url, getMonthName(salary?.date || ''))}
                                            >
                                                <Download size={16} color="#fff" />
                                                <Text style={styles.downloadButtonText}>Download Slip</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                )
                            ))}

                            <View style={[styles.totalContainer, { backgroundColor: theme.colors.primary }]}>
                                <View style={styles.totalRow}>
                                    <Text style={styles.totalLabel}>Total Transferred:</Text>
                                    <View style={styles.totalAmountContainer}>
                                        <IndianRupee size={18} color="#fff" />
                                        <Text style={styles.totalAmount}>
                                            {formatNumberWithCommas(totalTransferred.toFixed(2))}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        </View>
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
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { marginTop: 10, fontSize: 16 },
    formCard: { borderRadius: 16, padding: 20, marginBottom: 20, borderWidth: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
    button: { paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginTop: 16 },
    buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
    summaryContainer: { marginBottom: 20 },
    sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 16 },
    summaryGrid: { flexDirection: 'row', gap: 12 },
    summaryCard: { flex: 1, borderRadius: 12, padding: 16, borderWidth: 1, borderLeftWidth: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3, flexDirection: 'row', alignItems: 'center' },
    summaryIcon: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    summaryText: { flex: 1 },
    summaryTitle: { fontSize: 12, marginBottom: 4, fontWeight: '500' },
    summaryAmount: { fontSize: 18, fontWeight: '700' },
    salaryContainer: { marginTop: 10 },
    salaryCard: { borderRadius: 12, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3, borderWidth: 1 },
    salaryHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
    salaryMonth: { fontSize: 18, fontWeight: '600' },
    salaryDate: { fontSize: 14 },
    salaryAmountContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
    salaryAmount: { fontSize: 28, fontWeight: 'bold', color: '#059669', marginLeft: 4 },
    salaryDetails: { borderTopWidth: 1, paddingTop: 12 },
    detailRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    detailText: { fontSize: 14, flex: 1, marginLeft: 8 },
    downloadButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#3B82F6', borderRadius: 6, paddingVertical: 10, paddingHorizontal: 16 },
    downloadButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '500', marginLeft: 8 },
    totalContainer: { borderRadius: 12, padding: 16, marginTop: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
    totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    totalLabel: { color: '#FFFFFF', fontSize: 16, fontWeight: '500' },
    totalAmountContainer: { flexDirection: 'row', alignItems: 'center' },
    totalAmount: { color: '#FFFFFF', fontSize: 20, fontWeight: '700', marginLeft: 4 },
});
