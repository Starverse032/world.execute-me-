# Chinese .srt for the whole song from docs/lyrics.lrc + docs/lyrics_zh.json.
# An ALL-CAPS LRC line is a keyword: it is appended to the preceding lead-in
# from its own timestamp. Lines end when the next line starts (max 4 s).
# usage: python3 scripts/make_srt_full.py <out.srt> [end_seconds]
import json, re, sys, pathlib
root = pathlib.Path(__file__).resolve().parent.parent
zh = json.loads((root / 'docs' / 'lyrics_zh.json').read_text(encoding='utf-8'))
end_at = float(sys.argv[2]) if len(sys.argv) > 2 else 1e9
rows = []
for line in (root / 'docs' / 'lyrics.lrc').read_text(encoding='utf-8').splitlines():
    m = re.match(r'\[(\d+):(\d+\.\d+)\](.*)', line)
    if m:
        key = f'{m.group(1)}:{m.group(2)}'
        t = int(m.group(1)) * 60 + float(m.group(2))
        en = m.group(3).strip()
        is_kw = en.isupper() and len(en) > 1 and not en.startswith('WORLD')
        rows.append((t, en, zh[key], is_kw))
# group: a lead-in followed by a keyword shows "lead" then "lead kw"
cues = []
for i, (t, en, z, kw) in enumerate(rows):
    nxt = rows[i + 1][0] if i + 1 < len(rows) else t + 4
    if kw and cues and cues[-1][3] == 'lead' and abs(cues[-1][1] - t) < 0.05:
        cues.append((t, min(nxt, t + 4), f'{cues[-1][2]} {z}', 'kw'))
    else:
        cues.append((t, min(nxt, t + 4), z, 'kw' if kw else 'lead'))
def ts(x):
    ms = round(x * 1000)
    return f'{ms // 3600000:02d}:{ms // 60000 % 60:02d}:{ms // 1000 % 60:02d},{ms % 1000:03d}'
cues = [c for c in cues if c[0] < end_at]
out = '\n'.join(f'{i}\n{ts(s)} --> {ts(min(e, end_at))}\n{text}\n' for i, (s, e, text, _) in enumerate(cues, 1))
pathlib.Path(sys.argv[1]).write_text(out, encoding='utf-8')
print(len(cues), 'cues')
