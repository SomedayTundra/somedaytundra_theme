import clsx from 'clsx'
import { Moon, Sparkles, Sun } from 'lucide-react'
import { useTheme } from './themeContext.ts'
import { THEMES, type ThemeId } from './themes.ts'

const OPTIONS: { id: ThemeId; Icon: typeof Sun }[] = [
    { id: 'glacier-forest', Icon: Sun },
    { id: 'aurora', Icon: Moon },
]

const segment = 'flex h-full cursor-pointer items-center gap-2 rounded-lg px-3 text-[13.5px] font-bold transition-colors'
const activeSegment = 'bg-accent-soft text-accent-soft-ink'
const inactiveSegment = 'text-muted hover:text-ink'

// Quick-access switches for the theme and background animation; the same choices live under
// Settings › Appearance.
export default function ThemeToggle() {
    const { theme, setTheme, animated, setAnimated } = useTheme()
    return (
        <div className="flex h-11 items-center gap-1 rounded-xl border border-line bg-surface p-1">
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
                            className={clsx(segment, active ? activeSegment : inactiveSegment)}
                        >
                            <Icon aria-hidden="true" className="size-4" />
                            <span className="hidden sm:inline">{THEMES[id].name}</span>
                            <span className="sr-only sm:hidden">{THEMES[id].name}</span>
                        </button>
                    )
                })}
            </div>
            <span aria-hidden="true" className="mx-0.5 h-5 w-px bg-line" />
            <button
                type="button"
                aria-pressed={animated}
                onClick={() => setAnimated(!animated)}
                title={animated ? 'Animation on' : 'Animation off'}
                className={clsx(segment, animated ? activeSegment : inactiveSegment)}
            >
                <Sparkles aria-hidden="true" className={clsx('size-4', !animated && 'opacity-60')} />
                <span className="sr-only">Background animation</span>
            </button>
        </div>
    )
}
