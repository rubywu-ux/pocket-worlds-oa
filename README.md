# Garden Together · Gifting Flow

Ruby Wu's Product Designer take-home for **Pocket Worlds** (2026).

| | |
|---|---|
| Brief | [Product Designer Take-Home Evaluation (2026)](https://pocketworlds.notion.site/Product-Designer-Take-Home-Evaluation-2026-3c8df96d6c1e8042aca9e2b259794841) |
| Figma | [Take-Home](https://www.figma.com/design/MRDdpLZtFAk8viy9ZWGRxf/Take-Home?node-id=9146-1156) |
| Prototype | [rubywu-ux.github.io/pocket-worlds-oa](https://rubywu-ux.github.io/pocket-worlds-oa/) (source in [`prototype/`](prototype/)) |
| Portfolio | [ruby-wu.framer.website](https://ruby-wu.framer.website) |

## The brief, in short

*Garden Together* is a fictional, cozy social gardening game. Players tend personal gardens that friends can visit, explore, and leave gifts in. Gifts are purely cosmetic and decorate the recipient's garden. The task is to design the missing middle of a four-step gifting flow and bring the gift-opening moment to life. Everything has to look like it ships in the same build as the provided screens.

| Step | Given | What I deliver |
|---|---|---|
| 1. Gift Shop | Fully designed | Nothing. Study it, don't redesign it |
| 2. Customization & Recipient | Blank canvas | 3 low-fi wireframes (genuinely different approaches) + 1 final design |
| 3. Checkout & Send | Their wireframe | 1 final design |
| 4. Reception + Opening | Finished screen | 1 interactive prototype built with code, shared as a link |

The prototype should answer:

- What is the opening animation?
- How is the gift note shown together with the gift?
- Is there any further connection between sender and recipient after opening?

## Prototype: Reception + Opening

**Live:** https://rubywu-ux.github.io/pocket-worlds-oa/ : the final version, **"Grow & collect"**. Works on phone, tablet and desktop, with sound and haptics. It's Sage's view of opening a gift from Irene. My direction for it is in [`prototype/SPEC.md`](prototype/SPEC.md).

**How it answers the brief's questions**

| Question | Answer in the prototype |
|---|---|
| What is the opening animation? | A small gardening game. Tap **Water it** (or the gift): a watering can pours over the box and a seedling grows out of the heart in stages while a progress bar fills and the notes climb. Then the box blooms open: the lid pops off, flowers bloom behind it, and the gifts (Matcha Boba ×2, Summertime Bouquet ×1) pop up inside it. Tap **Collect all** (or the gifts): each gift jumps out of the box as a reward card, flips face-up in confetti, and flies into the garden-storage basket, which counts up to +3. |
| How is the note shown with the gift? | It arrives with the gifts. As they fly into storage, Irene's letter (the "from: Irene / sending to: Sage" card from Checkout) pops up on its own, flips up, and her note unrolls; her Matcha Boba sticker slaps on. **Continue** leads to the final screen, where the note sits under the list of what was in the gift, the sticker gently rocking. |
| Any further connection after opening? | **Say thanks**: one-tap sticker reactions (heart, flower, boba) that fly to Irene's avatar. **Send a gift back** opens the gift shop with Irene as the recipient. (I removed a "Visit Irene's garden" button: gifts arrive while Sage is already in her own garden, so it didn't make sense.) |

**Sound and haptics**, modelled on Duolingo's feedback: a soft "bloop" and a light tick on taps, notes that climb a scale with haptics that strengthen as the moment builds, then a bright two-note ding, a short fanfare and a "success" buzz at the payoff. Sounds are synthesized live in the browser (Web Audio); haptics use the Vibration API on Android and a system tick on iOS 18+ Safari. Mute toggle: 🔊, top right. (On iPhone, the silent switch also mutes web sound.)

**Things to try (and break)**

- Tap **Water it** once and watch it grow. Tap again while it waters to skip ahead to the bloom (a quick double-tap doesn't count).
- **Skip** (top left) jumps straight to the opened gift. A tap during the card animation finishes collecting.
- On the final screen: tap a sticker to say thanks; tap the gift card to replay; ✕ takes you back to the start (the "Water it" screen) to play it again.
- Keyboard: Space/Enter waters, skips ahead and collects. Esc on the final screen starts over.
- Short phones (iPhone SE, or with the browser bars showing) get a stacked layout so nothing overlaps.
- "Reduce motion" in your OS settings gets a shorter, calmer version.

**How I got here: explorations.** Before choosing, I had Claude build three completely different directions in the Highrise / Picnic Gift Shop design language, each at its own link, then combined my favorite parts into V4, which became the final (the main link above).

| Variation | Link | Opening (interaction + motion) | Note | After opening |
|---|---|---|---|---|
| 1 · Grow it | [/v1/](https://rubywu-ux.github.io/pocket-worlds-oa/v1/) | **Press and hold to water.** A watering can pours over the box, and a seedling grows out of the heart in stages for exactly as long as you hold. A Duolingo-style meter fills, and each stage plays a higher note with a stronger tick. At 100% the box blooms open with a fanfare, and the gifts pop up inside it. Organic, user-paced growth. | Irene's letter swings down off the box like a **gift tag**. Tap it: it flips up and the note **unrolls** beneath it. | The gift stays **planted and in bloom**. Items, note, Send a gift back. |
| 2 · Pull the ribbon | [/v2/](https://rubywu-ux.github.io/pocket-worlds-oa/v2/) | **Drag physics on a picnic blanket**, under the Picnic Gift Shop banner. Irene's envelope is **tied to the box's ribbon**. Drag it away: the ribbon stretches with a rising creak, the box leans toward your finger, and if you let go early it springs back. Past the breaking point the ribbon **snaps**, the lid flies off, and the gifts arc out and **bounce onto the blanket**. Tactile and physical, with no glow or magic. | **Pull the letter up** out of the envelope. It **flips like a card**, and the note is on the back. | The emptied box is closed again with the gifts **laid out beside it** on the blanket. |
| 3 · Reward reveal | [/v3/](https://rubywu-ux.github.io/pocket-worlds-oa/v3/) | **Fast game reward.** The gift is a Picnic Gift Shop **Offer Cell**. One tap charges it: it shakes harder as a tone climbs, then **pops** in confetti made of the banner's motifs (hearts, sparkles, petals). Three face-down cards deal out and **flip one by one**: the two gifts, then the note. **Collect all** flies the gifts into a garden-storage basket that counts up. Snappy, about 2 seconds. | The note is the **third card**. Tap it to read it big. | The screen is about Irene: her note, plus **one-tap sticker reactions to say thanks** that fly to her avatar, alongside Send a gift back. |
| 4 · Grow & collect (**final**) | [/v4/](https://rubywu-ux.github.io/pocket-worlds-oa/v4/) (same as the main link) | **V1 + V3, combined at my direction.** V1's gardening game opens it, but with **one tap** instead of a hold: tap and it waters itself, the seedling grows, the box blooms, and the gifts pop up inside it. Then comes V3's reward loop: tap the gifts (or **Collect all**) and each one jumps out of the box as a face-down reward card, flips face-up in confetti, and flies into the garden-storage basket, which counts up. | Opens **by itself** as the gifts go into storage: Irene's letter pops up, flips, and the note unrolls (no extra tap). | V3's ending: "✓ Collected", the note, **Say thanks** sticker reactions, Send a gift back. |

V1–V3 still carry a small "Vn · Name" tag at the top; the final doesn't. The very first version (envelope → letter, no sound) is still in the code (`prototype/src/components/`) and in the commit history.

**Built with:** React, [Motion](https://motion.dev) (springs, gestures, shared-element transitions), Vite, deployed to GitHub Pages by a GitHub Action on every push. All motion is rendered live in code; nothing is pre-rendered video.

Run locally: `cd prototype && npm install && npm run dev`

## Checklist

- [ ] 3 wireframes: Customization & Recipient
- [ ] Final design: Customization & Recipient
- [ ] Final design: Checkout & Send
- [x] Interactive prototype: Reception + Opening (live URL; clickable, not a video or GIF)
- [x] Hours worked stated in the Figma file
- [ ] Portfolio + prototype links at the top of the Figma file
- [ ] Flows laid out left to right in reading order

**Avoid:** "wireframes" that are just the final design in grey; a generic e-commerce checkout with the game context stripped out; AI output without a point of view; pre-rendered motion in place of live UI.

## How I used AI

The brief requires disclosing AI use. Log each meaningful use: the tool, what I asked for, and what I kept, changed, or overruled.

| Date | Tool | What I asked for | Kept / changed / overruled |
|---|---|---|---|
| Oct 4 | Claude | Set up this repo; summarize the brief into this README | |
| Oct 4 | Claude | Compare tools for building the prototype; write `CLAUDE.md` handoff notes | |
| Oct 4 | Claude | Build the Reception + Opening prototype from my written direction (`prototype/SPEC.md`) and my Figma screens | |
| Oct 4 | Claude | Set up three variation links, then explore three completely different animation styles and flows in the Picnic Gift Shop design language, with Duolingo-style sound and haptics | |
| Oct 4 | Claude | Combine my favorite parts into V4: V1's watering game and note tag, V3's reward cards + storage, V3's "Say thanks" ending | I picked the pieces to keep from each variation |
| Oct 4 | Claude | Polish V4 into the final | My calls: one tap to water instead of a hold; fewer steps (the note opens on its own while the gifts are collected); "in your gift" label; redraw the open heart box (it looked deformed); remove a water sound and an extra whoosh I hadn't asked for; remove "Visit Irene's garden" (gifts arrive while Sage is already in her garden); fix the phone layout overlap and the missing phone sound; keep Say thanks visible on phones; choose V4 as the final, without its label; remove the top-right replay button; make ✕ restart the flow at the "Water it" screen |

## Hours log

| Date | Hours | What I worked on |
|---|---|---|
| Oct 1 | 5 | |
| Oct 2 | 5 | |
| Oct 3 | 7 | |

## Repo structure

```
.
├── README.md
├── CLAUDE.md                     ← context and next steps for AI sessions
├── prototype/                    ← Reception + Opening prototype (React + Motion + Vite)
│   ├── SPEC.md                   ← my direction for the prototype
│   ├── index.html                ← the main link: loads the final (V4)
│   ├── src/variants/v4/          ← the final: GrowCollectStage (water → bloom → collect → note), OpenView (Say thanks)
│   ├── src/variants/v1–v3/       ← the explorations (Grow it · Pull the ribbon · Reward reveal)
│   ├── src/variants/shared/      ← sound + haptics (feedback.ts), sound toggle, Skip pill
│   ├── v1/ … v4/                 ← the pages for each variation (/v1/ … /v4/)
│   ├── src/components/           ← the first version (no longer on the main link)
│   ├── src/assets/               ← art exported from my Figma file (+ the drawn open heart box)
│   └── tools/                    ← scripts that draw the open heart box (make-open-heart-box.py is the one in use)
└── .github/workflows/            ← deploys the prototype to GitHub Pages
```
