import * as React from 'react'
import { useTheme } from '../themeContext.ts'
import { THEMES, type ThemeId } from '../themes.ts'

type IglooMarkProps = {
    width: number
    height: number
    // 'tight' crops the empty sky above the dome so the mark's bottom edge is the igloo's base,
    // which lets it share a baseline with text (see the signed-in card)
    crop?: 'full' | 'tight'
    // brick joints and the door outline are drawn in this color, so it should match what's behind
    cutout?: string
    // draw a specific theme's colors instead of the current one (e.g. the Settings previews)
    themeId?: ThemeId
    className?: string
}

const DOME = 'M8 92A52 52 0 0 1 112 92Z'
const BRICKS = 'M0 79H120M0 66H120M0 53H120M22 79V92M98 79V92M30 66V79M90 66V79M36 53V66M60 53V66M84 53V66M50 40V53M70 40V53'
const DOOR = 'M46 92V76A14 14 0 0 1 74 76V92Z'

// The SomedayTundra igloo, colored for the current theme.
export default function IglooMark({ width, height, crop = 'full', cutout, themeId, className }: IglooMarkProps) {
    const { theme } = useTheme()
    const info = THEMES[themeId ?? theme]
    const id = React.useId()
    const gradientId = `${id}-gradient`
    const clipId = `${id}-dome`
    const stroke = cutout ?? info.iglooCutout

    return (
        <svg
            viewBox={crop === 'tight' ? '4 38 112 54' : '0 0 120 96'}
            width={width}
            height={height}
            aria-hidden="true"
            className={className}
        >
            <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0" stopColor={info.iglooStops[0]} />
                    <stop offset="0.55" stopColor={info.iglooStops[1]} />
                    <stop offset="1" stopColor={info.iglooStops[2]} />
                </linearGradient>
                <clipPath id={clipId}>
                    <path d={DOME} />
                </clipPath>
            </defs>
            <path d={DOME} fill={`url(#${gradientId})`} />
            <g clipPath={`url(#${clipId})`} stroke={stroke} strokeWidth="3.4" fill="none">
                <path d={BRICKS} />
            </g>
            <path d={DOOR} fill={`url(#${gradientId})`} stroke={stroke} strokeWidth="4" />
        </svg>
    )
}
