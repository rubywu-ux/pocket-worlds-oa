# Reception + Opening: prototype spec

Ruby's direction for the Part 4 prototype (2026-10-04). This is the source of truth for what the prototype does; changes go here first.

**Personas:** sender **Irene** → recipient **Sage**. The prototype is Sage's point of view.

**The gift** (from Ruby's Customization & Checkout designs):
- Gift style: *sweetheart* (pink heart box, yellow ribbon) + envelope
- Contents Sage receives: Matcha Boba ×2, Summertime Bouquet ×1. (The Sweetheart Box gift style appears only on Irene's side, at Checkout; Ruby, 2026-10-04.)
- Note: light-green ruled note, "To: Sage", "So nice to see you on here again! Love your creations as always." — Irene
- Sticker on the note: Matcha Boba (the "+1 sticker")
- Postage: *lovely* (heart)

## 1. Opening interaction

- Opens by tapping the gift, or the optional **Open** button at the bottom.
- The animation is tied to gardening: the gift **sprouts open** or **blooms open**.
- Reference: Duolingo. It ties opening a gift box to the user emotionally through eye-catching, captivating interactions.
- **Updated 2026-10-04:** show the **unboxing** of the box with the gifts popping out of it. When the gifts emerge, they get a **popping scale-in** motion.
- **Updated 2026-10-04:** the gifts stay **inside** the box (not floating outside it), scaled to fit and sitting nicely in it. The gifts are the main point and should be emphasized.
- At the start, the envelope must stay fixed in front of the box (no movement on hover).

## 2. Note reveal

- ~~The note unfolds out of the envelope in a smooth transition and is displayed dramatically for the user to read.~~ (original direction)
- **Updated 2026-10-04:** when the envelope opens, the **letter** slips out first: the "from: Irene / sending to: Sage" card with the heart (same card as the Checkout screen). It waits for Sage to **tap it open**, then **fades** into the note itself, displayed for reading.
- Heading above the letter: **"Take a peek"** (no avatar, since the letter already shows Irene's). The note keeps its "Irene left you a note" heading with the avatar.

## 3. After opening

- The note lives **underneath the gift box**, which is revealed with the listed items.
- **Updated 2026-10-04:** after opening, the **gift box goes back to its closed, formal state** (the lid comes back on), with the opened items listed and the note underneath.
- The note carries the **1 sticker** chosen during customization. The sticker **rocks subtly**, as if to say "I'm here, I'm a cute sticker on your note!"
- Buttons: **Send a gift back** and **Visit Irene's garden**.
- An **exit/close** button.

## 4. Edge cases (tapping repeatedly, skipping, replaying, resetting)

- Tapping during the animation (e.g. by accident) **skips** to the open state of the gift.
- Tapping the gift again after the animation **replays** it.
- Use intuitive design for these controls.

## 5. Devices

- Adapts to mobile, tablet and desktop. Scalable and applicable.

## 6. Live link

- Online as a live link so recruiters can view and interact with the recipient's gift-opening screen.
