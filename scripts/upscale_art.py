# Makes the flat-colour character art sharp at 4K: public/la/<name>.png → public/la3x/<name>.png.
# The art has a few flat colours and hard 1-bit edges, which show as stair-steps when
# scaled up. Each colour (and "transparent") is blurred into a soft 3× mask, and every
# pixel takes the colour whose mask is strongest: the same colours, with smooth contours.
# usage: python scripts/upscale_art.py   (needs Pillow; the results are committed)
from pathlib import Path
from PIL import Image, ImageChops, ImageFilter

ROOT = Path(__file__).resolve().parent.parent / 'public'
NAMES = [
    'comfort_look', 'comfort_reach', 'comfort_hugbox',
    'catear_half', 'cat_smile_mid', 'cat_smile',
    'fm_F_tone', 'fm_M_tone', 'sm_S_tone', 'sm_M_tone',
]
SCALE = 3
BLUR = 1.8  # px at 3×: rounds off the steps, keeps 1 px details of the source
# the F/M heads are big flat shapes with no thin lines, shown at the largest scale
BLUR_BY_NAME = {'fm_F_tone': 4.5, 'fm_M_tone': 4.5, 'sm_S_tone': 2.4, 'sm_M_tone': 2.4}

def layer_mask(im, colour):
    r, g, b, a = im.split()
    keep = [ch.point(lambda v, c=c: 255 if v == c else 0) for ch, c in zip((r, g, b), colour[:3])]
    m = a.point(lambda v: 255 if v == colour[3] else 0)
    for k in keep:
        m = ImageChops.multiply(m, k)
    return m

def upscale(name):
    im = Image.open(ROOT / 'la' / f'{name}.png').convert('RGBA')
    # everything fully transparent counts as one colour
    r, g, b, a = im.split()
    im = Image.merge('RGBA', (*[ImageChops.multiply(ch, a) for ch in (r, g, b)], a))
    colours = im.getcolors(64)
    if colours is None:
        raise SystemExit(f'{name}: more than 64 colours, not flat art')
    size = (im.width * SCALE, im.height * SCALE)
    out = Image.new('RGBA', size, (0, 0, 0, 0))
    best = Image.new('L', size, 0)
    for _, c in sorted(colours, reverse=True):
        m = layer_mask(im, c).resize(size, Image.BICUBIC).filter(ImageFilter.GaussianBlur(BLUR_BY_NAME.get(name, BLUR)))
        win = ImageChops.subtract(m, best).point(lambda v: 255 if v > 0 else 0)
        out.paste(c if c[3] else (0, 0, 0, 0), (0, 0), win)
        best = ImageChops.lighter(best, m)
    dest = ROOT / 'la3x' / f'{name}.png'
    dest.parent.mkdir(exist_ok=True)
    out.save(dest, optimize=True)
    print(f'{name}: {len(colours)} colours, {size[0]}x{size[1]}, {dest.stat().st_size // 1024} KB')

for n in NAMES:
    upscale(n)
