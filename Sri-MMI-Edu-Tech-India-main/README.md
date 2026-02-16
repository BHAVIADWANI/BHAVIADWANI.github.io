# Sri MMI Edu Tech India

Static marketing site and admin lead viewer for Sri MMI Edu Tech India.

## Project structure
- index.html: Public landing page with contact form.
- admin.html: Admin view for stored leads (localStorage driven).
- styles.css: Global styles and layout.
- script.js: Landing page interactions and lead capture logic.
- admin.js: Admin panel logic (lead listing, export, search).

## Getting started
1) Clone the repo and open the folder.
2) Open index.html in a browser to view the site.
3) Use a simple static server if you prefer (e.g., `npx serve .` or VS Code Live Server) for consistent localStorage behavior.

## Lead storage
- Submissions are stored in `localStorage` under the key `sriMMILeads`.
- admin.html reads the same storage to display, search, clear, and export leads.

## Development notes
- No build step or backend required; everything runs in the browser.
- Keep external CDN links (Font Awesome) reachable when testing offline or bundle them locally if needed.

## Deployment
- Host as static files (GitHub Pages, Netlify, Vercel, S3/CloudFront, etc.).
- Ensure index.html is the entry point; admin.html can be linked privately or protected via hosting rules if required.

## Git hints
- Set your git user email to the GitHub noreply address to avoid GH007 push rejection: `git config user.email "<id+username@users.noreply.github.com>"` and amend the last commit if needed.
