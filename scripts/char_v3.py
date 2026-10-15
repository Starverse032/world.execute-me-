# Flat-colour + line-art treatment of a character illustration for the v3 demo.
# Keeps the full source canvas (transparent outside the figure) so normalised
# coordinates match the source image. Outputs in public/char/:
#   <name>_flat.png   five flat tones + interior lines + 2 px cream silhouette outline
#   <name>_lines.png  all lines + outline, cream on transparent
#   <name>_alpha.png  white silhouette on transparent
#   <name>_points.json  {w, h, points: [[nx, ny, cls]]}, cls 0 cream, 1 orange, 2 ink
# usage: python3 scripts/char_v3.py <image on white> <name> [out_height=1680] [points=1210]
import json, sys, pathlib
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

src, name = sys.argv[1], sys.argv[2]
out_h = int(sys.argv[3]) if len(sys.argv) > 3 else 1680
n_pts = int(sys.argv[4]) if len(sys.argv) > 4 else 1210
root = pathlib.Path(__file__).resolve().parent.parent
out = root / 'public' / 'char'
out.mkdir(parents=True, exist_ok=True)

im = Image.open(src).convert('RGB')
W0, H0 = im.size
scale = out_h / H0
im = im.resize((round(W0 * scale), out_h), Image.LANCZOS)
W, H = im.size
arr = np.asarray(im).astype(int)

# ---- cutout: flood-fill near-white from the borders, then large pure-white pockets
cand = (arr.min(axis=2) > 232) & (arr.max(axis=2) - arr.min(axis=2) < 18)
mask = Image.fromarray((cand * 255).astype(np.uint8), 'L').copy()
for seed in [(x, y) for x in range(0, W, 30) for y in (0, H - 1)] + [(x, y) for y in range(0, H, 30) for x in (0, W - 1)]:
    if mask.getpixel(seed) == 255:
        ImageDraw.floodfill(mask, seed, 128)
bg = np.asarray(mask) == 128
pure = (arr.min(axis=2) > 248) & (arr.max(axis=2) - arr.min(axis=2) < 8) & ~bg
pm = Image.fromarray((pure * 255).astype(np.uint8), 'L').copy()
thr = 3000 * (W * H) / (1052 * 1885)
for y in range(0, H, 6):
    for x in range(0, W, 6):
        if pm.getpixel((x, y)) == 255:
            ImageDraw.floodfill(pm, (x, y), 100)
            region = np.asarray(pm) == 100
            if region.sum() > thr:
                bg = bg | region
            pm.paste(50, mask=Image.fromarray((region * 255).astype(np.uint8), 'L'))
alpha_img = Image.fromarray(np.where(bg, 0, 255).astype(np.uint8), 'L').filter(ImageFilter.MinFilter(3))
# soften the stair-step edge slightly (keeps it vector-like, never pixel-stepped)
alpha_img = alpha_img.filter(ImageFilter.GaussianBlur(0.8))
A = np.asarray(alpha_img).astype(float) / 255
inside = A > 0.5

# ---- flat colour reduction in CIELAB
def to_lab(rgb):
    c = rgb / 255.0
    c = np.where(c > 0.04045, ((c + 0.055) / 1.055) ** 2.4, c / 12.92)
    M = np.array([[0.4124, 0.3576, 0.1805], [0.2126, 0.7152, 0.0722], [0.0193, 0.1192, 0.9505]])
    xyz = c @ M.T / np.array([0.95047, 1.0, 1.08883])
    f = np.where(xyz > 0.008856, np.cbrt(xyz), 7.787 * xyz + 16 / 116)
    return np.stack([116 * f[..., 1] - 16, 500 * (f[..., 0] - f[..., 1]), 200 * (f[..., 1] - f[..., 2])], -1)

hexrgb = lambda h: [int(h[i:i + 2], 16) for i in (1, 3, 5)]
TOK = ['#DCD3C1', '#A99F8C', '#D97757', '#A4553B', '#1C1A17']  # charCream, charShade, orange, orangeDeep, ink
# matching targets (what each token stands for in the source), a few per token
TARGETS = [
    (0, '#F4EEE4'), (0, '#FFFFFF'), (0, '#F6E2D6'), (0, '#EBDCCB'),  # whites, skin
    (1, '#C9BBA6'), (1, '#B5A48E'), (1, '#D8C9B4'),                  # shaded whites
    (2, '#E8743B'), (2, '#F09A5A'), (2, '#F3B07A'), (2, '#E0662E'), (2, '#C85A30'), (2, '#B84A28'),  # hair, orange panels, amber
    (3, '#9A5532'), (3, '#7A4126'), (3, '#B8743E'), (3, '#C98E4A'),  # book, hair shadow, gold trim
    (4, '#2A2224'), (4, '#121012'), (4, '#3E3438'),                  # black corset, ribbons
]
smooth_rgb = np.asarray(Image.fromarray(arr.astype(np.uint8)).filter(ImageFilter.MedianFilter(5))).astype(float)
lab = to_lab(smooth_rgb)
tl = to_lab(np.array([hexrgb(h) for _, h in TARGETS], float))
d = ((lab[:, :, None, :] - tl[None, None, :, :]) ** 2).sum(-1)
label = np.array([k for k, _ in TARGETS])[d.argmin(-1)].astype(np.uint8)
label[~inside] = 0
lab_img = Image.fromarray(label * 40, 'L').filter(ImageFilter.ModeFilter(7)).filter(ImageFilter.ModeFilter(5))
label = (np.asarray(lab_img) // 40).astype(np.uint8)
# smooth every region's edge (vector-like shapes, no specks)
soft = np.stack([np.asarray(Image.fromarray(((label == k) * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(2.5))) for k in range(5)], -1)
label = soft.argmax(-1).astype(np.uint8)
label[~inside] = 0

pal = np.array([hexrgb(h) for h in TOK], np.uint8)
flat = pal[label]

# ---- line layer: thin dark ink lines (black top-hat) + boundaries of the label map
gray = Image.fromarray((0.299 * arr[..., 0] + 0.587 * arr[..., 1] + 0.114 * arr[..., 2]).astype(np.uint8), 'L')
closing = gray.filter(ImageFilter.MaxFilter(7)).filter(ImageFilter.MinFilter(7))
tophat = np.asarray(closing).astype(int) - np.asarray(gray).astype(int)
ink_lines = tophat > 44
ink_lines = np.asarray(Image.fromarray((ink_lines * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.2))) > 110
lb = np.zeros_like(inside)
lb[1:, :] |= label[1:, :] != label[:-1, :]
lb[:, 1:] |= label[:, 1:] != label[:, :-1]
lines = (ink_lines | lb) & inside
# thicken to ~3 px at this scale (≈1.5 px at display height 840)
lines = np.asarray(Image.fromarray((lines * 255).astype(np.uint8), 'L').filter(ImageFilter.MaxFilter(3))) > 0
lines &= inside
# silhouette outline, 2 px at display size = 4 px here
dil = np.asarray(alpha_img.filter(ImageFilter.MaxFilter(7))).astype(float) / 255
outline = np.clip(dil - A, 0, 1)

cream = np.array(hexrgb('#E9E3D5'), np.uint8)
ink = np.array(hexrgb('#1C1A17'), np.uint8)
line_col = np.where((label == 4)[..., None], cream, ink)
rgb = np.where(lines[..., None], line_col, flat)
# keep the face readable: original dark details on the face stay ink lines
rgba_flat = np.dstack([rgb, (np.clip(A, 0, 1) * 255).astype(np.uint8)])
# outline pixels sit outside the figure: cream
o8 = (outline * 255).astype(np.uint8)
rgba = rgba_flat.copy()
mo = o8 > rgba[..., 3]
rgba[mo, :3] = cream
rgba[mo, 3] = o8[mo]
Image.fromarray(rgba, 'RGBA').save(out / f'{name}_flat.png', optimize=True)

lines_a = np.maximum((lines * 255).astype(np.uint8), o8)
Image.fromarray(np.dstack([np.broadcast_to(cream, (H, W, 3)), lines_a]).astype(np.uint8), 'RGBA').save(out / f'{name}_lines.png', optimize=True)
Image.fromarray(np.dstack([np.full((H, W, 3), 255, np.uint8), (A * 255).astype(np.uint8)]), 'RGBA').save(out / f'{name}_alpha.png', optimize=True)

# ---- points: an evenly spaced outline (so the constellation reads as her
# silhouette) plus Poisson-disk interior points
rs = np.random.default_rng(7)
edge = (np.asarray(alpha_img.filter(ImageFilter.MaxFilter(3))) > 127) & ~(np.asarray(alpha_img.filter(ImageFilter.MinFilter(3))) > 127)
def poisson(cands_x, cands_y, n, r, existing):
    grid = {}
    def key(x, y): return (int(x // r), int(y // r))
    for (x, y) in existing:
        grid.setdefault(key(x, y), []).append((x, y))
    out = []
    order = rs.permutation(len(cands_x))
    for k in order:
        x, y = cands_x[k] + rs.random(), cands_y[k] + rs.random()
        gx, gy = key(x, y)
        ok = True
        for a in range(gx - 1, gx + 2):
            for b in range(gy - 1, gy + 2):
                for (px_, py_) in grid.get((a, b), ()):
                    if (px_ - x) ** 2 + (py_ - y) ** 2 < r * r:
                        ok = False; break
                if not ok: break
            if not ok: break
        if ok:
            out.append((x, y)); grid.setdefault((gx, gy), []).append((x, y))
            if len(out) >= n: break
    return out
ey, ex = np.nonzero(edge)
n_edge = int(n_pts * 0.4)
r_e = max(4.0, len(ex) / 2 / n_edge)  # edge band is ~2 px wide
pts = poisson(ex, ey, n_edge, r_e, [])
while len(pts) < n_edge * 0.95 and r_e > 3:
    r_e *= 0.9; pts = poisson(ex, ey, n_edge, r_e, [])
iy, ix = np.nonzero(inside & ~edge)
area = int(inside.sum())
r = np.sqrt(area / (n_pts - len(pts))) * 0.75
inner = poisson(ix, iy, n_pts - len(pts), r, pts)
while len(pts) + len(inner) < n_pts:
    r *= 0.92; inner = poisson(ix, iy, n_pts - len(pts), r, pts)
pts = pts + inner
cls_of = {0: 0, 1: 0, 2: 1, 3: 1, 4: 2}
P = [[round(x / W, 5), round(y / H, 5), cls_of[int(label[int(y), int(x)])]] for x, y in pts[:n_pts]]
json.dump({'w': W, 'h': H, 'points': P}, open(out / f'{name}_points.json', 'w'))

# meta for the components
meta_p = root / 'src' / 'v3' / 'char_meta.json'
meta = json.loads(meta_p.read_text()) if meta_p.exists() else {}
bb = Image.fromarray((inside * 255).astype(np.uint8)).getbbox()
meta[name] = {'w': W, 'h': H, 'bbox': [round(bb[0] / W, 4), round(bb[1] / H, 4), round(bb[2] / W, 4), round(bb[3] / H, 4)]}
meta_p.write_text(json.dumps(meta, indent=1))
print(name, W, H, 'bbox', meta[name]['bbox'], 'labels', np.bincount(label[inside], minlength=5), 'points', len(P), 'r', round(r, 2))
