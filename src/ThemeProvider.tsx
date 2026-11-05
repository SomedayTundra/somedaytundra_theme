import * as React from 'react'
import { type LocalStorageOptions, useLocalStorageState } from './useLocalStorageState.ts'
import { type AccountPreferences, AccountPreferencesContext, ThemeContext } from './themeContext.ts'
import {
    ACCOUNT_CACHE_KEY,
    DEFAULT_MOTION,
    DEFAULT_THEME,
    isMotionId,
    isThemeId,
    MOTION_STORAGE_KEY,
    type MotionId,
    THEME_STORAGE_KEY,
    type ThemeId,
} from './themes.ts'

const REDUCE_MOTION_QUERY = '(prefers-reduced-motion: reduce)'

function subscribeToReduceMotion(onChange: () => void) {
    const query = window.matchMedia(REDUCE_MOTION_QUERY)
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
}

function prefersReducedMotion() {
    return window.matchMedia(REDUCE_MOTION_QUERY).matches
}

// a stored value from an older build (or a hand edit) that isn't a known id falls back to the default
const themeStorage: LocalStorageOptions<ThemeId> = {
    deserialize: (raw: string): ThemeId => {
        const parsed: unknown = JSON.parse(raw)
        return isThemeId(parsed) ? parsed : DEFAULT_THEME
    },
}

const motionStorage: LocalStorageOptions<MotionId> = {
    deserialize: (raw: string): MotionId => {
        const parsed: unknown = JSON.parse(raw)
        return isMotionId(parsed) ? parsed : DEFAULT_MOTION
    },
}

function readAccountCache(): AccountPreferences | null {
    try {
        const parsed = JSON.parse(window.localStorage.getItem(ACCOUNT_CACHE_KEY) ?? 'null') as Partial<AccountPreferences> | null
        return parsed && isThemeId(parsed.theme) && isMotionId(parsed.motion) ? { theme: parsed.theme, motion: parsed.motion } : null
    } catch {
        return null
    }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    // the signed-out settings; the pre-paint script (see vite.ts) reads the same keys, so a reload
    // doesn't flash the default
    const [localTheme, setLocalTheme] = useLocalStorageState(THEME_STORAGE_KEY, DEFAULT_THEME, themeStorage)
    const [localMotion, setLocalMotion] = useLocalStorageState(MOTION_STORAGE_KEY, DEFAULT_MOTION, motionStorage)
    // a signed-in user's settings, which come from and go to their account only (see clerk.tsx), so
    // signing out returns to this browser's own signed-out choice. It starts from the first-frame
    // copy, so the first render matches what the pre-paint script drew.
    const [account, setAccount] = React.useState<AccountPreferences | null>(readAccountCache)
    React.useEffect(() => {
        try {
            if (account) window.localStorage.setItem(ACCOUNT_CACHE_KEY, JSON.stringify(account))
            else window.localStorage.removeItem(ACCOUNT_CACHE_KEY)
        } catch {
            // without the copy, a reload just shows the signed-out choice until Clerk loads
        }
    }, [account])
    const theme = account?.theme ?? localTheme
    const motion = account?.motion ?? localMotion

    const setTheme = React.useCallback(
        (next: ThemeId) => (account ? setAccount({ ...account, theme: next }) : setLocalTheme(next)),
        [account, setLocalTheme]
    )
    const setMotion = React.useCallback(
        (next: MotionId) => (account ? setAccount({ ...account, motion: next }) : setLocalMotion(next)),
        [account, setLocalMotion]
    )
    const reduceMotion = React.useSyncExternalStore(subscribeToReduceMotion, prefersReducedMotion)

    React.useEffect(() => {
        document.documentElement.dataset.theme = theme
        document.documentElement.dataset.motion = motion
    }, [theme, motion])

    const animated = motion === 'always' || (motion === 'system' && !reduceMotion)

    // remembered so switching animation back on restores "follow my system" rather than discarding it
    const lastOnMotion = React.useRef<MotionId>(motion === 'off' ? 'always' : motion)
    React.useEffect(() => {
        if (motion !== 'off') lastOnMotion.current = motion
    }, [motion])

    const setAnimated = React.useCallback(
        (on: boolean) => {
            if (!on) setMotion('off')
            // turning it on should visibly animate, so "system" only comes back if the OS allows motion
            else setMotion(lastOnMotion.current === 'system' && !reduceMotion ? 'system' : 'always')
        },
        [setMotion, reduceMotion]
    )

    const value = React.useMemo(
        () => ({ theme, setTheme, motion, setMotion, animated, setAnimated }),
        [theme, setTheme, motion, setMotion, animated, setAnimated]
    )

    const accountControl = React.useMemo(() => ({ account, setAccount }), [account])

    return (
        <AccountPreferencesContext value={accountControl}>
            <ThemeContext value={value}>{children}</ThemeContext>
        </AccountPreferencesContext>
    )
}
