// The gift Irene sent Sage. Mirrors Ruby's Customization & Checkout designs in Figma.
// Art is imported so the build gives each file a content hash: browsers never show a stale version.
import giftBox from './assets/gift-box.webp'
import envelope from './assets/envelope.webp'
import sticker from './assets/sticker-boba.webp'
import irene from './assets/irene.webp'
import matchaBoba from './assets/matcha-boba.webp'
import bouquet from './assets/bouquet.webp'

export const ART = { giftBox, envelope, sticker }

export const SENDER = { name: 'Irene', avatar: irene }
export const RECIPIENT = { name: 'Sage' }

export type GiftItem = { id: string; name: string; qty: number; img: string }

export const ITEMS: GiftItem[] = [
  { id: 'boba', name: 'Matcha Boba', qty: 2, img: matchaBoba },
  { id: 'bouquet', name: 'Summertime Bouquet', qty: 1, img: bouquet },
]

export const NOTE = {
  to: RECIPIENT.name,
  message: '“So nice to see you on here again! Love your creations as always.”',
  from: SENDER.name,
}

/** Everything the animation shows, so it can be fetched before the first tap. */
export const ALL_ART = [ART.giftBox, ART.envelope, ART.sticker, SENDER.avatar, ...ITEMS.map((i) => i.img)]
