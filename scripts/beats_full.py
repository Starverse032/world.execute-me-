# Onset detection over the whole song (spectral flux), snapped against the
# nominal 130 BPM grid. Writes src/beats.json (detected onsets near the grid)
# and prints grid drift per section.
import json, subprocess, sys
import numpy as np

SR = 22050
raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', 'public/song.mp3', '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout
x = np.frombuffer(raw, dtype=np.float32)
hop, win = 256, 1024
n = 1 + (len(x) - win) // hop
w = np.hanning(win).astype(np.float32)
frames = np.lib.stride_tricks.as_strided(x, shape=(n, win), strides=(x.strides[0] * hop, x.strides[0]))
S = np.log1p(10 * np.abs(np.fft.rfft(frames * w, axis=1)))
flux = np.maximum(0, np.diff(S, axis=0)).sum(1)
flux = np.concatenate([[0], flux])
# local normalisation
k = int(1.0 * SR / hop)
pad = np.pad(flux, (k, k), mode='edge')
cs = np.cumsum(pad)
mean = (cs[2 * k:] - cs[:-2 * k]) / (2 * k)
nov = np.maximum(0, flux - mean[: len(flux)])
times = (np.arange(len(nov)) * hop + win / 2) / SR
# peaks
pk = [i for i in range(1, len(nov) - 1) if nov[i] > nov[i - 1] and nov[i] >= nov[i + 1] and nov[i] > 0.6 * mean[i]]
pt = times[pk]
pv = nov[pk]
B0, BEAT = 0.151, 60 / 130
dur = len(x) / SR
out = []
devs = []
for i in range(int((dur - B0) / BEAT) + 1):
    nom = B0 + BEAT * i
    m = np.abs(pt - nom) <= 0.04
    if m.any():
        j = np.argmax(np.where(m, pv, -1))
        out.append(round(float(pt[j]), 3))
        devs.append((nom, pt[j] - nom))
json.dump(out, open('src/beats.json', 'w'))
devs = np.array(devs)
print('beats', int((dur - B0) / BEAT) + 1, 'matched', len(out))
for a in range(0, int(dur), 20):
    s = devs[(devs[:, 0] >= a) & (devs[:, 0] < a + 20)]
    if len(s):
        print(f'{a:3d}-{a+20:3d}s  n={len(s):3d}  median dev {1000*np.median(s[:,1]):+6.1f} ms')
