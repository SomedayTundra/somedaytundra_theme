import * as React from 'react'
import { useUser } from '@clerk/react'
import { useTheme } from './themeContext.ts'
import { isMotionId, isThemeId } from './themes.ts'

type StoredPreferences = { theme?: unknown; motion?: unknown }

/**
 * Keeps the theme and motion settings in the signed-in user's Clerk `unsafeMetadata`, so they follow
 * the user to other browsers and to every ST app on the same Clerk instance. On sign-in the stored
 * values win; after that, local changes are saved. (`unsafeMetadata` is user-writable from the
 * browser, which is fine for display preferences.) Render it inside both <ThemeProvider> and
 * <ClerkProvider>.
 */
export function ThemePreferenceSync() {
    const { user } = useUser()
    const { theme, setTheme, motion, setMotion } = useTheme()
    // which user's stored preferences have been applied, so a fresh sign-in takes their stored theme
    // instead of overwriting it with whatever this browser had
    const syncedUserId = React.useRef<string | null>(null)

    React.useEffect(() => {
        if (!user) {
            syncedUserId.current = null
            return
        }
        const stored = user.unsafeMetadata.preferences as StoredPreferences | undefined
        let nextTheme = theme
        let nextMotion = motion
        if (syncedUserId.current !== user.id) {
            syncedUserId.current = user.id
            if (isThemeId(stored?.theme)) nextTheme = stored.theme
            if (isMotionId(stored?.motion)) nextMotion = stored.motion
            setTheme(nextTheme)
            setMotion(nextMotion)
        }
        // also saves whatever the account didn't have yet, e.g. on a first sign-in
        if (stored?.theme === nextTheme && stored?.motion === nextMotion) return
        user.update({ unsafeMetadata: { ...user.unsafeMetadata, preferences: { theme: nextTheme, motion: nextMotion } } }).catch(() => {
            // not being able to save a display preference shouldn't interrupt anything
        })
    }, [user, theme, motion, setTheme, setMotion])

    return null
}
