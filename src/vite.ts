import { MOTION_IDS, MOTION_STORAGE_KEY, THEME_IDS, THEME_STORAGE_KEY } from './themes.ts'

// Runs before any CSS or app code: applies the saved theme and motion setting to <html>, so a
// reload doesn't flash the default theme while React starts up.
const INIT_SCRIPT = `
try {
    var themes = ${JSON.stringify(THEME_IDS)}, motions = ${JSON.stringify(MOTION_IDS)}
    var t = JSON.parse(localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)}) || 'null')
    if (themes.indexOf(t) !== -1) document.documentElement.dataset.theme = t
    var m = JSON.parse(localStorage.getItem(${JSON.stringify(MOTION_STORAGE_KEY)}) || 'null')
    if (motions.indexOf(m) !== -1) document.documentElement.dataset.motion = m
} catch (e) {}
`

// just the parts of Vite's Plugin type this uses, so the package doesn't depend on Vite
type IndexHtmlPlugin = {
    name: string
    transformIndexHtml: () => { tag: string; children: string; injectTo: 'head-prepend' }[]
}

/** Vite plugin that inlines the theme's pre-paint script at the top of index.html's <head>. */
export function somedaytundraTheme(): IndexHtmlPlugin {
    return {
        name: 'somedaytundra-theme',
        transformIndexHtml: () => [{ tag: 'script', children: INIT_SCRIPT, injectTo: 'head-prepend' }],
    }
}
