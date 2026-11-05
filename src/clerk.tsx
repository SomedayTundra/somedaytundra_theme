import * as React from 'react'
import { useClerk, useUser } from '@clerk/react'
import { type AccountPreferences, AccountPreferencesContext, useTheme } from './themeContext.ts'
import { isMotionId, isThemeId } from './themes.ts'

type StoredPreferences = { theme?: unknown; motion?: unknown }
type UserResource = NonNullable<ReturnType<typeof useUser>['user']>

// a tab coming back into view usually fires both visibilitychange and focus; one reload covers both
const RELOAD_THROTTLE_MS = 2000

function storedPreferences(user: UserResource): StoredPreferences {
    return (user.unsafeMetadata.preferences as StoredPreferences | undefined) ?? {}
}

/**
 * Keeps a signed-in user's theme and motion settings in their Clerk `unsafeMetadata` only, so they
 * follow the user to other browsers and to every ST app on the same Clerk instance; localStorage
 * keeps the signed-out choice, plus a copy of the account's for the first frame of a reload. On
 * sign-in the stored values win (an account with none takes this browser's), local changes are
 * saved, and a change saved elsewhere (another tab or another ST app) is picked up when this tab
 * comes back into view. (`unsafeMetadata` is user-writable from the browser, which is fine for
 * display preferences.) Render it inside both <ThemeProvider> and <ClerkProvider>.
 *
 * Stored values are read at only two moments: sign-in, and this tab's own reload when it comes back
 * into view. Clerk sends other user updates too (on focus, token refreshes, after a save), and some
 * still carry older metadata; following those made the theme flip back and forth.
 */
export function ThemePreferenceSync() {
    const { isLoaded, user } = useUser()
    const { theme, motion } = useTheme()
    const control = React.useContext(AccountPreferencesContext)
    if (control === null) throw new Error('ThemePreferenceSync must be used inside <ThemeProvider>')
    const { account, setAccount } = control

    // the settings showing now, for an account that has none stored yet to take
    const current = React.useRef({ theme, motion })
    React.useEffect(() => {
        current.current = { theme, motion }
    }, [theme, motion])

    // the latest user object, for the callbacks below to save through without re-subscribing
    const userRef = React.useRef(user)
    React.useEffect(() => {
        userRef.current = user
    }, [user])

    // what the account is known to hold, and for which user
    const known = React.useRef<{ userId: string; theme: unknown; motion: unknown } | null>(null)
    // the values this tab last sent, so a save still in flight isn't sent again
    const lastSaved = React.useRef<AccountPreferences | null>(null)
    // saves still in flight, and how many have been started: a reload that overlaps a save may
    // answer with the values from before it, so its answer is dropped
    const savesInFlight = React.useRef(0)
    const saveCount = React.useRef(0)

    const applyStored = React.useCallback(
        (userId: string, stored: StoredPreferences) => {
            known.current = { userId, theme: stored.theme, motion: stored.motion }
            setAccount({
                theme: isThemeId(stored.theme) ? stored.theme : current.current.theme,
                motion: isMotionId(stored.motion) ? stored.motion : current.current.motion,
            })
        },
        [setAccount]
    )

    // sign-in and sign-out
    const userId = user?.id ?? null
    React.useEffect(() => {
        if (!isLoaded) return
        const signedIn = userRef.current
        if (userId === null || !signedIn) {
            known.current = null
            lastSaved.current = null
            setAccount(null)
            return
        }
        if (known.current?.userId !== userId) applyStored(userId, storedPreferences(signedIn))
    }, [isLoaded, userId, applyStored, setAccount])

    // this tab -> account: a change made here, or what a first sign-in's account didn't have yet
    React.useEffect(() => {
        const signedIn = userRef.current
        const stored = known.current
        if (!signedIn || !account || stored?.userId !== signedIn.id) return
        if (account.theme === stored.theme && account.motion === stored.motion) return
        if (account.theme === lastSaved.current?.theme && account.motion === lastSaved.current?.motion) return
        const saving = { ...account }
        lastSaved.current = saving
        savesInFlight.current += 1
        saveCount.current += 1
        signedIn
            .update({ unsafeMetadata: { ...signedIn.unsafeMetadata, preferences: saving } })
            .then(
                () => {
                    if (known.current?.userId === signedIn.id) known.current = { userId: signedIn.id, ...saving }
                },
                () => {
                    // not being able to save a display preference shouldn't interrupt anything; let
                    // the next change try again
                    lastSaved.current = null
                }
            )
            .finally(() => {
                savesInFlight.current -= 1
            })
    }, [account])

    // account -> this tab: re-read the account whenever the tab comes back into view
    React.useEffect(() => {
        if (userId === null) return
        let lastReload = 0
        const refresh = () => {
            const signedIn = userRef.current
            if (!signedIn || document.visibilityState !== 'visible' || savesInFlight.current > 0) return
            if (Date.now() - lastReload < RELOAD_THROTTLE_MS) return
            lastReload = Date.now()
            const savesBefore = saveCount.current
            signedIn.reload().then(
                (fresh) => {
                    if (saveCount.current !== savesBefore || known.current?.userId !== fresh.id) return
                    const stored = storedPreferences(fresh)
                    const last = known.current
                    if (stored.theme !== last.theme || stored.motion !== last.motion) applyStored(fresh.id, stored)
                },
                () => {
                    // a missed refresh just means waiting for the next one
                }
            )
        }
        document.addEventListener('visibilitychange', refresh)
        window.addEventListener('focus', refresh)
        return () => {
            document.removeEventListener('visibilitychange', refresh)
            window.removeEventListener('focus', refresh)
        }
    }, [userId, applyStored])

    return null
}

/**
 * Picks up a sign-in or sign-out made in another ST app when this tab comes back into view. Clerk
 * keeps tabs in step only within one origin, and each ST app has its own, but they share Clerk's
 * client, so re-reading it shows whether its active session has changed. Render it inside
 * <ClerkProvider>.
 */
export function SessionFocusSync() {
    const clerk = useClerk()

    React.useEffect(() => {
        let lastCheck = 0
        const check = () => {
            const client = clerk.client
            if (!client || document.visibilityState !== 'visible') return
            if (Date.now() - lastCheck < RELOAD_THROTTLE_MS) return
            lastCheck = Date.now()
            client.reload().then(
                (fresh) => {
                    const signedIn = new Set(fresh.signedInSessions.map((session) => session.id))
                    const current = clerk.session?.id ?? null
                    // still signed in to the same session: nothing to do
                    if (current !== null && signedIn.has(current)) return
                    const next = fresh.lastActiveSessionId !== null && signedIn.has(fresh.lastActiveSessionId) ? fresh.lastActiveSessionId : null
                    if (next === current) return
                    clerk.setActive({ session: next }).catch(() => {
                        // a refresh still picks the change up
                    })
                },
                () => {
                    // a missed check just means waiting for the next one
                }
            )
        }
        document.addEventListener('visibilitychange', check)
        window.addEventListener('focus', check)
        return () => {
            document.removeEventListener('visibilitychange', check)
            window.removeEventListener('focus', check)
        }
    }, [clerk])

    return null
}
