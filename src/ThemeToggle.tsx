import clsx from 'clsx'
import { Moon, Sparkles, Sun } from 'lucide-react'
import { useTheme } from './themeContext.ts'
import { THEMES, type ThemeId } from './themes.ts'

const OPTIONS: { id: ThemeId; Icon: typeof Sun }[] = [
    { id: 'glacier-forest', Icon: Sun },
    { id: 'aurora', Icon: Moon },
]

const segment = 'flex h-full cursor-pointer items-center rounded-lg transition-colors'
const fullSegment = `${segment} gap-2 px-3 text-[13.5px] font-bold`
// icon-only: square buttons, so the control fits in a nav bar
const compactSegment = `${segment} aspect-square justify-center`
const activeSegment = 'bg-st-accent-soft text-st-accent-soft-ink'
const inactiveSegment = 'text-st-muted hover:text-st-ink'

type ThemeToggleProps = {
    // day/night icons instead of the theme names, at nav-bar height
    compact?: boolean
}

// Quick-access switches for the theme and background animation; the same choices live under
// Settings › Appearance.
export default function ThemeToggle({ compact = false }: ThemeToggleProps) {
    const { theme, setTheme, animated, setAnimated } = useTheme()
    const button = compact ? compactSegment : fullSegment
    return (
        <div
            className={clsx(
                'flex items-center gap-1 border border-st-line bg-st-surface p-1',
                compact ? 'h-9 rounded-[10px]' : 'h-11 rounded-xl'
            )}
        >
            <div role="group" aria-label="Theme" className="flex h-full items-center gap-1">
                {OPTIONS.map(({ id, Icon }) => {
                    const active = theme === id
                    return (
                        <button
                            key={id}
                            type="button"
                            aria-pressed={active}
                            onClick={() => setTheme(id)}
                            title={THEMES[id].name}
                            className={clsx(button, active ? activeSegment : inactiveSegment)}
                        >
                            <Icon aria-hidden="true" className="size-4" />
                            {compact ? (
                                <span className="sr-only">{THEMES[id].name}</span>
                            ) : (
                                <>
                                    <span className="hidden sm:inline">{THEMES[id].name}</span>
                                    <span className="sr-only sm:hidden">{THEMES[id].name}</span>
                                </>
                            )}
                        </button>
                    )
                })}
            </div>
            <span aria-hidden="true" className={clsx('mx-0.5 w-px bg-st-line', compact ? 'h-4' : 'h-5')} />
            <button
                type="button"
                aria-pressed={animated}
                onClick={() => setAnimated(!animated)}
                title={animated ? 'Animation on' : 'Animation off'}
                className={clsx(button, animated ? activeSegment : inactiveSegment)}
            >
                <Sparkles aria-hidden="true" className={clsx('size-4', !animated && 'opacity-60')} />
                <span className="sr-only">Background animation</span>
            </button>
        </div>
    )
}
