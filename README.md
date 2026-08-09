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
- [x] `VENUE.address` — P1B-P4 B85 L2 Carissa Homes, Bagtas, Tanza, Cavite.
      Postcode `4108` is the published code for Tanza and was **not** verified
      against the lot; correct it if your mail uses a different one. It feeds
      the JSON-LD that Google reads, not just the visible text.
- [x] `VENUE.phone` / `VENUE.contactPerson` — 0915 076 2666, ask for Eva
- [ ] `VENUE.email` — still `hello@example.com`
- [ ] `VENUE.siteUrl` — must be the real deployed URL, or Open Graph images and
      canonical links resolve against `example.com`
- [x] `VENUE.socials` — Facebook only. The Instagram and TikTok entries were
      removed rather than left pointing at those sites' homepages; add them back
      when real profiles exist.
- [ ] `VENUE.mapEmbedUrl` — Google Maps → Share → **Embed a map** → copy the
      `src` value. A normal `maps.google.com/...` link will not render in an
      iframe. Until this is set, the footer shows a visible "not configured"
      notice rather than a blank gap.

**Copy**
- [ ] `ABOUT.heading`, `ABOUT.body`, `ABOUT.stats`
- [x] `SERVICE_PACKAGES` / `SERVICE_ADDONS` — the real rate card, **plus one
      addition not printed on it**: "Guest room with a bed, comfort room and
      lavatory". Because the CR and lavatory sit inside that room, the kitchen
      line is just "Kitchen" — do not restore "Kitchen and comfort room" when
      diffing against the card, or the page will claim two comfort rooms.

      Replaced the
      invented Weddings/Corporate/Concerts/Private-Parties cards, which claimed
      a bridal suite, AV rigging, breakout rooms, a house PA, a green room and a
      late licence — none of which this venue has.

      > **Prices are deliberately not published.** The venue quotes on enquiry,
      > so `ServicePackage` has **no price field**. If rates should go on the
      > site, add the field consciously — do not scatter peso figures into the
      > inclusion strings.

- [ ] `TESTIMONIALS` — **real, attributable quotes only.** The placeholders say
      "Client name" on purpose. Publishing invented testimonials attributed to
      named people is dishonest and, in many jurisdictions, unlawful.

**Numbers**
- [x] `ABOUT.stats` — Guests 100, Hours of use 10, Events hosted 20+, Years
      operating 5.

      > The **Venue section was removed entirely**, along with `AMENITIES`, the
      > `Amenity`/`AmenityIconName` types, `Amenities.tsx`, `Counter.tsx` and the
      > `useCountUp` hook. Capacity and hours moved into `ABOUT.stats`; chairs,
      > wifi users and water gallons were dropped because the Services packages
      > already state them. `useInViewOnce` in `lib/hooks/useInViewOnce.ts` now
      > has no consumer — its sibling `useIsInView` is still used by the two 3D
      > components, so the file stays.

**Photography**
- [x] About section — `public/images/about-pavilion.jpg`
- [x] Gallery — 4 real photos in `public/images/gallery-*.jpg`
- [x] Hero — the AV monogram, `public/images/logo-monogram.png`.
- [x] Navbar — the leaf/blossom mark, `public/images/logo-watermark.jpg`.

      **The two marks are deliberately different**, and only the monogram has an
      alpha channel. The watermark is a JPEG on an opaque white ground, which is
      why the navbar keeps `rounded-lg` — and why it cannot use
      `mix-blend-multiply` to drop that white: the bar gains `backdrop-blur-lg`
      once scrolled, creating a stacking context that isolates the blend.

      Both use `alt=""`: the venue name is drawn inside each artwork and is
      already announced by the `sr-only` `<h1>` (hero) and the wordmark
      (navbar), so alt text would read it out twice.

      > **This file is cropped, and must stay cropped.** The source export is
      > 2000×2000 with the mark filling only 59% × 52% of it, off-centre. Drop
      > that file in unchanged and the logo renders ~40% smaller than its box,
      > visibly off-axis, with the empty margin pushing the hero copy down. The
      > crop script is `scratchpad/verify/crop-logo.mjs`; it measures the
      > artwork's bounding box rather than hard-coding it.

      > It has a **real alpha channel**, so no `mix-blend-multiply` is needed —
      > which is also why the hero logo can live inside the animating wrapper.
      > A blended image cannot: any stacking context above it isolates the
      > blend. Keep that in mind if the mark is ever re-exported flattened.

      `hero-banner.png`, `hero-leaf-frame.png` and `logo-watermark.jpg` are all
      unreferenced now. The first two are untracked in git (deleting them is
      unrecoverable); `logo-watermark.jpg` is tracked.
- [x] **No stock photography remains.** The last four Unsplash images lived on
      the event-type cards, which are gone. `images.unsplash.com` in
      `next.config.mjs` is now unused config — harmless, and still there if you
      ever want a stock image again.

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
    ui/                     Navbar, Preloader, Button, Reveal, TiltCard,
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

### The preloader

`src/components/ui/Preloader.tsx`, mounted in `layout.tsx`. Three constraints,
all easy to undo by accident:

1. **It must be server-rendered.** A preloader that mounts after hydration
   paints the page first and *then* covers it — backwards, and it looks like a
   bug. Being in the initial HTML puts it in the first paint. Nothing about this
   is visible in the hydrated DOM, so the check asserts it against the raw HTML
   response.
2. **The exit guard is effect-scoped, not a ref.** It exists only to stop
   `load` and the 4s cap from both scheduling the exit. As a `useRef` it also
   survived the cleanup React 18 StrictMode performs between its double mount:
   the second run found the guard already set, scheduled nothing, and the
   overlay stayed up permanently. Likewise `prefersReducedMotion` is *not* an
   effect dependency — it settles from `false` to its real value after mount,
   and rebuilding the timers mid-flight is the same failure.
3. **There is a CSS failsafe** (`#preloader` in `globals.css`) that retires the
   overlay at 8s with no JS involved. Without it, a JS failure leaves the whole
   site sitting in the DOM behind an opaque panel. The reduced-motion block at
   the bottom of that file overrides `animation-duration` but not
   `animation-delay`, so the failsafe still waits its 8s there.

Its background is `ivory-100` to equal the hero's, so the fade dissolves the
logo and type without the ground changing colour underneath.

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
