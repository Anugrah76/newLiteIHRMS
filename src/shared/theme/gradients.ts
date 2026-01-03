/**
 * CORPORATE GRADIENT SYSTEM
 * Professional, mechanical, sterile gradients for enterprise HRMS
 * 
 * 4 Gradient Sets:
 * 1. App Background - Light Mode (screens after dashboard)
 * 2. App Background - Dark Mode (screens after dashboard)  
 * 3. Welcome Card - Light Mode (time-based)
 * 4. Welcome Card - Dark Mode (time-based)
 */

/**
 * ========================================
 * SET 1 & 2: APP BACKGROUND GRADIENTS
 * ========================================
 * Minimal, clean gradients for all screens except dashboard
 * Corporate: Professional blues and grays
 * Mechanical: Linear, structured
 * Sterile: Clean, minimal color variation
 */

export const APP_BACKGROUND_LIGHT = {
    colors: [
        '#f8f9fa', // Light gray-white top
        '#f1f3f5', // Slightly darker gray middle
        '#e9ecef', // Subtle gray bottom
    ],
    start: { x: 0, y: 0 },
    end: { x: 0, y: 1 },
    // Alternative: Use solid color if gradient is too subtle
    solidFallback: '#f8f9fa',
};

export const APP_BACKGROUND_DARK = {
    colors: [
        '#1a1d23', // Dark charcoal top
        '#131620', // Deeper blue-black middle
        '#0d0f15', // Almost black bottom
    ],
    start: { x: 0, y: 0 },
    end: { x: 0, y: 1 },
    // Alternative: Use solid color
    solidFallback: '#111827',
};

/**
 * ========================================
 * SET 3 & 4: WELCOME CARD TIME-BASED GRADIENTS
 * ========================================
 * Dynamic gradients that change based on time of day
 * More vibrant than app backgrounds but still corporate
 */

interface TimeGradient {
    colors: string[];
    start: { x: number; y: number };
    end: { x: number; y: number };
}

/**
 * LIGHT MODE - Welcome Card Time-Based Gradients
 * Professional blues with time-appropriate accents
 */
export const WELCOME_CARD_LIGHT = {
    // Early Morning (5-8 AM) - Cool awakening
    earlyMorning: {
        colors: [
            '#e3f2fd', // Dawn blue
            '#bbdefb', // Light blue
            '#90caf9', // Sky blue  
        ],
        start: { x: 0, y: 0 },
        end: { x: 1, y: 1 },
    } as TimeGradient,

    // Morning (8-12 PM) - Professional blue
    morning: {
        colors: [
            '#2563eb', // Corporate blue
            '#1d4ed8', // Darker blue
            '#1e40af', // Deep blue
        ],
        start: { x: 0, y: 0 },
        end: { x: 1, y: 1 },
    } as TimeGradient,

    // Afternoon (12-5 PM) - Neutral productivity
    afternoon: {
        colors: [
            '#475569', // Slate gray
            '#334155', // Darker slate
            '#1e293b', // Deep slate
        ],
        start: { x: 0, y: 0 },
        end: { x: 1, y: 1 },
    } as TimeGradient,

    // Evening (5-8 PM) - Warm professional
    evening: {
        colors: [
            '#0f766e', // Teal
            '#0d5650', // Deep teal
            '#064e3b', // Dark emerald
        ],
        start: { x: 0, y: 0 },
        end: { x: 1, y: 1 },
    } as TimeGradient,

    // Night (8 PM - 5 AM) - Calm blue-gray
    night: {
        colors: [
            '#475569', // Cool slate
            '#3b4a5e', // Midnight blue-gray
            '#1e293b', // Deep night
        ],
        start: { x: 0, y: 0 },
        end: { x: 1, y: 1 },
    } as TimeGradient,
};

/**
 * DARK MODE - Welcome Card Time-Based Gradients
 * Muted, professional tones with subtle time variation
 */
export const WELCOME_CARD_DARK = {
    // Early Morning (5-8 AM) - Subtle dawn
    earlyMorning: {
        colors: [
            '#1e3a5f', // Deep dawn blue
            '#1a2f4d', // Darker blue
            '#152138', // Very dark blue
        ],
        start: { x: 0, y: 0 },
        end: { x: 1, y: 1 },
    } as TimeGradient,

    // Morning (8-12 PM) - Professional dark blue
    morning: {
        colors: [
            '#1e40af', // Corporate blue
            '#1a3a8a', // Darker corporate
            '#172f6f', // Deep blue
        ],
        start: { x: 0, y: 0 },
        end: { x: 1, y: 1 },
    } as TimeGradient,

    // Afternoon (12-5 PM) - Neutral dark
    afternoon: {
        colors: [
            '#374151', // Dark gray
            '#2d3748', // Charcoal
            '#1f2937', // Deep gray
        ],
        start: { x: 0, y: 0 },
        end: { x: 1, y: 1 },
    } as TimeGradient,

    // Evening (5-8 PM) - Warm dark teal
    evening: {
        colors: [
            '#115e59', // Dark teal
            '#0f4c47', // Deeper teal
            '#0a3835', // Very dark teal
        ],
        start: { x: 0, y: 0 },
        end: { x: 1, y: 1 },
    } as TimeGradient,

    // Night (8 PM - 5 AM) - Deep night
    night: {
        colors: [
            '#1e293b', // Midnight slate
            '#172033', // Deeper midnight
            '#0f172a', // Almost black
        ],
        start: { x: 0, y: 0 },
        end: { x: 1, y: 1 },
    } as TimeGradient,
};

/**
 * Get time-based gradient based on current hour
 */
export const getWelcomeCardGradient = (isDark: boolean): TimeGradient => {
    const hour = new Date().getHours();
    const gradients = isDark ? WELCOME_CARD_DARK : WELCOME_CARD_LIGHT;

    if (hour >= 5 && hour < 8) return gradients.earlyMorning;
    if (hour >= 8 && hour < 12) return gradients.morning;
    if (hour >= 12 && hour < 17) return gradients.afternoon;
    if (hour >= 17 && hour < 20) return gradients.evening;
    return gradients.night;
};

/**
 * ========================================
 * RECOMMENDATION FOR BACKGROUNDS
 * ========================================
 * 
 * For APP BACKGROUNDS (light/dark mode):
 * - If gradients feel too subtle → Use SOLID COLORS instead
 * - Light: #f8f9fa (clean white-gray)
 * - Dark: #111827 (professional dark)
 * 
 * Benefits of solid colors for corporate:
 * ✓ More sterile and clinical
 * ✓ Better for readability
 * ✓ Emphasizes content over decoration
 * ✓ True bureaucratic aesthetic
 * ✓ Professional and mechanical
 * 
 * Use gradients only for:
 * - Login/Submit screens (already implemented)
 * - Welcome cards (dynamic, time-aware)
 */
