# Angeles Venue — 3D Landing Page

An immersive, scroll-driven landing page for an event venue. Next.js 14 (App
Router) · React 18 · TypeScript (strict) · Tailwind CSS · React Three Fiber ·
Framer Motion · Lenis.

```bash
npm install
npm run dev      # http://localhost:3000
```

| Script | What it does |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |

---

<<<<<<< HEAD
## ⚠️ Before this goes live

Three things will silently do the wrong thing until you deal with them.

### 1. The booking form does not send email

`POST /api/contact` validates the enquiry, logs it to the server console, and
**throws it away**. Every booking enquiry is lost until you wire a mail
provider. The exact spot is marked with a `TODO` in
[`src/app/api/contact/route.ts`](src/app/api/contact/route.ts), with a Resend
example. Add rate limiting and a spam check at the same time — a public,
unprotected form gets found by bots quickly.

### 2. The newsletter signup does not store addresses

Same story, in [`src/components/sections/Footer.tsx`](src/components/sections/Footer.tsx).
It currently tells the visitor plainly that it is not connected. Either wire it
to your mailing-list provider or delete the form — a signup box that discards
addresses is worse than no signup box.

### 3. All content is placeholder

See the checklist below.

---

## Content checklist

Everything the page renders comes from one file:
**[`src/lib/content.ts`](src/lib/content.ts)**. Search it for `TODO:`.

**Identity**
- [x] `VENUE.name` — set to "Angeles Venue"
- [ ] `VENUE.tagline`, `VENUE.intro`
- [ ] `VENUE.address` (all five fields)
- [ ] `VENUE.phone`, `VENUE.email`
- [ ] `VENUE.siteUrl` — must be the real deployed URL, or Open Graph images and
      canonical links resolve against `example.com`
- [ ] `VENUE.socials` — real profile URLs, or delete the entries
- [ ] `VENUE.mapEmbedUrl` — Google Maps → Share → **Embed a map** → copy the
      `src` value. A normal `maps.google.com/...` link will not render in an
      iframe. Until this is set, the footer shows a visible "not configured"
      notice rather than a blank gap.

**Copy**
- [ ] `ABOUT.heading`, `ABOUT.body`, `ABOUT.stats`
- [ ] `EVENT_TYPES` — descriptions and highlights for all four
- [ ] `TESTIMONIALS` — **real, attributable quotes only.** The placeholders say
      "Client name" on purpose. Publishing invented testimonials attributed to
      named people is dishonest and, in many jurisdictions, unlawful.

**Numbers**
- [ ] `AMENITIES` — every `value` is `0` deliberately. Real figures needed for
      capacity, floor area, parking, stage width and menu options. They render
      as "0" until then, which is obviously wrong — that is the point. A
      plausible-looking invented capacity is the kind of thing that survives to
      production unnoticed.

**Photography**
- [x] About section — `public/images/about-pavilion.jpg`
- [x] Gallery — 4 real photos in `public/images/gallery-*.jpg`
- [ ] Replace the remaining **4** Unsplash placeholders on the event-type cards
      (weddings, corporate, concerts, private parties) with real venue
      photography.

> Two things to keep in step if you add gallery images:
> `width`/`height` in `content.ts` must be the file's real pixel dimensions
> (they drive the masonry column balancing), and the `sizes` attribute in
> `Gallery.tsx` must match the column count in `useMasonryColumns.ts` — the
> gallery is **two columns** above 640px, chosen because the photos are
> panoramic and three columns rendered them as unreadable strips.

  When you swap an image, update **two** other things with it:

  1. `width`/`height` must match what the file actually is. They reserve layout
     space before load (no CLS), and the gallery's column balancer reads the
     ratio to decide placement. The current URLs pin both `w` and `h` so the
     returned file is exactly the declared size.
  2. `alt` must describe the new image. The existing alt text was written
     against these specific photographs. Change the `src` and leave the `alt`,
     and screen-reader users are told about a picture that isn't there.

  If you host images somewhere other than Unsplash, add the hostname to
  `images.remotePatterns` in [`next.config.mjs`](next.config.mjs).

---

## Structure

```
src/
  app/
    layout.tsx              fonts, metadata, JSON-LD, skip link, smooth scroll
    page.tsx                section composition + per-section code splitting
    globals.css             theme tokens, base styles, reduced-motion backstop
    api/contact/route.ts    booking endpoint (validates; does not yet send)
  components/
    3d/                     Canvas scenes — all client-only
    sections/               the eight page sections
    ui/                     Navbar, Button, Reveal, TiltCard, Counter,
                            Lightbox, floating-label fields, ScrollIndicator
    providers/              Lenis smooth scroll
  lib/
    animations.ts           every Framer Motion variant used on the page
    content.ts              ← all copy, images and contact details
    validation.ts           booking rules, shared by the form and the API
    webgl.ts                WebGL feature detection
    hooks/
  types/index.ts
```

---

## How a few things work

### Smooth scrolling

Lenis drives `window.scrollY`, so Framer's `useScroll` reads correct values with
no scroller proxy and in-page `#anchor` links still work.

**Lenis is not mounted at all** when `prefers-reduced-motion: reduce` is set. A
smooth-scroll library takes ownership of the wheel and interpolates every scroll
position, which is precisely the behaviour that setting exists to opt out of;
shortening the duration would not be an honest response.

### The 3D scenes

Loaded through `next/dynamic` with `ssr: false` — mandatory, since three touches
`window` at module scope. It also keeps three (~330 KB) out of the initial
bundle: **First Load JS is 152 kB**, and the 3D chunk is fetched after hydration.

Degradation, in increasing order of aggressiveness:

| Condition | Behaviour |
|---|---|
| `prefers-reduced-motion` | `frameloop="demand"` — one static frame, then idle |
| Below `md` | Petals 40 → 12, motes 800 → 200, no shadows, no env map, DPR ≤ 1.5 |
| Scrolled out of view | `frameloop="never"` — the GPU stops entirely |
| No WebGL, or scene throws | CSS gradient fallback, via feature detection + error boundary |

The chandelier scales itself from `viewport.width` so it fits any aspect ratio,
rather than being sized for a desktop window and swamping a phone screen.

### Accessibility

- Skip link is the first focusable element; `<main>` is focusable so activating
  it actually moves focus.
- Lightbox and mobile drawer both trap focus, close on `Escape`, and **restore
  focus to the element that opened them**.
- Counters expose the final value once to assistive tech; the animating digits
  are `aria-hidden`, so screen readers don't read a stream of intermediate
  numbers.
- Form fields use real `<label for>` elements — the "floating" label is a
  transform on that same label, never a placeholder standing in for one.
  Errors use `role="alert"` and `aria-describedby`.
- Canvases are marked decorative on their wrapper element (R3F forwards unknown
  props to the three.js renderer, so ARIA set on `<Canvas>` never reaches the
  DOM).
- Every animation respects `prefers-reduced-motion`, with a CSS backstop in
  `globals.css` for anything added later that forgets to check.

### Two non-obvious bugs this code works around

Both were found during browser testing and are commented at the source, because
they are easy to reintroduce:

1. **`clip-path` reveals deadlock with `whileInView`.** An element clipped to
   zero area reports an empty intersection rect in Chromium, so the observer
   that would reveal it never fires — and a lazy `next/image` inside it is never
   requested either. The gallery therefore observes an *unclipped* parent
   (`clipRevealContainer`) and puts the clip on a child. See
   [`src/lib/animations.ts`](src/lib/animations.ts).

2. **CSS multi-column breaks masonry.** A multicol container fragments its
   children, and Chromium then mis-reports IntersectionObserver *and*
   hit-testing for them — scroll reveals never fire and clicks land on the
   container instead of the tile. The gallery uses explicit flex columns with a
   greedy balancer instead. See
   [`src/lib/hooks/useMasonryColumns.ts`](src/lib/hooks/useMasonryColumns.ts).

---

## Verified

Checked in a real browser (Chromium, 1440×950 and 390×844):

- Production build, `tsc --noEmit` and ESLint all clean
- Zero console errors across desktop, mobile and reduced-motion sessions
- No horizontal overflow at either viewport
- All 13 images load; all gallery tiles reveal; 57/58 scroll reveals fire
- Lightbox: opens, moves focus in, arrow keys page, `Escape` closes, focus
  returns to the trigger
- Mobile drawer: `aria-expanded` toggles, `Escape` closes
- Reduced motion: Lenis not mounted, content fully reachable
- Form: empty submit produces three field errors and moves focus to the first
  invalid field; valid submit returns the success message

Not measured: Lighthouse scores (misleading against `next dev`) and real-device
GPU performance.
=======
>>>>>>> eb8c254fdfe90fe11ff6e367bf334a192add98fc
