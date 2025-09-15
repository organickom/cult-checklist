# Cult Self‑Assessment Checklist (Static Site)

A free, standalone React + Vite + Tailwind web app. Scores a 40‑question cult risk checklist and exports results to JSON.

## Local setup
```bash
npm i
npm run dev
```

## Build
```bash
npm run build
```

The static site is generated in `dist/`.

## Deploy to GitHub Pages

### Option A: Project Pages (recommended)
1. Create a GitHub repo (e.g. `cult-checklist`), push this project.
2. Edit `vite.config.js` and set:
```js
base: '/cult-checklist/' // use your repo name
```
3. Commit & push.
4. Go to **Settings → Pages**:
   - Source: **GitHub Actions**.
5. The provided workflow (below) will build & publish automatically.

### Option B: User/Org Pages
If deploying to `https://<user>.github.io/` root, leave `base: ''` and push to a repo named `<user>.github.io`.

## GitHub Actions workflow
This repo includes `.github/workflows/deploy.yml` which:
- builds the site on pushes to `main`,
- publishes the `dist/` folder to GitHub Pages.

## Netlify/Cloudflare/Vercel
You can also deploy the `dist/` folder on any static host. For Netlify SPAs, add a `_redirects` file with:
```
/*  /index.html  200
```
