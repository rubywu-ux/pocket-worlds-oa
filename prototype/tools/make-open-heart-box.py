"""
Draws a clean, symmetric OPEN heart box (seen from the front, a little above) in the same pinks,
outline weight and glossy style as Ruby's closed "Gift Box" art. Replaces the older generated base
(make-box-base.py), whose outline was traced from the closed box and inherited the bow's bumps.

  src/assets/box-open.webp        the open box: rim, inner walls, floor, front wall, shadow
  src/assets/box-open-front.webp  the front wall + front half of the rim only, drawn over the gifts
                                  so they sit inside the box

Same 1016 x 984 canvas as gift-box.webp, so it drops into the same .box-img slot.
Run from prototype/:  python3 tools/make-open-heart-box.py   (needs Pillow + numpy)
"""
import math
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

W, H = 1016, 984
K = 2  # supersample
w, h = W * K, H * K

# ---- geometry (fractions of the canvas) ----
CX = 0.48          # heart center x
SX = 0.445         # half width of the top face
SQ = 0.62          # vertical squash of the top face (viewing angle)
DEPTH = 0.2        # visible front-wall height
BOTTOM = 0.915     # where the heart's tip meets the ground
RIM = 0.034        # rim width (fraction of W)
INNER_DEPTH = 0.1   # how far down the floor sits inside

sx = SX * w
sy = SQ * sx
D = DEPTH * h
TIP = 0.82         # blunter tip than the textbook heart (closer to the closed box art)
cy = BOTTOM * h - D - 1.0625 * TIP * sy


def heart(n=1440, scale=1.0, dy=0.0):
    pts = []
    for i in range(n):
        t = 2 * math.pi * i / n
        x = math.sin(t) ** 3
        y = (13 * math.cos(t) - 5 * math.cos(2 * t) - 2 * math.cos(3 * t) - math.cos(4 * t)) / 16
        if y < 0:
            y *= TIP
        pts.append((CX * w + scale * sx * x, cy - scale * sy * y + dy))
    return pts


def fill(pts):
    m = Image.new('L', (w, h), 0)
    ImageDraw.Draw(m).polygon(pts, fill=255)
    return np.array(m) > 127


def shift_down(m, d):
    d = int(round(d))
    out = np.zeros_like(m)
    out[d:] = m[: h - d]
    return out


def erode(m, r):
    """Erode by ~r px with an octagonal kernel (alternating cross / square)."""
    for i in range(int(r)):
        e = m.copy()
        e[1:] &= m[:-1]
        e[:-1] &= m[1:]
        e[:, 1:] &= m[:, :-1]
        e[:, :-1] &= m[:, 1:]
        if i % 2:
            e[1:, 1:] &= m[:-1, :-1]
            e[:-1, :-1] &= m[1:, 1:]
            e[1:, :-1] &= m[:-1, 1:]
            e[:-1, 1:] &= m[1:, :-1]
        m = e
    return m


top = fill(heart())
sil = top.copy()
step = 3
for d in np.arange(step, D + step, step):
    sil |= shift_down(top, min(d, D))
opening = erode(top, RIM * w)
floor = opening & shift_down(opening, INNER_DEPTH * h)
inner_wall = opening & ~floor
rim = top & ~opening
front_wall = sil & ~top

yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
img = np.zeros((h, w, 4), np.float32)


def paint(mask, r, g, b, a=255.0):
    for c, v in enumerate((r, g, b)):
        img[..., c] = np.where(mask, v, img[..., c])
    img[..., 3] = np.where(mask, a, img[..., 3])


def rows(mask):
    ys = np.where(mask.any(axis=1))[0]
    return ys.min(), ys.max()


# front wall: vertical gradient + darker toward the curved sides, like the lid's side band
y0, y1 = rows(front_wall)
t = np.clip((yy - y0) / max(1, y1 - y0), 0, 1)
side = np.clip(np.abs(xx - CX * w) / sx, 0, 1) ** 2
paint(front_wall, 228 - 34 * t - 30 * side, 40 - 22 * t - 14 * side, 150 - 20 * t - 16 * side)
# a lighter bevel just under the rim, like the lid's side band
bevel = front_wall & ~shift_down(top, 0.022 * h) & shift_down(top, 1)
paint(bevel, 246, 70, 168)

# rim (top surface): bright, lit from the top
y0, y1 = rows(rim)
t = np.clip((yy - y0) / max(1, y1 - y0), 0, 1)
paint(rim, 255 - 6 * t, 104 - 34 * t, 190 - 14 * t)

# inner back wall: lit pink, getting deeper toward the floor line
y0, y1 = rows(inner_wall)
t = np.clip((yy - y0) / max(1, y1 - y0), 0, 1)
paint(inner_wall, 236 - 30 * t, 60 - 30 * t, 160 - 26 * t)

# floor: darker, with the front wall's shadow along its front edge
y0, y1 = rows(floor)
t = np.clip((yy - y0) / max(1, y1 - y0), 0, 1)
ob = np.where(opening.any(axis=0), h - 1 - np.argmax(opening[::-1, :], axis=0), 0)  # opening's front edge per column
near = np.clip(1 - (ob[None, :] - yy) / (0.08 * h), 0, 1)
paint(floor, 186 - 40 * t - 50 * near, 22 - 10 * t - 10 * near, 116 - 22 * t - 30 * near)

# soft ground shadow
sh = Image.new('L', (w, h), 0)
ImageDraw.Draw(sh).ellipse(
    [CX * w - sx * 0.95, BOTTOM * h - 0.05 * h, CX * w + sx * 0.95, BOTTOM * h + 0.06 * h], fill=150
)
sh = np.array(sh.filter(ImageFilter.GaussianBlur(28 * K))).astype(np.float32)
base = np.zeros((h, w, 4), np.float32)
base[..., 3] = sh * (~sil)
img = np.where(sil[..., None], img, base)


def edge(mask, width):
    m = Image.fromarray((mask * 255).astype(np.uint8))
    grown = m.filter(ImageFilter.MaxFilter(width))
    shrunk = m.filter(ImageFilter.MinFilter(width))
    e = (np.array(grown).astype(np.float32) - np.array(shrunk)) / 255.0
    return np.array(Image.fromarray((e * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.8 * K))) / 255.0


def stroke(e, rgb, inside=None):
    if inside is not None:
        e = e * inside
    for c in range(3):
        img[..., c] = img[..., c] * (1 - e) + rgb[c] * e
    img[..., 3] = np.maximum(img[..., 3], 255 * e)


stroke(edge(top & ~floor & ~inner_wall | rim, 5 * K + 1), (196, 26, 126))          # rim / wall seam
stroke(edge(opening, 5 * K + 1), (150, 10, 92))                                      # opening edge
stroke(edge(floor, 3 * K + 1), (140, 8, 84), inside=opening)                         # floor line
stroke(edge(sil, 7 * K + 1), (150, 10, 92))                                          # outer outline

# glossy specks, like the closed box art
d = ImageDraw.Draw(gloss := Image.new('L', (w, h), 0))
# small glossy specks on the rim of each lobe (the lid art has the same)
for ux, uy, r in [(-0.62, 0.62, 9), (-0.54, 0.66, 5), (0.6, 0.6, 8)]:
    px, py = CX * w + ux * sx, cy - uy * sy + 0.012 * h
    d.ellipse([px - r * K, py - r * 0.7 * K, px + r * K, py + r * 0.7 * K], fill=220)
g = np.array(gloss.filter(ImageFilter.GaussianBlur(1.2 * K))).astype(np.float32) / 255.0 * sil
for c in range(3):
    img[..., c] = img[..., c] * (1 - g) + 255 * g

out = Image.fromarray(np.clip(img, 0, 255).astype(np.uint8), 'RGBA').resize((W, H), Image.LANCZOS)
out.save('src/assets/box-open.webp', quality=92, method=6)

# front layer: everything of the box below the opening's center line (front wall + front half of the rim)
col_has = opening.any(axis=0)
top_rows = np.where(opening, yy, np.inf).min(axis=0)
bot_rows = np.where(opening, yy, -np.inf).max(axis=0)
tt = np.where(top, yy, np.inf).min(axis=0)
tb = np.where(top, yy, -np.inf).max(axis=0)
with np.errstate(invalid='ignore'):
    mid = np.where(col_has, (top_rows + bot_rows) / 2, np.where(top.any(axis=0), (tt + tb) / 2, cy))
front = sil & ~opening & (yy > mid[None, :])
fm = Image.fromarray((front * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.6 * K))
fimg = np.array(Image.fromarray(np.clip(img, 0, 255).astype(np.uint8), 'RGBA')).astype(np.float32)
fimg[..., 3] = fimg[..., 3] * (np.array(fm).astype(np.float32) / 255.0)
Image.fromarray(fimg.astype(np.uint8), 'RGBA').resize((W, H), Image.LANCZOS).save('src/assets/box-open-front.webp', quality=92, method=6)

print('opening rows (fraction):', [round(v / h, 3) for v in rows(opening)], 'cols:', [round(v / w, 3) for v in (np.where(col_has)[0].min(), np.where(col_has)[0].max())])
print('silhouette rows:', [round(v / h, 3) for v in rows(sil)])
