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

**Live:** https://rubywu-ux.github.io/pocket-worlds-oa/ . Works on phone, tablet and desktop. It's Sage's view of opening a gift from Irene. My direction for it is in [`prototype/SPEC.md`](prototype/SPEC.md).

**How it answers the brief's questions**

| Question | Answer in the prototype |
|---|---|
| What is the opening animation? | Tap the gift or **Open**. The box squashes and shakes while a sprout pushes the lid up from inside. Then it unboxes: the lid pops off and spins away, flowers and leaves grow out of the open heart box like a planter, light rays spin up, petals and sparkles burst out, and the gifts (Matcha Boba ×2, Summertime Bouquet ×1) pop up inside the box with a bouncy scale-in and stay there, glowing, as the focus. |
| How is the note shown with the gift? | The envelope floats to the center and the letter (the "from: Irene / sending to: Sage" card from Checkout) slips out of it and waits under "Take a peek": "Tap the letter to open it." Tapping fades it into Irene's note ("Irene left you a note"), and her Matcha Boba sticker slaps on. After **Continue**, the note settles underneath the gift and its listed items, and the gift box closes back up into its formal state. The sticker keeps gently rocking: "I'm here!" |
| Any further connection after opening? | **Send a gift back** (opens the gift shop with Irene as recipient). In V3/V4, also **Say thanks**: one-tap sticker reactions that fly to Irene. (A "Visit Irene's garden" button was removed: Sage receives gifts while she's already in her own garden, so it didn't make sense.) |

**Exploration variations** (three completely different animation styles and interaction flows, all in the Highrise / Picnic Gift Shop design language; the main link above stays the current pick). Each one has **sound effects and haptics** modelled on Duolingo's feedback: a soft "bloop" and a light tick on every tap, notes that climb a scale with haptics that strengthen as the moment builds, then a bright two-note ding, a short fanfare and a "success" buzz at the payoff. Sounds are synthesized live in the browser (Web Audio). Haptics use the Vibration API on Android, and a system tick on iOS 18+ Safari. There's a mute toggle (🔊, top right).

| Variation | Link | Opening (interaction + motion) | Note | After opening |
|---|---|---|---|---|
| 1 · Grow it | [/v1/](https://rubywu-ux.github.io/pocket-worlds-oa/v1/) | **Press and hold to water.** A watering can pours over the box, and a seedling grows out of the heart in stages for exactly as long as you hold. A Duolingo-style meter fills, and each stage plays a higher note with a stronger tick. At 100% the box blooms open with a fanfare, and the gifts pop up inside it. Organic, user-paced growth. | Irene's letter swings down off the box like a **gift tag**. Tap it: it flips up and the note **unrolls** beneath it. | The gift stays **planted and in bloom**. Items, note, Send a gift back. |
| 2 · Pull the ribbon | [/v2/](https://rubywu-ux.github.io/pocket-worlds-oa/v2/) | **Drag physics on a picnic blanket**, under the Picnic Gift Shop banner. Irene's envelope is **tied to the box's ribbon**. Drag it away: the ribbon stretches with a rising creak, the box leans toward your finger, and if you let go early it springs back. Past the breaking point the ribbon **snaps**, the lid flies off, and the gifts arc out and **bounce onto the blanket**. Tactile and physical, with no glow or magic. | **Pull the letter up** out of the envelope. It **flips like a card**, and the note is on the back. | The emptied box is closed again with the gifts **laid out beside it** on the blanket. |
| 3 · Reward reveal | [/v3/](https://rubywu-ux.github.io/pocket-worlds-oa/v3/) | **Fast game reward.** The gift is a Picnic Gift Shop **Offer Cell**. One tap charges it: it shakes harder as a tone climbs, then **pops** in confetti made of the banner's motifs (hearts, sparkles, petals). Three face-down cards deal out and **flip one by one**: the two gifts, then the note. **Collect all** flies the gifts into a garden-storage basket that counts up. Snappy, about 2 seconds. | The note is the **third card**. Tap it to read it big. | The screen is about Irene: her note, plus **one-tap sticker reactions to say thanks** that fly to her avatar, alongside Send a gift back. |
| 4 · Grow & collect | [/v4/](https://rubywu-ux.github.io/pocket-worlds-oa/v4/) | **V1 + V3, combined at my direction.** V1's gardening game opens it, but with **one tap** instead of a hold: tap and it waters itself, the seedling grows, the box blooms, and the gifts pop up inside it. Then comes V3's reward loop: tap the gifts (or **Collect all**) and each one jumps out of the box as a face-down reward card, flips face-up in confetti, and flies into the garden-storage basket, which counts up. | Opens **by itself** as the gifts go into storage: Irene's letter pops up, flips, and the note unrolls (no extra tap). | V3's ending: "✓ Collected", the note, **Say thanks** sticker reactions, Send a gift back. |

Skipping: V1, V2 and V4 put the interaction in your hands, so tapping is part of the flow. They have a **Skip** pill instead, and a fresh tap during the automatic part skips (in V4, a tap during the card animation finishes collecting). In V3, a tap while it plays fast-forwards to every card face up. Keyboard: in V1 hold Space; in V2 and V3, Enter/Space does the action for you. R replays and Esc closes.

**Things to try (and break)**

- Tap anywhere during the animation to skip straight to the opened gift. A double-tap on Open in quick succession doesn't count as a skip.
- When the letter appears, the sequence waits for you: tap the letter to open it.
- Tap the gift on the final screen, or ↻, to replay the opening. ✕ closes; "Replay the prototype" starts over.
- Keyboard: Space/Enter opens, skips and continues. R replays. Esc closes.
- "Reduce motion" in your OS settings gets a shorter, calmer version.

**Built with:** React, [Motion](https://motion.dev) (springs, gestures, shared-element transitions), Vite, deployed to GitHub Pages by a GitHub Action on every push. All motion is rendered live in code; nothing is pre-rendered video.

Run locally: `cd prototype && npm install && npm run dev`

## Checklist

- [ ] 3 wireframes: Customization & Recipient
- [ ] Final design: Customization & Recipient
- [ ] Final design: Checkout & Send
- [ ] Interactive prototype: Reception + Opening (live URL; clickable, not a video or GIF)
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
├── CLAUDE.md                 ← context and next steps for AI sessions
├── prototype/                ← Reception + Opening prototype (React + Motion + Vite)
│   ├── SPEC.md               ← my direction for the prototype
│   ├── src/components/       ← Gift, Letter, Note, Stage (opening), OpenView, ClosedView
│   ├── src/variants/v1–v3/   ← the three exploration variations (Grow it · Pull the ribbon · Reward reveal)
│   ├── src/variants/shared/  ← sound + haptics (feedback.ts), sound toggle, Skip pill
│   ├── v1/ v2/ v3/           ← the pages for each variation (/v1/, /v2/, /v3/)
│   ├── src/assets/           ← art exported from my Figma file (+ the generated open-box base)
│   └── tools/                ← scripts that draw the open heart box (make-open-heart-box.py, used by V4; make-box-base.py, the older traced one)
└── .github/workflows/        ← deploys the prototype to GitHub Pages
```
