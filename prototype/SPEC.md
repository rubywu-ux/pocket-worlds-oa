# Reception + Opening: prototype spec

Ruby's direction for the Part 4 prototype (2026-10-04). This is the source of truth for what the prototype does; changes go here first.

**Personas:** sender **Irene** → recipient **Sage**. The prototype is Sage's point of view.

**The gift** (from Ruby's Customization & Checkout designs):
- Gift style: *sweetheart* (pink heart box, yellow ribbon) + envelope
- Contents Sage receives: Matcha Boba ×2, Summertime Bouquet ×1. (The Sweetheart Box gift style appears only on Irene's side, at Checkout; Ruby, 2026-10-04.)
- Note: light-green ruled note, "To: Sage" (no pencil icon, left-aligned with the message; Ruby, 2026-10-04), "So nice to see you on here again! Love your creations as always." — Irene
- Sticker on the note: Matcha Boba (the "+1 sticker")
- Postage: *lovely* (heart)

## 1. Opening interaction

- Opens by tapping the gift, or the optional **Open** button at the bottom.
- The animation is tied to gardening: the gift **sprouts open** or **blooms open**.
- Reference: Duolingo. It ties opening a gift box to the user emotionally through eye-catching, captivating interactions.
- **Updated 2026-10-04:** show the **unboxing** of the box with the gifts popping out of it. When the gifts emerge, they get a **popping scale-in** motion.
- **Updated 2026-10-04:** the gifts stay **inside** the box (not floating outside it), scaled to fit and sitting nicely in it. The gifts are the main point and should be emphasized.
- At the start, the envelope must stay fixed in front of the box (no movement on hover).
- **Updated 2026-10-04:** the gifts sit **naturally inside** the box (resting in it, bottoms hidden by the front wall). The **×2 / ×1** badges sit right on their own gift. The flowers bloom **behind** the box, not on top of it (less distracting).
- **Updated 2026-10-04:** keep the floral bloom's original look (three flowers + two leaves, same animation); only **reposition** it so the box sits **centered in front of the bloom** (flowers peek out above and on both sides). (A redesign into one big flower was reverted: Ruby asked for repositioning, not a new style.)

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

## 7. Exploration variations (2026-10-04)

Ruby asked for three variations with their own links that **explore different animation styles and interactive flows, completely different from each other**, keeping the design system as close as possible to Pocket Worlds' Highrise design language (the **Picnic Gift Shop**). She then asked for **sound effects too, using Duolingo's haptics and sound as the reference**. Claude proposed the three directions below; Ruby will review them and pick or refine.

Shared across all three:
- Same tokens and type as the main prototype (n850/n900, lime #70e51d CTA pill, Passion One titles with the dark text shadow, Parkinsans UI), the same art, the same gift (Matcha Boba ×2, Summertime Bouquet ×1, note with the boba sticker), and the same replies (Send a gift back / Visit Irene's garden), plus close, replay and reduced motion.
- **Sound + haptics (Duolingo as the reference):**
  - Every tap answers with a soft bloop and a light tick.
  - While a moment builds, notes climb a C-major pentatonic ladder and the haptics grow stronger.
  - The payoff is a two-note "ding", a short major fanfare with sparkles, and a three-pulse "success" haptic.
  - Physical moments get physical sounds: water, creak, snap, thud, paper and card flick.
  - All of it is synthesized with Web Audio, with a mute toggle (remembered).
  - Haptics: the Vibration API (Android), and a system tick via the hidden-switch technique on iOS 18+ Safari.

| | V1 · Grow it | V2 · Pull the ribbon | V3 · Reward reveal |
|---|---|---|---|
| Gesture | Press and hold | Drag | Tap |
| Motion style | Organic growth, paced by the user | Physics: tension, snap, gravity, bounce | Fast, punchy game reward (about 2 s) |
| Opening | Water the box; a seedling grows in stages; the box blooms open and the gifts pop up inside | The envelope is tied to the ribbon; pull it until the ribbon snaps; the lid flies off; the gifts tumble onto a picnic blanket | An Offer Cell charges, then pops in confetti; three cards deal out and flip |
| Note | Hangs off the box like a gift tag; it flips up and the note unrolls | Pull the letter out of the envelope; it flips like a card to the note | The third card; tap it to read |
| After | Gift stays planted and in bloom | Box closed, gifts laid out on the blanket | Gifts collected to storage; one-tap sticker "thanks" reactions to Irene |
| Skip | Skip pill; a fresh tap during the bloom | Skip pill; a fresh tap during the pop | Tap fast-forwards; Skip pill |
| Picnic Gift Shop references | Dark UI, lime CTA, Duolingo-style meter | The banner art and its elliptical bottom edge with the title on it; the gingham blanket | The Offer Cell card (display + tab), the banner's confetti motifs |

### V4 · Grow & collect (Ruby, 2026-10-04)

Ruby's direction: "combine V1 and V2: I like the gamified watering plants and notecard pop up in V1. In V2, I like the reward system it has for the user. I also like the ending of the 'say thanks' page." The reward system and the "Say thanks" ending she pointed to (with a screenshot) are both from **V3** (Reward reveal), so V4 combines V1 + V3:

1. **Grow (V1):** ~~press and hold to water~~ **Updated (Ruby, 2026-10-04): just tap it.** One tap on the gift or **Water it** and it waters itself: the can pours, the seedling grows in stages, the meter fills, the notes climb and the haptics strengthen (about 2.4 s), then it blooms on its own. Another tap while it waters skips ahead to the bloom (a quick double-tap doesn't count).
2. **Bloom (V1):** at 100% the box blooms open with a fanfare; the gifts pop up inside it.
3. **Collect (V3's reward loop):** "Tap the gifts to collect them" / **Collect all**. Each gift jumps out of the box as a face-down reward card (Offer Cell), flips face-up with confetti, then flies into the garden-storage basket (top left), which counts up to +3.
4. **Note (V1):** the letter swings down off the box like a gift tag; tap it, it flips up and the note unrolls; the sticker slaps on; Continue.
5. **Ending (V3):** "✓ Collected" gift card, "in your gift" list (Ruby: renamed from "in your storage"), the note with its rocking sticker, **Say thanks** sticker reactions that fly to Irene, Send a gift back / Visit Irene's garden.
