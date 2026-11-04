import clsx from 'clsx'
import { useTheme } from '../themeContext.ts'
import AuroraBackdrop from './AuroraBackdrop.tsx'
import GlacierForestBackdrop from './GlacierForestBackdrop.tsx'

// Fixed behind the whole app, so the snow and aurora stay put while the main area scrolls.
export default function Backdrop() {
    const { theme, animated } = useTheme()
    return (
        <div
            aria-hidden="true"
            className={clsx(
                'pointer-events-none fixed inset-0 z-0 overflow-hidden',
                theme === 'glacier-forest' ? 'gf-backdrop' : 'bg-page',
                animated && 'is-animated'
            )}
        >
            {theme === 'glacier-forest' ? <GlacierForestBackdrop /> : <AuroraBackdrop />}
        </div>
    )
}
