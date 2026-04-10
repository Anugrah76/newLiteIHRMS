import { useRouter } from 'expo-router';
import { Building2 } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    BackHandler,
    Image,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
    StatusBar,

    Keyboard
} from 'react-native';
import { useToast } from '@shared/components/Toast';
import { AnimatedGradientBackground } from '@shared/components/AnimatedGradientBackground';
import { useCompanyConfig } from '@features/auth/hooks';
import { useTheme } from '@shared/theme';

const logo = require('../../assets/images/Ihrmslite.png');


export default function SubmitScreen() {
    const [companyId, setCompanyId] = useState('');
    const router = useRouter();
    const theme = useTheme();
    const toast = useToast();
    const [isKeyboardVisible, setKeyboardVisible] = useState(false);

    const { mutate: submitCode, isPending } = useCompanyConfig();

    useEffect(() => {
        const backAction = () => {
            BackHandler.exitApp();
            return true;
        };

        const showkeyDidShowListener = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
        const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));

        const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
        return () => {
            showkeyDidShowListener.remove();
            keyboardDidHideListener.remove();

            backHandler.remove();
        };
    }, []);

    const handleSubmit = () => {
        if (!companyId.trim()) {
            toast.show('error', 'Please enter a Company Code');
            return;
        }

        submitCode(companyId.trim(), {
            onSuccess: (data) => {
                if (data.status === 200) {
                    toast.show('success', 'Company Code Valid');
                    setTimeout(() => router.push('/(auth)/login'), 2500);
                } else {
                    toast.show('error', data.message || 'Invalid Code');
                }
            },
            onError: (error: any) => {
                console.error('Error during code validation:', error);
                // Extract API message from error response if available
                const apiMessage = error?.response?.data?.message
                    || error?.message
                    || 'Please try again';
                toast.show('error', 'Verification Failed', apiMessage);
            },
        });
    };

    return (
        <AnimatedGradientBackground>

            <StatusBar barStyle={theme.isDark ? 'light-content' : 'light-content'} />

            <View style={styles.container}>
                {/* Logo */}
                {!isKeyboardVisible &&
                    <View style={styles.logoContainer}>
                        <View style={[styles.logoCircle, { backgroundColor: 'rgba(255, 255, 255, 0.54)' }]}>
                            <Image source={logo} style={styles.logo} />
                        </View>

                    </View>
                }

                {/* Card */}
                <View style={[styles.card, { backgroundColor: theme.colors.cardPrimary }]}>
                    <View style={[styles.cardHeader, { borderBottomColor: theme.colors.border }]}>
                        <Text style={[styles.title, { color: theme.colors.text }]}>Company Verification</Text>
                        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
                            Enter your organization code to continue
                        </Text>
                    </View>

                    <View style={styles.cardBody}>
                        <Text style={[styles.label, { color: theme.colors.text }]}>Company Code</Text>
                        <View style={[styles.inputContainer, {
                            backgroundColor: theme.colors.surfaceVariant,
                            borderColor: theme.colors.border,
                        }]}>
                            <View style={[styles.iconBox, {
                                backgroundColor: theme.colors.surface,
                                borderColor: theme.colors.borderLight,
                            }]}>
                                <Building2 width={20} height={20} color={theme.colors.primary} />
                            </View>
                            <TextInput
                                style={[styles.input, { color: theme.colors.text }]}
                                placeholder="Enter code"
                                placeholderTextColor={theme.colors.textTertiary}
                                value={companyId}
                                onChangeText={setCompanyId}
                                editable={!isPending}
                                autoCapitalize="characters"
                                autoCorrect={false}
                            />
                        </View>

                        <Pressable
                            style={[
                                styles.button,
                                { backgroundColor: theme.colors.primary },
                                isPending && styles.buttonDisabled
                            ]}
                            onPress={handleSubmit}
                            disabled={isPending}
                        >
                            {isPending ? (
                                <ActivityIndicator size="small" color="#ffffff" />
                            ) : (
                                <Text style={styles.buttonText}>Verify & Continue</Text>
                            )}
                        </Pressable>

                        <Text style={[styles.note, { color: theme.colors.textTertiary }]}>
                            Contact your HR if you don't have a company code
                        </Text>
                    </View>
                </View>
            </View>

        </AnimatedGradientBackground>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 40,
    },
    logoCircle: {
        width: 120,
        height: 120,
        borderRadius: 60,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    logo: {
        width: 100,
        height: 100,
        resizeMode: 'contain',
    },
    appName: {
        fontSize: 28,
        fontWeight: '700',
        color: '#ffffff',
        marginBottom: 4,
        letterSpacing: 2,
    },
    appTagline: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.8)',
        letterSpacing: 1,
        textTransform: 'uppercase',
    },
    card: {
        borderRadius: 8,
        width: '100%',
        maxWidth: 420,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
    },
    cardHeader: {
        padding: 24,
        borderBottomWidth: 1,
    },
    title: {
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 6,
    },
    subtitle: {
        fontSize: 14,
        lineHeight: 20,
    },
    cardBody: {
        padding: 24,
    },
    label: {
        fontSize: 13,
        fontWeight: '600',
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 6,
        marginBottom: 24,
    },
    iconBox: {
        width: 48,
        height: 48,
        borderRightWidth: 1,
        borderRadius: 6,
        justifyContent: 'center',
        alignItems: 'center',
    },
    input: {
        flex: 1,
        height: 48,
        fontSize: 16,
        paddingHorizontal: 16,
        fontWeight: '500',
    },
    button: {
        height: 48,
        borderRadius: 6,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    buttonText: {
        color: '#ffffff',
        fontSize: 15,
        fontWeight: '600',
        letterSpacing: 0.5,
        textTransform: 'uppercase',
    },
    note: {
        fontSize: 12,
        textAlign: 'center',
        lineHeight: 18,
    },
});
