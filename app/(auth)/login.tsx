import { useRouter } from 'expo-router';
import { Eye, EyeOff, LockKeyhole, User, ArrowLeft } from 'lucide-react-native';
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
} from 'react-native';
import { useToast } from '@shared/components/Toast';
import { AnimatedGradientBackground } from '@shared/components/AnimatedGradientBackground';
import { useLogin } from '@features/auth/hooks';
import { useConfigStore } from '@shared/store';
import { getDeviceId, getDeviceManufacturer } from '@shared/utils/device';
import { rot13 } from '@shared/utils/crypto';
import { useTheme } from '@shared/theme';

const defaultLogo = require('../../assets/images/ihrms-logo.png');

/**
 * Login Screen - Professional Corporate Design
 * Second screen in app flow - authenticates user
 */
export default function LoginScreen() {
    const [uname, setUsername] = useState('');
    const [pass, setPassword] = useState('');
    const [showPW, setShowPW] = useState(false);
    const router = useRouter();
    const theme = useTheme();
    const toast = useToast();

    const companyConfig = useConfigStore((state) => state.companyConfig);
    const { mutate: loginUser, isPending } = useLogin();

    useEffect(() => {
        const backAction = () => {
            router.back();
            return true;
        };

        const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
        return () => backHandler.remove();
    }, [router]);

    const handleLogin = async () => {
        if (!uname.trim() || !pass.trim()) {
            toast.show('error', 'Missing Fields', 'Username and password are required');
            return;
        }

        try {
            const device_id = await getDeviceId(uname.trim());
            const deviceManufacturer = getDeviceManufacturer();

            loginUser({
                uname: uname.trim(),
                pass: rot13(pass.trim()),
                imei_number: device_id,
                device_detail: deviceManufacturer,
                login_location: 'Mobile App',
            }, {
                onSuccess: (data) => {
                    console.log('Login response:', data);

                    // Always show the message from API response
                    const apiMessage = data.message || 'No message from server';

                    if (data.status === 2) {
                        // Success
                        toast.show('success', 'Login Successful', apiMessage);
                        setTimeout(() => router.replace('/(tabs)/dashboard'), 800);
                    } else {
                        // Failed - still show the API message
                        toast.show('error', 'Login Failed', apiMessage);
                    }
                },
                onError: (error: any) => {
                    console.error('Login error:', error);
                    toast.show('error', 'Network Error', 'Unable to connect to server');
                },
            });
        } catch (error) {
            console.error('Login error:', error);
            toast.show('error', 'Error', 'Something went wrong');
        }
    };

    return (
        <AnimatedGradientBackground>
            <StatusBar barStyle={theme.isDark ? 'light-content' : 'light-content'} />

            {/* Back Button */}
            <Pressable
                style={styles.backButton}
                onPress={() => router.back()}
            >
                <View style={[styles.backButtonCircle, { backgroundColor: 'rgba(255,255,255,0.15)' }]}>
                    <ArrowLeft width={24} height={24} color="#ffffff" />
                </View>
            </Pressable>

            <View style={styles.container}>
                {/* Company Logo */}
                <View style={styles.logoContainer}>
                    <View style={[styles.logoCircle, { backgroundColor: 'rgba(255,255,255,0.95)' }]}>
                        <Image
                            source={companyConfig?.logo_url ? { uri: companyConfig.logo_url } : defaultLogo}
                            style={styles.logo}
                        />
                    </View>
                    <Text style={styles.companyName}>
                        {companyConfig?.company_name || 'Organization'}
                    </Text>
                </View>

                {/* Login Card */}
                <View style={[styles.card, { backgroundColor: theme.colors.cardPrimary }]}>
                    <View style={[styles.cardHeader, { borderBottomColor: theme.colors.border }]}>
                        <Text style={[styles.title, { color: theme.colors.text }]}>Employee Login</Text>
                        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
                            Enter your credentials to access the system
                        </Text>
                    </View>

                    <View style={styles.cardBody}>
                        {/* Username */}
                        <Text style={[styles.label, { color: theme.colors.text }]}>Username / Employee ID</Text>
                        <View style={[styles.inputContainer, {
                            backgroundColor: theme.colors.surfaceVariant,
                            borderColor: theme.colors.border,
                        }]}>
                            <View style={[styles.iconBox, {
                                backgroundColor: theme.colors.surface,
                                borderColor: theme.colors.borderLight,
                            }]}>
                                <User width={20} height={20} color={theme.colors.primary} />
                            </View>
                            <TextInput
                                style={[styles.input, { color: theme.colors.text }]}
                                placeholder="Enter username"
                                placeholderTextColor={theme.colors.textTertiary}
                                autoCapitalize="none"
                                value={uname}
                                editable={!isPending}
                                onChangeText={setUsername}
                            />
                        </View>

                        {/* Password */}
                        <Text style={[styles.label, { color: theme.colors.text }]}>Password</Text>
                        <View style={[styles.inputContainer, {
                            backgroundColor: theme.colors.surfaceVariant,
                            borderColor: theme.colors.border,
                        }]}>
                            <View style={[styles.iconBox, {
                                backgroundColor: theme.colors.surface,
                                borderColor: theme.colors.borderLight,
                            }]}>
                                <LockKeyhole width={20} height={20} color={theme.colors.primary} />
                            </View>
                            <TextInput
                                style={[styles.input, { color: theme.colors.text }]}
                                placeholder="Enter password"
                                placeholderTextColor={theme.colors.textTertiary}
                                secureTextEntry={!showPW}
                                value={pass}
                                editable={!isPending}
                                onChangeText={setPassword}
                            />
                            <Pressable
                                style={styles.eyeButton}
                                onPress={() => setShowPW(!showPW)}
                            >
                                {showPW ? (
                                    <Eye width={20} height={20} color={theme.colors.textTertiary} />
                                ) : (
                                    <EyeOff width={20} height={20} color={theme.colors.textTertiary} />
                                )}
                            </Pressable>
                        </View>

                        {/* Forgot Password */}
                        <Pressable
                            style={styles.forgotPassword}
                            onPress={() => router.push('/(auth)/forgot-password')}
                        >
                            <Text style={[styles.forgotPasswordText, { color: theme.colors.primary }]}>
                                Forgot Password?
                            </Text>
                        </Pressable>

                        {/* Login Button */}
                        <Pressable
                            style={[
                                styles.button,
                                { backgroundColor: theme.colors.primary },
                                isPending && styles.buttonDisabled
                            ]}
                            onPress={handleLogin}
                            disabled={isPending}
                        >
                            {isPending ? (
                                <ActivityIndicator size="small" color="#ffffff" />
                            ) : (
                                <Text style={styles.buttonText}>Sign In</Text>
                            )}
                        </Pressable>
                    </View>
                </View>
            </View>
        </AnimatedGradientBackground>
    );
}

const styles = StyleSheet.create({
    backButton: {
        position: 'absolute',
        top: 50,
        left: 20,
        zIndex: 10,
    },
    backButtonCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
    },
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
        width: 100,
        height: 100,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 6,
    },
    logo: {
        width: 70,
        height: 70,
        resizeMode: 'contain',
    },
    companyName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#ffffff',
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
        marginBottom: 20,
    },
    iconBox: {
        width: 48,
        height: 48,
        borderRightWidth: 1,
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
    eyeButton: {
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    forgotPassword: {
        alignSelf: 'flex-end',
        marginBottom: 24,
    },
    forgotPasswordText: {
        fontSize: 13,
        fontWeight: '600',
    },
    button: {
        height: 48,
        borderRadius: 6,
        justifyContent: 'center',
        alignItems: 'center',
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
});
