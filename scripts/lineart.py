"""Vectorize a ChatGPT black-on-white line drawing into centre-line polylines.

usage: python3 lineart.py in.png out.json [--crop x0,y0,x1,y1]
out.json: {w, h, strokes: [[x,y, x,y, ...], ...], sil: "<svg path d of the outer silhouette>"}
Coordinates are in source pixels (float, 1 decimal). Strokes are ordered for plotting
(top-to-bottom, nearest-neighbour chaining).
"""
import sys, json, numpy as np
from PIL import Image
from skimage.morphology import skeletonize, remove_small_objects, binary_closing, disk
from scipy import ndimage as ndi
import cv2

def load(path, crop=None):
    im = Image.open(path).convert('L')
    if crop: im = im.crop(crop)
    a = np.asarray(im).astype(np.float32) / 255
    return a

def ink_mask(a):
    m = a < 0.75
    m = remove_small_objects(m, max_size=12)
    return m

def trace_skeleton(sk):
    """Walk the 8-connected skeleton into polylines (split at junctions)."""
    H, W = sk.shape
    ys, xs = np.nonzero(sk)
    pts = set(zip(ys.tolist(), xs.tolist()))
    nb = [(-1,-1),(-1,0),(-1,1),(0,-1),(0,1),(1,-1),(1,0),(1,1)]
    def neigh(p):
        y, x = p
        return [(y+dy, x+dx) for dy, dx in nb if (y+dy, x+dx) in pts]
    deg = {p: len(neigh(p)) for p in pts}
    visited_edges = set()
    lines = []
    def walk(start, nxt):
        path = [start, nxt]
        visited_edges.add((start, nxt)); visited_edges.add((nxt, start))
        prev, cur = start, nxt
        while deg[cur] == 2:
            cands = [q for q in neigh(cur) if q != prev and (cur, q) not in visited_edges]
            if not cands: break
            q = cands[0]
            visited_edges.add((cur, q)); visited_edges.add((q, cur))
            path.append(q); prev, cur = cur, q
        return path
    for p in pts:
        if deg[p] != 2:
            for q in neigh(p):
                if (p, q) not in visited_edges:
                    lines.append(walk(p, q))
    # pure loops
    for p in pts:
        if deg[p] == 2:
            for q in neigh(p):
                if (p, q) not in visited_edges:
                    lines.append(walk(p, q))
    return lines

def rdp(pts, eps):
    if len(pts) < 3: return pts
    a, b = pts[0], pts[-1]
    ab = b - a; L = np.hypot(*ab) + 1e-9
    v = pts - a
    d = np.abs(ab[0]*v[:,1] - ab[1]*v[:,0]) / L
    i = int(np.argmax(d))
    if d[i] > eps:
        return np.vstack([rdp(pts[:i+1], eps)[:-1], rdp(pts[i:], eps)])
    return np.vstack([a, b])

def smooth(pts, it=2):
    for _ in range(it):
        if len(pts) < 3: break
        q = pts.copy(); q[1:-1] = 0.25*pts[:-2] + 0.5*pts[1:-1] + 0.25*pts[2:]; pts = q
    return pts

def merge(lines, gap=2.5):
    """Join polylines whose endpoints touch and continue in a similar direction."""
    lines = [l for l in lines]
    changed = True
    while changed:
        changed = False
        ends = {}
        for i, l in enumerate(lines):
            for e in (0, -1):
                key = (round(l[e][0]/gap), round(l[e][1]/gap))
                ends.setdefault(key, []).append((i, e))
        used = set(); out = []
        for i, l in enumerate(lines):
            if i in used: continue
            key = (round(l[-1][0]/gap), round(l[-1][1]/gap))
            best = None
            for j, e in ends.get(key, []):
                if j == i or j in used: continue
                m = lines[j] if e == 0 else lines[j][::-1]
                if len(l) >= 2 and len(m) >= 2:
                    d1 = l[-1] - l[-2]; d2 = m[1] - m[0]
                    c = np.dot(d1, d2) / (np.linalg.norm(d1)*np.linalg.norm(d2) + 1e-9)
                    if c > 0.3 and (best is None or c > best[0]): best = (c, j, m)
            used.add(i)
            if best:
                used.add(best[1]); out.append(np.vstack([l, best[2][1:]])); changed = True
            else:
                out.append(l)
        lines = out
    return lines

def order(lines):
    """Greedy plotting order: start near the top, then nearest unvisited endpoint."""
    left = list(range(len(lines))); out = []
    cur = np.array([0.0, 0.0])
    # start with the top-most
    while left:
        best, bi, rev = 1e18, None, False
        for i in left:
            l = lines[i]
            for e, r in ((l[0], False), (l[-1], True)):
                d = (e[0]-cur[0])**2 + (e[1]-cur[1])**2 * 0.3
                if d < best: best, bi, rev = d, i, r
        l = lines[bi][::-1] if rev else lines[bi]
        out.append(l); left.remove(bi); cur = l[-1]
    return out

def silhouette(m):
    filled = ndi.binary_fill_holes(binary_closing(m, disk(6)))
    filled = remove_small_objects(filled, max_size=2000)
    cs, _ = cv2.findContours(filled.astype(np.uint8), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
    d = []
    for c in cs:
        c = c[:, 0, :].astype(float)
        c = smooth(c, 3)
        c = rdp(c, 0.6)
        d.append('M' + ' L'.join(f'{x:.1f} {y:.1f}' for x, y in c) + ' Z')
    return ' '.join(d), filled

def main():
    src, dst = sys.argv[1], sys.argv[2]
    crop = None
    if '--crop' in sys.argv:
        crop = tuple(int(v) for v in sys.argv[sys.argv.index('--crop')+1].split(','))
    a = load(src, crop)
    H, W = a.shape
    m = ink_mask(a)
    sk = skeletonize(m)
    raw = trace_skeleton(sk)
    lines = [np.array([[x, y] for y, x in l], dtype=float) for l in raw if len(l) >= 2]
    lines = merge(lines)
    out = []
    for l in lines:
        if len(l) < 2: continue
        L = np.sum(np.hypot(*np.diff(l, axis=0).T))
        if L < 6: continue   # spurs and specks
        l = smooth(l, 2)
        l = rdp(l, 0.45)
        out.append(l)
    out = order(out)
    sil, _ = silhouette(m)
    js = {'w': W, 'h': H,
          'strokes': [[round(float(v), 1) for p in l for v in p] for l in out],
          'sil': sil}
    json.dump(js, open(dst, 'w'), separators=(',', ':'))
    # cream ink with alpha from darkness, upscaled 2x for crisp close-ups
    big = Image.fromarray((a * 255).astype(np.uint8)).resize((W * 2, H * 2), Image.LANCZOS)
    b = np.asarray(big).astype(np.float32) / 255
    alpha = np.clip((0.93 - b) / 0.55, 0, 1)
    rgba = np.zeros((H * 2, W * 2, 4), np.uint8)
    rgba[..., 0], rgba[..., 1], rgba[..., 2] = 233, 227, 213
    rgba[..., 3] = (alpha * 255).astype(np.uint8)
    Image.fromarray(rgba).save(dst.replace('.json', '_ink.png'), optimize=True)
    tot = sum(len(s) for s in js['strokes']) // 2
    print(f'{src}: {len(out)} strokes, {tot} pts, json {len(json.dumps(js))//1024} KB')

if __name__ == '__main__':
    main()
