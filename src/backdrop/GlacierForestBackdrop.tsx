import type * as React from 'react'
import { TREE_LINE } from './treeline.ts'

type Flake = { far: boolean; style: React.CSSProperties }

// 144 flakes: two thirds fall straight with a small sway; the last third is "distant snow" that is
// smaller, fainter, slower, and slants left. Static (non-animated) flakes sit at their `top` spread.
function buildFlakes(): Flake[] {
    const flakes: Flake[] = []
    for (let i = 0; i < 144; i++) {
        const r = (n: number) => (((Math.sin(i * 12.9898 + n * 78.233) * 43758.5453) % 1) + 1) % 1
        const far = i >= 96
        const size = far ? 1.5 + r(1) * 2.5 : 2 + r(1) * 4.5
        const fall = far ? 26 + r(5) * 18 : 14 + r(5) * 18
        const sway = far ? 4 + r(6) * 4 : 3 + r(6) * 4
        flakes.push({
            far,
            style: {
                left: `${(r(2) * (far ? 108 : 100)).toFixed(2)}%`,
                top: `${(r(3) * 92).toFixed(2)}%`,
                width: `${size.toFixed(1)}px`,
                height: `${size.toFixed(1)}px`,
                opacity: far ? 0.47 + r(4) * 0.46 : 0.6 + r(4) * 0.4,
                animationDuration: `${fall.toFixed(1)}s, ${sway.toFixed(1)}s`,
                animationDelay: `-${(r(7) * (far ? fall : 32)).toFixed(1)}s, -${(r(8) * 4).toFixed(1)}s`,
            },
        })
    }
    return flakes
}

const FLAKES = buildFlakes()
const FAR_FLAKES = FLAKES.filter((f) => f.far)
const NEAR_FLAKES = FLAKES.filter((f) => !f.far)

function treeLayer(children: React.ReactNode) {
    return (
        <svg
            viewBox="0 0 1440 150"
            preserveAspectRatio="none"
            className="absolute inset-x-0 bottom-0 h-[150px] w-full"
        >
            {children}
        </svg>
    )
}

// Back to front: distant snow, the full tree line, near snow, then every other tree again, so the
// near flakes pass in front of some trees and behind their neighbors.
export default function GlacierForestBackdrop() {
    return (
        <>
            {FAR_FLAKES.map((f, i) => (
                <span key={`far-${i}`} className="st-flake st-far" style={f.style} />
            ))}
            {treeLayer(<path d={TREE_LINE.silhouette} fill="#FFFFFF" />)}
            {NEAR_FLAKES.map((f, i) => (
                <span key={`near-${i}`} className="st-flake" style={f.style} />
            ))}
            {treeLayer(<path d={TREE_LINE.alternateTrees} fill="#FFFFFF" />)}
        </>
    )
}
