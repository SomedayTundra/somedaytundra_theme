// The spruce tree line both themes stand on, in a 1440x150 viewBox (stretched to the window width).
// It's deterministic, so Glacier Forest and Aurora draw the exact same trees.

export type TreeLine = {
    // the whole silhouette, ground included
    silhouette: string
    // every other tree again as closed shapes, so Glacier Forest can draw them in front of the snow
    alternateTrees: string
}

function buildTreeLine(): TreeLine {
    let silhouette = 'M0 150'
    let alternateTrees = ''
    for (let x = -10, k = 0; x < 1450; k++) {
        const r = (n: number) => (((Math.sin(k * 7.13 + n * 3.7) * 9301.17) % 1) + 1) % 1
        const h = 28 + r(1) * r(1) * 95
        const w = h * 0.34
        const left = `${(x - w / 2).toFixed(0)} ${(150 - h * 0.15).toFixed(0)}`
        const peak = `${x.toFixed(0)} ${(150 - h).toFixed(0)}`
        const right = `${(x + w / 2).toFixed(0)} ${(150 - h * 0.15).toFixed(0)}`
        silhouette += ` L${left} L${peak} L${right}`
        if (k % 2 === 1) {
            alternateTrees += `M${(x - w / 2).toFixed(0)} 150 L${left} L${peak} L${right} L${(x + w / 2).toFixed(0)} 150 Z `
        }
        x += 10 + r(2) * 22
    }
    silhouette += ' L1440 150 Z'
    return { silhouette, alternateTrees }
}

export const TREE_LINE = buildTreeLine()
