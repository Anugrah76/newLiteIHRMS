/**
 * Message Composer Component
 * Discord-style input bar with app theme integration
 */

import React, { useState, useRef } from 'react';
import {
    View,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    Animated,
} from 'react-native';
import { Plus, Gift, Sticker, Send, Smile, Image as ImageIcon, Mic } from 'lucide-react-native';
import { useTheme } from '@shared/theme';

interface ComposerProps {
    channelName: string;
    onSendMessage: (content: string) => void;
    onTypingStart?: () => void;
    onTypingStop?: () => void;
}

export function Composer({
    channelName,
    onSendMessage,
    onTypingStart,
    onTypingStop,
}: ComposerProps) {
    const theme = useTheme();
    const styles = createStyles(theme);

    const [message, setMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const sendButtonScale = useRef(new Animated.Value(0)).current;

    React.useEffect(() => {
        Animated.spring(sendButtonScale, {
            toValue: message.trim().length > 0 ? 1 : 0,
            useNativeDriver: true,
            friction: 5,
        }).start();
    }, [message]);

    const handleTextChange = (text: string) => {
        setMessage(text);

        if (text.length > 0 && !isTyping) {
            setIsTyping(true);
            onTypingStart?.();
        }

        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        typingTimeoutRef.current = setTimeout(() => {
            setIsTyping(false);
            onTypingStop?.();
        }, 2000);
    };

    const handleSend = () => {
        if (message.trim()) {
            onSendMessage(message.trim());
            setMessage('');
            setIsTyping(false);
            onTypingStop?.();

            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
            <View style={styles.container}>
                {/* Attachment Button */}
                <TouchableOpacity style={styles.attachButton} activeOpacity={0.7}>
                    <Plus size={22} color={theme.colors.textSecondary} />
                </TouchableOpacity>

                {/* Text Input Container */}
                <View style={[
                    styles.inputContainer,
                    isFocused && styles.inputContainerFocused,
                ]}>
                    <TextInput
                        style={styles.input}
                        placeholder={`Message #${channelName}`}
                        placeholderTextColor={theme.colors.textTertiary}
                        value={message}
                        onChangeText={handleTextChange}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        multiline
                        maxLength={2000}
                    />

                    {/* Right side icons */}
                    <View style={styles.inputActions}>
                        <TouchableOpacity style={styles.inputIconButton} activeOpacity={0.7}>
                            <ImageIcon size={20} color={theme.colors.textTertiary} />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.inputIconButton} activeOpacity={0.7}>
                            <Smile size={20} color={theme.colors.textTertiary} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Send/Voice Button with animation */}
                <Animated.View style={{
                    transform: [{ scale: sendButtonScale }],
                    opacity: sendButtonScale,
                }}>
                    <TouchableOpacity
                        style={styles.sendButton}
                        onPress={handleSend}
                        activeOpacity={0.8}
                    >
                        <Send size={20} color="#fff" />
                    </TouchableOpacity>
                </Animated.View>

                {/* Show mic when no message (hidden when message exists) */}
                <Animated.View style={{
                    transform: [{ scale: Animated.subtract(1, sendButtonScale) }],
                    opacity: Animated.subtract(1, sendButtonScale),
                    position: 'absolute',
                    right: 12,
                }}>
                    <TouchableOpacity
                        style={[styles.sendButton, styles.micButton]}
                        activeOpacity={0.8}
                    >
                        <Mic size={20} color={theme.colors.textSecondary} />
                    </TouchableOpacity>
                </Animated.View>
            </View>
        </KeyboardAvoidingView>
    );
}

const createStyles = (theme: ReturnType<typeof useTheme>) => StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        paddingHorizontal: 12,
        paddingVertical: 12,
        backgroundColor: theme.isDark ? '#1e293b' : '#f1f5f9',
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
    },
    attachButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: theme.colors.surface,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    inputContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.surface,
        borderRadius: 20,
        paddingHorizontal: 16,
        minHeight: 44,
        maxHeight: 120,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    inputContainerFocused: {
        borderColor: theme.colors.primary,
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 2,
    },
    input: {
        flex: 1,
        color: theme.colors.text,
        fontSize: 15,
        paddingVertical: 10,
        maxHeight: 100,
    },
    inputActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    inputIconButton: {
        padding: 6,
        marginLeft: 2,
    },
    sendButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: theme.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 8,
        // Glow effect
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    micButton: {
        backgroundColor: 'transparent',
        shadowOpacity: 0,
        elevation: 0,
    },
});
