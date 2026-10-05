# CLAUDE.md: working notes for AI sessions

This file carries context between Claude sessions. Read it in full before doing anything. Before a session ends, or when usage is running low, update **Next steps** and **Session log**, then commit and push.

## Project

Ruby Wu's Product Designer take-home for **Pocket Worlds** (2026): a gifting flow for the fictional, cozy social gardening game *Garden Together*. The brief summary, deliverables checklist, AI-use log and hours log are in `README.md`.

- Brief: https://pocketworlds.notion.site/Product-Designer-Take-Home-Evaluation-2026-3c8df96d6c1e8042aca9e2b259794841
- Figma (Ruby's working file): https://www.figma.com/design/MRDdpLZtFAk8viy9ZWGRxf/Take-Home?node-id=9146-1156
- Repo: https://github.com/rubywu-ux/pocket-worlds-oa (public, branch `main`)
- Timeline: 4 days to complete per the brief. Deadline: _(Ruby to add)_

## Current focus: Part 4, Reception + Opening prototype

The receiving player opens the app and finds a gift waiting. Pocket Worlds provides this screen; the job is to bring the opening to life as a small prototype built with AI. Riffing on and extending the provided screen is encouraged.

The prototype must answer:
1. What is the opening animation?
2. How is the gift note shown together with the gift?
3. Is there any further connection between sender and recipient after opening?

Hard requirements:
- Delivered as a **live link**. Reviewers must be able to click through it and break it.
- **Built with code.** A screen recording, rendered video or GIF does not count, and pre-rendered motion (e.g. a Lottie/MP4 as the main moment) is on their avoid list.
- Must look like it ships in the same build as the provided screens. Don't invent a new visual language.
- AI use is required **and must be disclosed**. They want to see how Ruby directs the AI and where she overrules it.

## Decisions so far

- 2026-10-04: The repo is named `pocket-worlds-oa` and is public. Commits are authored as Ruby Wu with a `Co-Authored-By: Claude` trailer (Ruby chose to keep it).
- 2026-10-04: Pocket Worlds' template files (`*.fig`, `Take-Home*.zip`) are git-ignored. Never commit them.
- 2026-10-04: Prototype tooling: **React + Motion (Framer Motion) built with Vite, deployed to GitHub Pages** from this repo (`rubywu-ux.github.io/pocket-worlds-oa`). Ruby asked to start building on Claude's recommendation. Alternatives considered: Figma Make, v0, Cursor/Codex.
- 2026-10-04: Ruby's direction for the prototype is in **`prototype/SPEC.md`** (gardening bloom opening, Duolingo-level delight, note unfolding from the envelope, note under the gift with a rocking sticker, "Send a gift back" / "Visit Irene's garden" / close, skip + replay behavior, works on all screen sizes). Read it before changing the prototype.
- Ruby's finished Parts 2 and 3 designs are in Figma (section "FINAL", node 9146:1156): Gift Shop, Customization & Recipient, Checkout & Send, Reception + Opening (9146:1157).

## Prototype status (2026-10-04)

- Built and working: idle screen matching Figma, sprout → bloom opening (heart stays whole; flowers spill out of the box), envelope → letter card slips out and waits for a tap → fades into the note reading view, open state (items list, note + rocking sticker, Send a gift back / Visit Irene's garden toasts, close, replay), skip with a 450 ms double-tap guard, keyboard, reduced motion, phone / tablet / desktop layouts.
- Code map: `src/timeline.ts` (step timings), `src/App.tsx` (state machine), `components/Stage.tsx` (idle → bloom → letter/note overlay), `Gift.tsx`, `Letter.tsx` (from/sending-to card), `Note.tsx`, `OpenView.tsx`, `ClosedView.tsx`, `Particles.tsx`.
- Deploy: `.github/workflows/deploy-prototype.yml` publishes `prototype/dist` to https://rubywu-ux.github.io/pocket-worlds-oa/ on every push. Pages is on (Source = GitHub Actions) and the site is live. Claude can't change Pages settings via the API.
- Art in `prototype/src/assets/` is Ruby's 4× Figma exports, converted to WebP (≈390 KB total), imported in `data.ts` so builds give each file a content hash (no stale browser cache), and preloaded in `main.tsx`. If art changes, regenerate `public/og.png` (link preview, 1200×630 of the bloomed state).
- Fonts are self-hosted via @fontsource (Google Fonts is blocked in the sandbox).
- Screenshot QA: Playwright with `executablePath: /opt/pw-browsers/chromium-1194/chrome-linux/chrome` against `npx vite preview --port 4173`.

## Next steps (proposed plan, 2026-10-04)

1. **Study the provided screens.** Pull the Gift Shop and Reception frames from Figma (the connector works on the original account) and note the visual language: color, type, radii, buttons, illustration style, tone of copy, Figma variables.
2. **Define the gift model.** Decide what a gift contains: the item, its wrapping, the note, the sender, and the 2–3 things customized in Part 2. Parts 2 and 4 have to agree on this, so settle it first.
3. **Sketch 2–3 opening concepts for Part 4.** Each one answers the three questions. Ruby picks one.
4. **Pick the tool and build Part 4** in `prototype/`. Build order:
   - static screen
   - opening interaction
   - note reveal
   - after-opening connection
   - edge cases (tap spam, skip, replay, reset)
   - mobile + desktop
   - deploy

   Commit after each step.
5. **Design Parts 2 and 3 in Figma:** 3 genuinely different wireframes for Customization & Recipient, its final design, then the Checkout & Send final design built from their wireframe and kept in the game's world.
6. **Assemble the Figma file:**
   - flows left to right
   - portfolio + prototype links at the top
   - hours stated
   - decision notes
   - AI-use disclosure
7. **QA and submit.** Click-and-break the prototype on a phone, open the link logged out, then run the README checklist.

## Working conventions

- **Commit and push often.** Do it after every meaningful step (a new concept sketch, a working interaction, a fix, a README/log update), not just at the end of a session, so nothing is lost if Ruby has to switch Claude accounts mid-task. Keep commits small with clear messages. Pull before starting work.
- Ruby directs and makes the design calls. Ask before structural decisions, and record in the README's AI-use log where she changed or overruled AI output.
- Local copy: on Ruby's Mac, in iCloud Drive › Ruby Workspace › Pocket Worlds (a clone of this repo).
- Git in that folder needs file-deletion permission, because git removes its own lock files. If a commit leaves `.git/*.lock` or `tmp_obj_*` files behind, remove them.
- GitHub: Claude can't create repos. Pushing needs GitHub connected on the current Claude account and the Claude GitHub App granted access to this repo.
- The repo is public, so never commit secrets or Pocket Worlds' template files.

## Prompt to start a new session

Paste this into a new Claude session (any account) with the Pocket Worlds folder linked:

```
I'm continuing my Pocket Worlds Product Designer take-home from another session. All context is in my public GitHub repo: https://github.com/rubywu-ux/pocket-worlds-oa (my local copy is the Pocket Worlds folder I linked: iCloud Drive › Ruby Workspace › Pocket Worlds).

1. Read CLAUDE.md and README.md first. CLAUDE.md has the decisions so far and the next steps.
2. Check whether GitHub and Figma are connected for this account. If not, tell me before you need them.
3. Pick up from "Next steps" in CLAUDE.md, and ask me before any big design decision.
4. Before we stop, or if you're running low on usage, update "Next steps" and "Session log" in CLAUDE.md, then commit and push so I can continue in my other account.
```

## Session log

- 2026-10-04: Created the repo and linked it to the local folder. Wrote the README (brief summary, checklist, AI-use and hours logs). Compared prototype tool options (see Decisions). Added this handoff file.
- 2026-10-04: Ruby wrote her prototype direction (now `prototype/SPEC.md`). Built the full prototype and the Pages deploy workflow. Changed the first bloom concept (heart split in two) to flowers growing out of a whole heart, because a split heart reads as heartbreak. Pages switched on; live at https://rubywu-ux.github.io/pocket-worlds-oa/. Swapped in Ruby's 4× art (WebP). Per Ruby: the letter card slips out of the envelope first and fades into the note on tap (see SPEC §2). Per Ruby: replaced Irene's avatar with her clean rounded-square version (no dashed frame), shown as a rounded square, and enlarged it in the idle "from Irene" line and the "Irene left you a note" heading.
