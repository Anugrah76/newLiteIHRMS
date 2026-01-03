import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface CorporateGradientProps {
    children: React.ReactNode;
    style?: ViewStyle;
}

export const CorporateGradient = ({ children, style }: CorporateGradientProps) => {
    return (
        <LinearGradient
            colors={['#EEF2FF', '#F9FAFB', '#FFFFFF']}
            style={[styles.container, style]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 0.3 }}
        >
            {children}
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});
