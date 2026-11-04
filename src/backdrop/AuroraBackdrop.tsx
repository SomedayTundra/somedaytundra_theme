import type * as React from 'react'
import { TREE_LINE } from './treeline.ts'

function buildStars(): React.CSSProperties[] {
    const stars: React.CSSProperties[] = []
    for (let i = 0; i < 70; i++) {
        const r = (n: number) => (((Math.sin(i * 12.9898 + n * 78.233) * 43758.5453) % 1) + 1) % 1
        const size = 1 + r(1) * 1.8
        stars.push({
            left: `${(r(2) * 100).toFixed(2)}%`,
            // squaring bunches the stars toward the top of the sky
            top: `${(r(3) * r(3) * 70).toFixed(2)}%`,
            width: `${size.toFixed(1)}px`,
            height: `${size.toFixed(1)}px`,
            opacity: 0.2 + r(4) * 0.55,
            animationDuration: `${(2.5 + r(5) * 5).toFixed(1)}s`,
            animationDelay: `-${(r(6) * 6).toFixed(1)}s`,
        })
    }
    return stars
}

type Ray = { className: string; style: React.CSSProperties }

// Vertical ribbons whose bottoms trace a gentle wave. Every ray shares the 7s glow cycle, offset by
// its index, so brightening rolls along the curtain like the ripple in real aurora footage.
function buildRays(): Ray[] {
    const rays: Ray[] = []
    const row = (count: number, x0: number, x1: number, base: number, amp: number, hMin: number, hMax: number, className: string, seed: number) => {
        for (let i = 0; i < count; i++) {
            const r = (n: number) => (((Math.sin((i + seed) * 12.9898 + n * 78.233) * 43758.5453) % 1) + 1) % 1
            const t = i / (count - 1)
            const x = x0 + (x1 - x0) * t + (r(1) - 0.5) * 3
            const y = base + amp * Math.sin(t * Math.PI * 2.2 + seed)
            const h = hMin + r(2) * (hMax - hMin)
            const w = 34 + r(3) * 70
            rays.push({
                className,
                style: {
                    left: `${x.toFixed(2)}%`,
                    top: `${(y - h).toFixed(0)}px`,
                    width: `${w.toFixed(0)}px`,
                    height: `${h.toFixed(0)}px`,
                    marginLeft: `-${(w / 2).toFixed(0)}px`,
                    filter: `blur(${(6 + r(4) * 8).toFixed(1)}px)`,
                    animationDuration: `7s, ${(8 + r(5) * 7).toFixed(1)}s`,
                    animationDelay: `-${(i * 0.45).toFixed(2)}s, -${(r(6) * 10).toFixed(1)}s`,
                },
            })
        }
    }
    // the fainter teal-violet row sits higher and behind, on the right
    row(16, 45, 105, 210, 30, 140, 240, 'au-ray au-ray-b', 3.1)
    row(28, -2, 102, 330, 45, 170, 330, 'au-ray au-ray-a', 0.5)
    return rays
}

const STARS = buildStars()
const RAYS = buildRays()

export default function AuroraBackdrop() {
    return (
        <>
            {STARS.map((style, i) => (
                <span key={i} className="au-star" style={style} />
            ))}
            <div
                className="absolute -inset-x-[10%] top-[170px] h-[240px] rounded-[50%] blur-[30px]"
                style={{ background: 'radial-gradient(closest-side, rgba(75, 227, 160, 0.14), rgba(75, 227, 160, 0))' }}
            />
            <div className="au-field absolute inset-0">
                {RAYS.map((ray, i) => (
                    <div key={i} className={ray.className} style={ray.style} />
                ))}
            </div>
            {/* a faint horizon glow, so the black tree line has something to stand against */}
            <div
                className="absolute inset-x-0 bottom-0 h-[300px]"
                style={{ background: 'linear-gradient(0deg, rgba(42, 78, 98, 0.34) 0%, rgba(30, 58, 76, 0.16) 45%, rgba(30, 58, 76, 0) 100%)' }}
            />
            <svg
                viewBox="0 0 1440 150"
                preserveAspectRatio="none"
                className="absolute inset-x-0 bottom-0 h-[150px] w-full"
            >
                <path d={TREE_LINE.silhouette} fill="#020306" />
            </svg>
        </>
    )
}
