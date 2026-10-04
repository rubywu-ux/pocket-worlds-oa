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
- Prototype tooling: **not decided yet.** Claude recommended React + Motion (Framer Motion), deployed to GitHub Pages from this repo (`rubywu-ux.github.io/pocket-worlds-oa`), for fine control of motion, gestures and interruptible states. Alternatives discussed: Figma Make (closest to the Figma visuals, less control), v0 (fast but generic look), Cursor/Codex locally.

## Next steps

1. Ruby picks the prototype tool.
2. Get the provided Reception screen and the Gift Shop's visual style into the session, either by connecting the Figma connector or by having Ruby export the frames plus gift art (PNG/SVG) into the local folder.
3. Sketch 2–3 genuinely different opening concepts, each covering the opening animation, how the note pairs with the gift, and what happens between sender and recipient afterward. Ruby chooses.
4. Build in `prototype/`, deploy to a live link, then add the link to `README.md` and to the top of the Figma file.
5. Keep the AI-use log and hours log in `README.md` current.

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
