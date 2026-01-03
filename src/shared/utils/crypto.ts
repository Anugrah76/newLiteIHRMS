/**
 * ROT13 cipher for password encoding
 * Matches the legacy implementation
 */
export const rot13 = (str: string): string => {
    return str.replace(/[a-zA-Z]/g, (char) => {
        const code = char.charCodeAt(0);
        const isUpperCase = code >= 65 && code <= 90;
        const base = isUpperCase ? 65 : 97;
        return String.fromCharCode(((code - base + 13) % 26) + base);
    });
};
