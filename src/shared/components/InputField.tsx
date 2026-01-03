import React from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    TextInputProps,
    ViewStyle,
    TextStyle
} from 'react-native';
import { useTheme } from '@shared/theme';

interface InputFieldProps extends TextInputProps {
    label?: string;
    containerStyle?: ViewStyle;
    labelStyle?: TextStyle;
    inputStyle?: TextStyle;
    error?: string;
}

export const InputField: React.FC<InputFieldProps> = ({
    label,
    containerStyle,
    labelStyle,
    inputStyle,
    error,
    style,
    ...props
}) => {
    const theme = useTheme();

    return (
        <View style={[styles.container, containerStyle]}>
            {label && (
                <Text style={[styles.label, { color: theme.colors.textSecondary }, labelStyle]}>
                    {label}
                </Text>
            )}
            <TextInput
                style={[
                    styles.input,
                    {
                        backgroundColor: theme.colors.surface,
                        borderColor: error ? theme.colors.error : theme.colors.border,
                        color: theme.colors.text
                    },
                    props.editable === false && styles.disabledInput,
                    props.multiline && styles.multilineInput,
                    inputStyle,
                ]}
                placeholderTextColor={theme.colors.textTertiary}
                {...props}
            />
            {error && (
                <Text style={[styles.errorText, { color: theme.colors.error }]}>
                    {error}
                </Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 14,
        fontSize: 15,
        minHeight: 50,
    },
    disabledInput: {
        opacity: 0.7,
        backgroundColor: '#F3F4F6', // SLightly grey when disabled
    },
    multilineInput: {
        textAlignVertical: 'top',
        minHeight: 100,
    },
    errorText: {
        fontSize: 12,
        marginTop: 4,
        marginLeft: 4,
    },
});
