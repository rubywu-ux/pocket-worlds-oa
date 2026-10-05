"""
Generates the open heart box used in the unboxing (src/assets/box-base*.webp)
from the closed box art (Ruby's 4x "Gift Box" export), so the base matches the lid's
exact silhouette, colors and drop shadow.

  box-base.webp        the open box: inside, rim and front wall
  box-base-front.webp  just the front wall + front rim, drawn on top of the gifts
                       so they appear to rise out of the box

Run from prototype/:  python3 tools/make-box-base.py   (needs Pillow + numpy)
"""
from PIL import Image, ImageFilter, ImageDraw, ImageChops
import numpy as np

SRC='src/assets/gift-box.webp'
lid=Image.open(SRC).convert('RGBA'); W,H=lid.size
A=np.array(lid)
solid=(A[:,:,3]>=250)
# smooth silhouette
S=Image.fromarray((solid*255).astype('uint8')).filter(ImageFilter.MaxFilter(3)).filter(ImageFilter.MinFilter(3))
Sn=np.array(S)>127

D=150  # wall depth (px) at the front
up=np.zeros_like(Sn); up[:-D]=Sn[D:]   # S shifted up by D
T=Sn & up                               # top face (opening + rim)
Timg=Image.fromarray((T*255).astype('uint8')).filter(ImageFilter.GaussianBlur(2)).point(lambda v:255 if v>127 else 0)
T=np.array(Timg)>127
RIM=26
O=np.array(Timg.filter(ImageFilter.MinFilter(2*RIM+1)))>127   # opening
wall = Sn & ~T
rim = T & ~O

yy,xx=np.mgrid[0:H,0:W].astype(float)
out=np.zeros((H,W,4),float)

def put(mask,rgb,alpha=1.0):
    for c in range(3): out[...,c]=np.where(mask, rgb[c] if np.isscalar(rgb[c]) else rgb[c], out[...,c])
    out[...,3]=np.where(mask,255*alpha,out[...,3])

# drop shadow from the original (non-solid dark pixels)
sh = (A[:,:,3]<250) & (A[:,:,:3].max(axis=2)<40)
for c in range(3): out[...,c]=np.where(sh,0,out[...,c])
out[...,3]=np.where(sh,A[:,:,3],0)

# front wall: vertical gradient, darker toward bottom, like the lid's side (218,27,144)->(189,14,126)
oy=np.where(O.any(axis=1))[0]; o_top,o_bot=oy.min(),oy.max()
t=np.clip((yy-o_top)/(H*0.85-o_top),0,1)
wall_rgb=[226-40*t, 36-20*t, 150-22*t]
put(wall,wall_rgb)
# rim: bright pink top surface with a light gradient
rt=np.clip((yy-o_top)/(o_bot-o_top+1),0,1)
put(rim,[255-12*rt, 92-30*rt, 182-12*rt])
# opening interior: back wall lit at top, shadowed floor toward the front
it=np.clip((yy-o_top)/(o_bot-o_top+1),0,1)
# smooth: lit back wall (top) -> warm pink floor -> deep shadow under the front rim
c0=np.array([240,78,170]); c1=np.array([196,28,120]); c2=np.array([128,10,74])
w1=np.clip(it/0.55,0,1)[...,None]; w2=np.clip((it-0.55)/0.45,0,1)[...,None]
col=(c0*(1-w1)+c1*w1)*(1-w2)+c2*w2
# inner shadow just above the opening's bottom edge (cast by the front wall)
obot=np.where(O.any(axis=0), H-1-np.argmax(O[::-1,:],axis=0), 0)
dist=(obot[None,:]-yy)
shade=np.clip(1-dist/60,0,1)*O
col=col*(1-0.35*shade[...,None])
inter=[col[...,0],col[...,1],col[...,2]]
put(O,inter)
img=Image.fromarray(np.clip(out,0,255).astype('uint8'),'RGBA')

# outlines: around silhouette, around the opening, and the rim/wall edge
dark=(168,12,104,255)
def outline(maskarr,width):
    m=Image.fromarray((maskarr*255).astype('uint8'))
    edge=ImageChops.subtract(m.filter(ImageFilter.MaxFilter(width)), m.filter(ImageFilter.MinFilter(width)))
    return np.array(edge.filter(ImageFilter.GaussianBlur(0.8)))
ov=np.array(img).astype(float)
for maskarr,wd,col in [(Sn,7,dark),(O,7,(150,10,92,255)),(T,5,(196,24,124,255))]:
    e=outline(maskarr,wd)/255.0
    if maskarr is Sn: e=e*Sn  # keep the outer line inside the silhouette
    for c in range(4): ov[...,c]=ov[...,c]*(1-e)+col[c]*e
img=Image.fromarray(np.clip(ov,0,255).astype('uint8'),'RGBA')

# glossy highlights on the front wall and rim (like the lid art)
hl=Image.new('RGBA',(W,H),(0,0,0,0)); d=ImageDraw.Draw(hl)
d.ellipse((150,700,190,725),fill=(255,255,255,150))
d.ellipse((205,722,225,736),fill=(255,255,255,120))
d.ellipse((120,250,150,268),fill=(255,255,255,140))
hla=np.array(hl); hla[...,3]=np.where(Sn, hla[...,3], 0); hl=Image.fromarray(hla,'RGBA')
img=Image.alpha_composite(img,hl)
img.save('src/assets/box-base.webp','WEBP',quality=90,method=6)

# front layer: wall + the front half of the rim (covers gifts rising out of the box)
mid=(o_top+o_bot)/2
front = wall | (rim & (yy>mid+20))
fa=np.array(img).copy(); fa[...,3]=np.where(front, fa[...,3], 0)
# keep the outer outline/ highlights on the front part
Image.fromarray(fa,'RGBA').save('src/assets/box-base-front.webp','WEBP',quality=90,method=6)
print('wrote src/assets/box-base.webp and box-base-front.webp')
