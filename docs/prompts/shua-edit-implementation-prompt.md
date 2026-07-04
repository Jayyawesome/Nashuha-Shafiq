# Shua Wedding Card Edit Implementation Prompt

You are editing the existing Shua-only wedding card website. Do not rebuild from scratch.

## Project Context

- Target GitHub repo: `Jayyawesome/Nashuha-Shafiq`
- Local repo path: `C:\Users\asyra\Documents\Codex\shua-clean-export`
- Current route: `/shua`
- App stack: Next.js App Router, React, TypeScript, CSS Modules
- Primary files to edit:
  - `app/shua/ShuaCard.tsx`
  - `app/shua/page.module.css`
  - `public/templates/shua/uploaded-design/`
  - RSVP route/workbook only if the RSVP behavior needs a targeted fix
- Preserve the existing RSVP Excel flow, music dock, Apple-like bottom dock, separate circular music dock, and mobile-only wedding card experience.
- Final commit and push must go only to `Jayyawesome/Nashuha-Shafiq`, not the full `The Undangan` repo.

## Required Skills And Design Direction

Use the requested design guidance:

- superpowers
- frontend design
- design wizard
- shadcn style
- open design
- high-end visual design
- animation motion

The output should feel like a polished mobile digital wedding card, matching the Studio preview behavior and visual quality. Keep the dock familiar, smooth, and Apple-like. Do not add a landing-page marketing layout; the wedding card itself is the first experience.

## Source Requirements

Use these source files:

- Requirement document: `C:\Users\asyra\Downloads\Requirement edit shua.docx`
- Image folder: `C:\Users\asyra\Downloads\Shua\`

Use these four uploaded 1080x1920 images:

- `Opening Gate Background.png`
- `Main Page.png`
- `Background Second Page.png`
- `Background Last page.png`

Copy/replace the assets into the Shua repo under:

```text
public/templates/shua/uploaded-design/
```

Do not depend on files outside the repo at runtime.

## Required Page Flow

Implement the mobile card in this order:

1. Opening gate page
2. Landing page
3. Second invitation page
4. Tarikh & Masa
5. Lokasi
6. Countdown
7. Galeri
8. Wishes from RSVP
9. Last page

### Opening Gate Page

- Use `Opening Gate Background.png`.
- Use the same opening gate concept as the Studio website.
- Add a door/open transition animation when the guest taps the open button.
- The animation must be reduced-motion safe.
- Music should remain connected to the existing persistent YouTube player and must not reload on unrelated UI changes.

### Landing Page

- Use `Main Page.png` as the exact main image.
- The image should render full-width in the mobile card without cropping important text.
- Keep image dimensions stable and avoid layout shift.

### Second Invitation Page

- Use `Background Second Page.png` as the page background.
- Overlay all invitation text below with aesthetic fonts.
- Text must remain readable and fit inside the mobile viewport without overlap.

Second page text:

```text
Jeffri Bin Mat Jaafar
&
Sarina Binti Mat Din @ Samsudin

Walimatulurus

Setepak sirih, sekacip pinang, semekar senyuman, seikhlas hati
Dengan penuh kesyukuran ke hadrat Ilahi

Mengundang Dato' / Datin / Tuan / Puan / Encik / Cik
.......................................................................................................................

ke majlis perkahwinan anakanda kami

Fatin Nashuha Binti Jeffri
&
Mohamad Shafiq Bin Mohd Shakri
```

### Tarikh & Masa

- Show the wedding date and time:
  - `Sabtu, 22 Ogos 2026`
  - `12 tengah hari - 4 petang`
- Keep the existing calendar actions working from the dock sheet.

### Lokasi

- Show the venue:
  - `Kulim Golf Resort & Country`
  - `Persiaran Kulim Golf, Kulim Hi-Tech Park, 09000 Kulim, Kedah`
- Keep existing Google Maps and Waze dock actions.

### Countdown

- Place countdown between `Lokasi` and `Galeri`.
- Countdown target: `2026-08-22T12:00:00+08:00`.
- Render countdown without hydration mismatch. Initial server render should be stable, then update on the client.

### Galeri

- Add a gallery section after countdown.
- Use current uploaded Shua images if no separate gallery images are provided.
- The gallery should be swipe-friendly on mobile and must not cause horizontal body overflow.

### Wishes From RSVP

- Show wishes from the existing RSVP submissions.
- Preserve the RSVP Excel connection:
  - API route: `/api/rsvp`
  - Workbook: `data/shua-rsvp.xlsx`
- RSVP submissions should update the visible wishes preview after submit.

### Last Page

- Use `Background Last page.png` as the final page background.
- Keep final RSVP/Gift call-to-action available.
- Do not hide the bottom dock.

## Stitch Reference

Use the following Stitch reference for the animated text styling and screen inspiration.

```text
## Stitch Instructions
Get the images and code for the following Stitch project's screens:

## Project
Title: React Animated Text Component
ID: 3874607529239986889

## Screens:
1. Simplified Wedding Invitation
   ID: 6d1cdfe1b6314dc597133bc532d48309
```

Use a utility like `curl -L` to download hosted URLs if the Stitch tool gives hosted assets. If Stitch access is unavailable, proceed using the DOCX text and uploaded images, but keep the animated text direction.

## Dock Requirements

Preserve the existing dock behavior:

- Bottom Apple-like dock stays fixed.
- Music stays as a separate circular dock.
- Dock sheets open above the dock and cover the music dock when active.
- Existing dock actions must remain usable:
  - Masa
  - Lokasi
  - RSVP
  - Gift
  - Hubungi
- Do not introduce horizontal overflow at mobile widths.

## RSVP And Excel Requirements

Do not remove or break the current RSVP Excel implementation.

- RSVP form must submit to `/api/rsvp`.
- Submissions must append to `data/shua-rsvp.xlsx`.
- The wishes section must show recent RSVP wishes.
- Keep basic validation:
  - name required
  - attendance option required
  - pax clamped to a safe small number
  - wish text length bounded
- Protect Excel from formula injection for text fields that start with `=`, `+`, `-`, or `@`.

## Visual And Motion Requirements

- Prioritize mobile viewport polish.
- Use stable dimensions for 1080x1920 images.
- Keep typography elegant and readable.
- Do not let text overlap images, dock, or other content.
- Use subtle motion only where it improves the wedding-card experience.
- Respect `prefers-reduced-motion`.
- Avoid excessive gradients or decorative UI that competes with the uploaded artwork.

## Verification Checklist

Run these commands:

```powershell
corepack pnpm typecheck
corepack pnpm lint
corepack pnpm build
```

Browser-check `/shua` at mobile width:

- Opening gate animation works.
- Main image appears exactly.
- Second page text fits and remains readable.
- Tarikh & Masa, Lokasi, Countdown, Galeri, Wishes, and final page appear in order.
- Dock buttons open the correct sheets.
- Music dock remains separate and usable.
- RSVP submission updates wishes and writes to Excel.
- No hydration mismatch from countdown.
- No horizontal overflow.

## Delivery Requirements

- Keep edits scoped to the Shua-only repo.
- Do not commit to `Jayyawesome/olamak`.
- After implementation and verification, commit and push only to `Jayyawesome/Nashuha-Shafiq`.
