# Cresvane.EXE

Vite + GSAP + Lenis single-page brand site.

## Commands

```bash
npm install
npm run generate:og   # creates public/og-image.png
npm run dev
npm run build
npm run preview
```

## Deploy on Vercel

1. Push this folder (or monorepo with root `cresvane-exe`) to GitHub.
2. [vercel.com](https://vercel.com) → **Add New Project** → import the repo.
3. If the app lives in `cresvane-exe`, set **Root Directory** to `cresvane-exe`.
4. **Framework Preset:** Vite  
5. **Build Command:** `npm run build`  
6. **Output Directory:** `dist`  
7. Deploy. Connect your domain under **Settings → Domains**.

Pushes to `main` auto-deploy when the project is linked.

## Content

Edit `src/config.js` only for copy, modules, links, and contact settings (`contact.formEndpointKey`, `whatsapp`, `calLink`).

## Contact intake (tech)

- **Lead capture:** `fetch()` POST to [Web3Forms](https://web3forms.com) (`contact.formEndpointKey`) with honeypot — no backend, no `mailto`.
- **Booking:** Cal.com inline embed (loaded on demand when “Book a 20-min call” is chosen).
- **WhatsApp:** `wa.me` deep link with prefilled message.
- **Copy email:** `navigator.clipboard.writeText` with `execCommand` fallback.
