import * as React from 'react'
import { type LocalStorageOptions, useLocalStorageState } from './useLocalStorageState.ts'
import { ThemeContext } from './themeContext.ts'
import {
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

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    // the pre-paint script (see vite.ts) reads the same keys, so a reload doesn't flash the default
    const [theme, setTheme] = useLocalStorageState(THEME_STORAGE_KEY, DEFAULT_THEME, themeStorage)
    const [motion, setMotion] = useLocalStorageState(MOTION_STORAGE_KEY, DEFAULT_MOTION, motionStorage)
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

    return <ThemeContext value={value}>{children}</ThemeContext>
}
