# revival-ui

Shared design system for Revival Christian Fellowship's internal apps
(vitals, design, signage, steward, dashboard). Served statically at
`https://assets.revival.tv/`, which points at a Cloudflare Pages project
(`revival-ui.pages.dev`) connected directly to this repo. **Pushing to
`main` auto-deploys** — nothing else to run.

## Files

- `revival-ui.css` — shared design tokens (colors, fonts) and base styles.
  Linked by every site: `<link rel="stylesheet" href="https://assets.revival.tv/revival-ui.css">`
- `app-switcher.js` — shared app-switcher menu. Single source of truth for
  the list of apps (name, url). Every site includes it instead of
  hand-rolling its own switcher markup:

  ```html
  <div class="app-switcher" data-app-switcher="vitals"></div>
  ...
  <script src="https://assets.revival.tv/app-switcher.js"></script>
  ```

  The `data-app-switcher` value is the app's `key` in the `APPS` array
  (`dashboard`, `design`, `signage`, `steward`, `vitals`). To add, rename,
  reorder, or re-point an app for every site at once, edit `APPS` in
  `app-switcher.js` and push to `main` — every site picks it up on next
  load.
