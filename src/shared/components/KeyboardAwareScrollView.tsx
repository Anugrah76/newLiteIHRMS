import React from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, ScrollView, ScrollViewProps } from 'react-native';

interface KeyboardAwareScrollViewProps extends ScrollViewProps {
    children: React.ReactNode;
}

/**
 * KeyboardAwareScrollView - Wraps ScrollView with KeyboardAvoidingView
 * Use this component wherever you have forms with TextInput to prevent keyboard from covering inputs
 * 
 * Usage:
 * <KeyboardAwareScrollView>
 *   <TextInput ... />
 *   <TextInput ... />
 * </KeyboardAwareScrollView>
 */
export const KeyboardAwareScrollView: React.FC<KeyboardAwareScrollViewProps> = ({
    children,
    contentContainerStyle,
    ...scrollViewProps
}) => {
    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
            <ScrollView
                contentContainerStyle={[styles.scrollContent, contentContainerStyle]}
                keyboardShouldPersistTaps="handled"
                {...scrollViewProps}
            >
                {children}
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
    },
});
