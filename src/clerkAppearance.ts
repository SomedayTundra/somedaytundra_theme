import type { ThemeId } from './themes.ts'

// Clerk's own screens (sign-in modal, UserButton menu, account page) drawn in each theme.
export const CLERK_VARIABLES: Record<ThemeId, Record<string, string>> = {
    'glacier-forest': {
        colorPrimary: '#1F6BC0',
        colorPrimaryForeground: '#FFFFFF',
        colorBackground: '#FFFFFF',
        colorForeground: '#0E2238',
        colorMutedForeground: '#4A607A',
        colorInput: '#FFFFFF',
        colorInputForeground: '#0E2238',
        colorNeutral: '#35506D',
        colorBorder: '#D3E2F0',
    },
    aurora: {
        colorPrimary: '#5BE7A9',
        colorPrimaryForeground: '#03140C',
        colorBackground: '#0C1118',
        colorForeground: '#E7EEF4',
        colorMutedForeground: '#93A5B8',
        colorInput: '#101823',
        colorInputForeground: '#E7EEF4',
        colorNeutral: '#C4D0DC',
        colorBorder: '#1C2733',
    },
}

// The `appearance` prop for <ClerkProvider>, in the given theme's colors and the ST fonts.
export function clerkAppearance(theme: ThemeId) {
    return {
        variables: { ...CLERK_VARIABLES[theme], fontFamily: 'Manrope, system-ui, sans-serif', borderRadius: '0.75rem' },
    }
}
