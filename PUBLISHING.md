# Publishing to the web (GitHub Pages)

Your GitHub username is `kennyeaswaran`, so the site will live at
`https://kennyeaswaran.github.io/REPONAME/` (pick the repo name accordingly —
e.g. `streetymology`). A custom domain can be pointed at it later.

## One-time setup

1. **Save the geometry file first.** Open the map, click "Save geometry file",
   and move `streets-geometry.js` from Downloads into this folder. Committing it
   means visitors never depend on Overpass.

2. **Create the repo on github.com.** Click the "+" (top right) → New repository
   → name it (e.g. `streetymology`) → Public → do NOT check "Add a README"
   (we have one) → Create repository.

3. **Install GitHub Desktop** (desktop.github.com) and sign in — the friendliest
   way to use git regularly. Then: File → Add Local Repository → choose this
   folder → it will say it isn't a git repository yet and offer to create one →
   accept.

4. **First commit and publish.** In GitHub Desktop you'll see all files listed
   as changes. Type a summary like "Initial prototype" (bottom left) → Commit to
   main → click "Publish repository" (top bar) → uncheck "Keep this code
   private" → make sure the name matches the repo from step 2 → Publish.

5. **Turn on Pages.** On github.com, open the repo → Settings → Pages →
   under "Build and deployment", set Source to **GitHub Actions**. The included
   workflow (.github/workflows/deploy.yml) takes over: on every push it runs
   `node check-data.js` and deploys only if the data validates. Watch progress
   in the repo's Actions tab; the first run finishes in about a minute, then the
   site is live.

## Everyday updates

Edit files → GitHub Desktop shows the diff → write a one-line summary →
Commit to main → Push origin. The checker runs automatically; if it fails,
the previous version of the site stays up (see the red X in the Actions tab
for what went wrong).

## Custom domain (later)

Don't redirect — point the domain at GitHub so it stays in the address bar:

1. Buy the domain (Porkbun, Cloudflare, Namecheap; ~$10–12/yr).
2. At the registrar, add a CNAME record: `www` → `kennyeaswaran.github.io`.
   For the bare domain (no www), add the four GitHub Pages A records
   (185.199.108.153 / .109. / .110. / .111.).
3. Repo → Settings → Pages → Custom domain → enter the domain → Save.
   Check "Enforce HTTPS" once the certificate is issued (minutes to an hour).

## Notes

- git + Dropbox both sync this folder; that's fine day-to-day on one machine,
  but if you ever see odd "conflicted copy" files, resolve in git's favor.
- OSM's tile server is fine for modest public traffic; if the site takes off,
  switch the tile URL in index.html to a free-tier provider (MapTiler,
  Protomaps) and keep the attribution line.
