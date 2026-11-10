# @somedaytundra/theme

The SomedayTundra look, shared by every ST app: **Glacier Forest** (light: snow, ice and a snowy
tree line) and **Aurora** (dark: northern-lights ribbons over a night sky).

| Import | What it gives you |
|---|---|
| `@somedaytundra/theme/theme.css` | Both themes' color tokens on `<html data-theme="…">`, the Tailwind names for them (`bg-st-surface`, `text-st-ink`, `text-st-muted`, `border-st-line`, `bg-st-accent`, …), the fonts' Tailwind names, and the backdrop animations. |
| `@somedaytundra/theme` | `ThemeProvider` and `useTheme()` (theme plus the background-motion setting), `ThemeToggle` (`compact` for an icon-only version that fits a nav bar; `animationToggle={false}` drops the animation switch for apps without the backdrop; `stretch` fills the parent's width, sharing it between the theme buttons), `Backdrop`, `IglooMark`, `Wordmark`, `THEMES`, and `clerkAppearance()` for Clerk's screens. |
| `@somedaytundra/theme/clerk` | `ThemePreferenceSync`, which saves the theme and motion settings to the signed-in user's Clerk account. Needs `@clerk/react`. |
| `@somedaytundra/theme/vite` | `somedaytundraTheme()`, a Vite plugin that applies the saved theme before first paint. |

It's built for Vite + React 19 + Tailwind CSS v4 apps.

## Using it in an app

1. **Install** a tagged release:
   `npm install "github:SomedayTundra/somedaytundra_theme#v0.3.4"`.
   npm builds the package on install with its `prepare` script.

   To develop an app against a local checkout of this repo without changing its dependency, point
   the app's dev server at the checkout and leave builds on the release. The dashboard's
   `vite.config.ts` does this: when `command === 'serve'` and `../somedaytundra_theme/dist`
   exists, it aliases `@somedaytundra/theme`, `/clerk` and `/theme.css` to the checkout's files.
   It also lists the checkout first in `tsconfig` `paths`, with the installed copy as fallback.

2. **CSS.** Import it right after Tailwind:

   ```css
   @import "tailwindcss";
   @import "@somedaytundra/theme/theme.css";
   ```

   The file also points Tailwind at the package's built components (`@source "../dist"`), so the
   utility classes they use get generated. Body styles (`background: var(--page)`,
   `color: var(--ink)`) are left to each app. The font needs nothing: it sets `--font-sans`, which
   Tailwind's base styles already apply to the page.

3. **Fonts.** Add to `index.html`:

   ```html
   <link rel="preconnect" href="https://fonts.googleapis.com" />
   <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
   <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Sora:wght@500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" />
   ```

4. **Vite config.**

   ```ts
   import { somedaytundraTheme } from '@somedaytundra/theme/vite'

   export default defineConfig({
     plugins: [react(), tailwindcss(), somedaytundraTheme()],
     resolve: {
       // needed when the dev server uses a local checkout, which has its own dev copies of these
       dedupe: ['react', 'react-dom', '@clerk/react'],
     },
   })
   ```

5. **Providers.** Wrap the app in `ThemeProvider`, and render `<Backdrop />` once behind everything
   if you want the snow and aurora. With Clerk, theme its screens and sync the setting:

   ```tsx
   import { clerkAppearance, ThemeProvider, useTheme } from '@somedaytundra/theme'
   import { ThemePreferenceSync } from '@somedaytundra/theme/clerk'

   function ThemedClerk({ children }: { children: React.ReactNode }) {
       const { theme } = useTheme()
       return (
           <ClerkProvider publishableKey={key} appearance={clerkAppearance(theme)}>
               <ThemePreferenceSync />
               {children}
           </ClerkProvider>
       )
   }

   // <ThemeProvider><ThemedClerk><App /></ThemedClerk></ThemeProvider>
   ```

## How it works

- **Tokens.** Each theme sets the same CSS custom properties (`--page`, `--surface`, `--ink`,
  `--accent`, …) on `<html data-theme="…">`, and `@theme inline` maps them to Tailwind colors.
  Components only use those Tailwind names, so switching themes is just changing the attribute.
  Every token is prefixed: raw properties are `--st-*` and Tailwind names are `st-*`, so the
  theme can sit beside another design system. shadcn, for one, has its own `--muted` and
  `--accent`, which mean something different. An app built on shadcn maps shadcn's tokens onto
  these, e.g. `--background: var(--st-page)`. `--st-surface-solid` is the opaque surface, for
  menus and popovers; Aurora's `--st-surface` is translucent.
  A new theme is a new token block in `css/theme.css` plus an entry in `src/themes.ts`.
- **The accent scale**, lightest to darkest: `st-accent-soft` (resting tints, such as table header
  rows), `st-accent-tint` (the hover/highlight shade on a tint), `st-accent-soft-ink` (text on a
  tint), `st-accent` (solid), with `st-accent-ink` as the text on solid. On Glacier Forest it's
  one family of blues; on Aurora, greens.
- **Persistence.** `ThemeProvider` keeps the theme and motion setting in localStorage under
  `st.theme` and `st.motion`. Apps on the same origin share them. The Vite plugin reads the same
  keys before first paint.
- **Motion.** `always`, `system` (still when the OS asks apps to reduce motion) or `off`.
  `useTheme().animated` is the resolved answer. `setAnimated(on)` is the on/off switch, and it
  remembers whether "on" meant `always` or `system`.
- **Clerk sync.** `ThemePreferenceSync` stores `{ theme, motion }` in the user's
  `unsafeMetadata.preferences`. On sign-in the stored values win; after that, local changes are
  saved. Every app on the same Clerk instance sees the same preference.
- **Backdrops** are deterministic, so they draw the same every load. Both themes stand on one tree
  line (`src/backdrop/treeline.ts`). Glacier Forest redraws every other tree in front of the
  near snow, so flakes fall in front of some trees and behind others.

## Developing

```sh
npm install
npm run dev     # rebuilds dist/ on save; a linked app picks up the change right away
npm run build
npm run lint
```

`dist/` isn't committed: a GitHub install builds it through `prepare`. To release, bump
`version` in `package.json`, tag it (`git tag v0.1.1 && git push --tags`), and update the tag in
each app's dependency.
