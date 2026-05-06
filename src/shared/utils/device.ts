import * as Device from 'expo-device';
import * as Crypto from 'expo-crypto';

/**
 * Generate device ID for IMEI requirement
 * Uses device model + a hashed UUID for uniqueness
 */
export const getDeviceId = async (username: string): Promise<string> => {
    try {
        // For production, you might want to use a more robust approach
        const deviceModel = Device.modelName || 'Unknown';
        const uuid = await Crypto.digestStringAsync(
            Crypto.CryptoDigestAlgorithm.SHA256,
            `${username}-${deviceModel}`
        );

        return `${deviceModel}-${uuid.substring(0, 16)}`;
    } catch (error) {
        console.error('Failed to generate device ID', error);
        return 'unknown-device';
    }
};

/**
 * Get device manufacturer
 */
export const getDeviceManufacturer = (): string => {
    console.log(Device.manufacturer);
    return Device.manufacturer || 'Unknown';
};
