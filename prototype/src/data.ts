// The gift Irene sent Sage. Mirrors Ruby's Customization & Checkout designs in Figma.
const asset = (file: string) => `${import.meta.env.BASE_URL}assets/${file}`

export const ART = {
  giftBox: asset('gift-box.png'),
  envelope: asset('envelope.png'),
  sticker: asset('sticker-boba.png'),
}

export const SENDER = { name: 'Irene', avatar: asset('irene.png') }
export const RECIPIENT = { name: 'Sage' }

export type GiftItem = { id: string; name: string; qty: number; img: string }

export const ITEMS: GiftItem[] = [
  { id: 'boba', name: 'Matcha Boba', qty: 2, img: asset('matcha-boba.png') },
  { id: 'bouquet', name: 'Summertime Bouquet', qty: 1, img: asset('bouquet.png') },
]

export const NOTE = {
  to: RECIPIENT.name,
  message: '“So nice to see you on here again! Love your creations as always.”',
  from: SENDER.name,
}
