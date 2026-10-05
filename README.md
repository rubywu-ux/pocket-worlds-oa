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
| What is the opening animation? | Tap the gift or **Open**. The box squashes and shakes while a sprout pushes out of the top. Then the bud bursts: flowers and leaves spill out of the box like a planter, light rays spin up, petals and sparkles burst out, and the items (Matcha Boba ×2, Summertime Bouquet ×1) pop up out of the bloom. After opening, "in your gift" lists them with the Sweetheart Box ×1, matching the Checkout screen. |
| How is the note shown with the gift? | The envelope floats to the center and the letter (the "from: Irene / sending to: Sage" card from Checkout) slips out of it and waits under "Take a peek": "Tap the letter to open it." Tapping fades it into Irene's note ("Irene left you a note"), and her Matcha Boba sticker slaps on. After **Continue**, the note settles underneath the opened gift and its items. The sticker keeps gently rocking: "I'm here!" |
| Any further connection after opening? | **Send a gift back** (opens the gift shop with Irene as recipient) and **Visit Irene's garden**. |

**Things to try (and break)**

- Tap anywhere during the animation to skip straight to the opened gift. A double-tap on Open in quick succession doesn't count as a skip.
- When the letter appears, the sequence waits for you: tap the letter to open it.
- Tap the opened gift, or ↻, to replay. ✕ closes; "Replay the prototype" starts over.
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
│   ├── src/components/       ← Gift, Note, Stage (opening), OpenView, ClosedView
│   └── public/assets/        ← art exported from my Figma file
└── .github/workflows/        ← deploys the prototype to GitHub Pages
```
