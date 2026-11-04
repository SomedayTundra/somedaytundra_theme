export const THEME_IDS = ['glacier-forest', 'aurora'] as const
export type ThemeId = (typeof THEME_IDS)[number]

export const MOTION_IDS = ['always', 'system', 'off'] as const
export type MotionId = (typeof MOTION_IDS)[number]

export type ThemeInfo = {
    id: ThemeId
    name: string
    description: string
    // the igloo's gradient stops, left to right; also used for the Settings preview swatch
    iglooStops: [string, string, string]
    // the igloo's brick joints and door outline are drawn in the color of whatever sits behind it
    iglooCutout: string
}

export const THEMES: Record<ThemeId, ThemeInfo> = {
    'glacier-forest': {
        id: 'glacier-forest',
        name: 'Glacier Forest',
        description: 'Snow and ice: white and pale blue, with falling snow and a snowy tree line.',
        iglooStops: ['#F1F7FD', '#8DB6E2', '#1F6BC0'],
        iglooCutout: '#FFFFFF',
    },
    aurora: {
        id: 'aurora',
        name: 'Aurora',
        description: 'Near-black night sky with drifting northern-lights ribbons and stars.',
        iglooStops: ['#5BE7A9', '#4CCFE0', '#A98BFF'],
        iglooCutout: '#0C1118',
    },
}

export function isThemeId(value: unknown): value is ThemeId {
    return typeof value === 'string' && (THEME_IDS as readonly string[]).includes(value)
}

export function isMotionId(value: unknown): value is MotionId {
    return typeof value === 'string' && (MOTION_IDS as readonly string[]).includes(value)
}

// localStorage keys for the two settings. Apps on the same origin share them, and the pre-paint
// script from `@somedaytundra/theme/vite` reads them before the app loads.
export const THEME_STORAGE_KEY = 'st.theme'
export const MOTION_STORAGE_KEY = 'st.motion'
export const DEFAULT_THEME: ThemeId = 'glacier-forest'
export const DEFAULT_MOTION: MotionId = 'always'
