// The spruce tree line both themes stand on, drawn at a fixed scale whatever the window width:
// a narrow window shows fewer trees, not narrower ones. It's deterministic, so Glacier Forest and
// Aurora draw the exact same trees.

// Tree line units, 150 tall. The trees run this far to the right, enough for very wide windows.
const WIDTH = 5760
const HEIGHT = 150

// CSS pixels per unit across. It's the stretch the trees had when the line was fit to a maximized
// window on a 3840x2160 display at 125% scaling (3072 CSS px over 1440 units). Up and down, one
// unit is one pixel.
const SCALE_X = 3072 / 1440

export type TreeLine = {
    viewBox: string
    // the SVG's size in CSS pixels; the backdrop clips whatever runs past the window's right edge
    width: number
    height: number
    // the whole silhouette, ground included
    silhouette: string
    // every other tree again as closed shapes, so Glacier Forest can draw them in front of the snow
    alternateTrees: string
}

function buildTreeLine(): TreeLine {
    let silhouette = `M0 ${HEIGHT}`
    let alternateTrees = ''
    for (let x = -10, k = 0; x < WIDTH + 10; k++) {
        const r = (n: number) => (((Math.sin(k * 7.13 + n * 3.7) * 9301.17) % 1) + 1) % 1
        const h = 28 + r(1) * r(1) * 95
        const w = h * 0.34
        const left = `${(x - w / 2).toFixed(0)} ${(HEIGHT - h * 0.15).toFixed(0)}`
        const peak = `${x.toFixed(0)} ${(HEIGHT - h).toFixed(0)}`
        const right = `${(x + w / 2).toFixed(0)} ${(HEIGHT - h * 0.15).toFixed(0)}`
        silhouette += ` L${left} L${peak} L${right}`
        if (k % 2 === 1) {
            alternateTrees += `M${(x - w / 2).toFixed(0)} ${HEIGHT} L${left} L${peak} L${right} L${(x + w / 2).toFixed(0)} ${HEIGHT} Z `
        }
        x += 10 + r(2) * 22
    }
    silhouette += ` L${WIDTH} ${HEIGHT} Z`
    return {
        viewBox: `0 0 ${WIDTH} ${HEIGHT}`,
        width: Math.round(WIDTH * SCALE_X),
        height: HEIGHT,
        silhouette,
        alternateTrees,
    }
}

export const TREE_LINE = buildTreeLine()
