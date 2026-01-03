import * as SecureStore from 'expo-secure-store';
import type { User } from '@shared/types';

/**
 * Save user token to secure storage
 */
export const saveToken = async (token: User): Promise<void> => {
    try {
        const serializedToken = JSON.stringify(token);
        await SecureStore.setItemAsync('authToken', serializedToken);
        console.log('Token saved successfully');
    } catch (error) {
        console.error('Failed to save token', error);
    }
};

/**
 * Get user token from secure storage
 */
export const getToken = async (): Promise<User | null> => {
    try {
        const serializedToken = await SecureStore.getItemAsync('authToken');
        if (serializedToken) {
            return JSON.parse(serializedToken);
        }
        return null;
    } catch (error) {
        console.error('Failed to retrieve token', error);
        return null;
    }
};

/**
 * Remove user token from secure storage
 */
export const removeToken = async (): Promise<void> => {
    try {
        await SecureStore.deleteItemAsync('authToken');
        console.log('Token removed successfully');
    } catch (error) {
        console.error('Failed to remove token', error);
    }
};
