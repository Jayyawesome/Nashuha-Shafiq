# Nashuha & Shafiq Digital Wedding Card

Standalone mobile-view digital wedding card for Nashuha and Shafiq.

## Run Locally

```powershell
corepack pnpm install
corepack pnpm dev
```

Open `http://127.0.0.1:3000/shua`.

## Project Files

- `app/shua/` - Shua wedding card route and styling
- `public/templates/shua/uploaded-design/` - uploaded Shua invitation design images
- `data/shua-rsvp.xlsx` - local Excel workbook used by RSVP submissions
- `src/components/preview/PersistentYouTubePlayer.tsx` - persistent YouTube music player
- `src/lib/` - small YouTube URL helpers

## RSVP Excel

When the site runs with `corepack pnpm dev` or `corepack pnpm start`, RSVP form submissions are appended to `data/shua-rsvp.xlsx`.
