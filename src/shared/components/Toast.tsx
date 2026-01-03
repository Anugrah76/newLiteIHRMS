import React, { createContext, useContext, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Animated, Pressable } from 'react-native';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react-native';
import { useTheme } from '@shared/theme';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
    id: string;
    type: ToastType;
    title: string;
    message?: string;
}

interface ToastContextType {
    show: (type: ToastType, title: string, message?: string) => void;
    hide: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within ToastProvider');
    }
    return context;
};

/**
 * Professional Corporate Toast Provider
 * Theme-aware notifications aligned with organizational design
 */
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const show = useCallback((type: ToastType, title: string, message?: string) => {
        const id = Date.now().toString();
        const newToast: Toast = { id, type, title, message };

        setToasts((prev) => [...prev, newToast]);

        // Auto-dismiss after 4 seconds
        setTimeout(() => {
            hide(id);
        }, 4000);
    }, []);

    const hide = useCallback((id: string) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ show, hide }}>
            {children}
            <ToastContainer toasts={toasts} onDismiss={hide} />
        </ToastContext.Provider>
    );
};

interface ToastContainerProps {
    toasts: Toast[];
    onDismiss: (id: string) => void;
}

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
    return (
        <View style={styles.container} pointerEvents="box-none">
            {toasts.map((toast) => (
                <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
            ))}
        </View>
    );
};

interface ToastItemProps {
    toast: Toast;
    onDismiss: (id: string) => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onDismiss }) => {
    const theme = useTheme();
    const [opacity] = useState(new Animated.Value(0));

    React.useEffect(() => {
        Animated.sequence([
            Animated.timing(opacity, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const handleDismiss = () => {
        Animated.timing(opacity, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
        }).start(() => onDismiss(toast.id));
    };

    const getIcon = () => {
        const iconProps = { width: 20, height: 20 };
        switch (toast.type) {
            case 'success':
                return <CheckCircle {...iconProps} color={theme.colors.success} />;
            case 'error':
                return <XCircle {...iconProps} color={theme.colors.error} />;
            case 'warning':
                return <AlertCircle {...iconProps} color={theme.colors.warning} />;
            case 'info':
                return <Info {...iconProps} color={theme.colors.info} />;
        }
    };

    const getBackgroundColor = () => {
        if (theme.isDark) {
            return theme.colors.surface;
        }
        return theme.colors.cardPrimary;
    };

    const getBorderColor = () => {
        switch (toast.type) {
            case 'success':
                return theme.colors.success;
            case 'error':
                return theme.colors.error;
            case 'warning':
                return theme.colors.warning;
            case 'info':
                return theme.colors.info;
        }
    };

    return (
        <Animated.View
            style={[
                styles.toast,
                {
                    opacity,
                    backgroundColor: getBackgroundColor(),
                    borderLeftColor: getBorderColor(),
                    borderColor: theme.colors.border,
                },
            ]}
        >
            <View style={styles.iconContainer}>{getIcon()}</View>

            <View style={styles.content}>
                <Text style={[styles.title, { color: theme.colors.text }]} numberOfLines={2}>
                    {toast.title}
                </Text>
                {toast.message && (
                    <Text style={[styles.message, { color: theme.colors.textSecondary }]} numberOfLines={2}>
                        {toast.message}
                    </Text>
                )}
            </View>

            <Pressable onPress={handleDismiss} style={styles.closeButton}>
                <X width={16} height={16} color={theme.colors.textTertiary} />
            </Pressable>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 50,
        left: 16,
        right: 16,
        zIndex: 9999,
        gap: 8,
    },
    toast: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        padding: 14,
        borderRadius: 6,
        borderWidth: 1,
        borderLeftWidth: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 6,
    },
    iconContainer: {
        marginRight: 12,
        marginTop: 2,
    },
    content: {
        flex: 1,
    },
    title: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 2,
        letterSpacing: 0.2,
    },
    message: {
        fontSize: 13,
        lineHeight: 18,
    },
    closeButton: {
        marginLeft: 8,
        padding: 4,
    },
});
