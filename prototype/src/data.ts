// The gift Irene sent Sage. Mirrors Ruby's Customization & Checkout designs in Figma.
const asset = (file: string) => `${import.meta.env.BASE_URL}assets/${file}`

export const ART = {
  giftBox: asset('gift-box.webp'),
  envelope: asset('envelope.webp'),
  sticker: asset('sticker-boba.webp'),
}

export const SENDER = { name: 'Irene', avatar: asset('irene.webp') }
export const RECIPIENT = { name: 'Sage' }

export type GiftItem = { id: string; name: string; qty: number; img: string }

export const ITEMS: GiftItem[] = [
  { id: 'boba', name: 'Matcha Boba', qty: 2, img: asset('matcha-boba.webp') },
  { id: 'bouquet', name: 'Summertime Bouquet', qty: 1, img: asset('bouquet.webp') },
]

export const NOTE = {
  to: RECIPIENT.name,
  message: '“So nice to see you on here again! Love your creations as always.”',
  from: SENDER.name,
}

/** Everything the animation shows, so it can be fetched before the first tap. */
export const ALL_ART = [ART.giftBox, ART.envelope, ART.sticker, SENDER.avatar, ...ITEMS.map((i) => i.img)]
