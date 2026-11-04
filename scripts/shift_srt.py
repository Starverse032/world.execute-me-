# Shift every cue of an SRT by a fixed time.
# usage: python scripts/shift_srt.py <in.srt> <out.srt> <seconds>
# The Release cut opens with a 75-frame notice (src/v4/Cards.tsx INTRO_FRAMES),
# so its subtitles are the MV's shifted by 2.5 s.
import re, sys

src, dst, dt = sys.argv[1], sys.argv[2], round(float(sys.argv[3]) * 1000)
stamp = re.compile(r"(\d\d):(\d\d):(\d\d),(\d\d\d)")
def shift(m):
    ms = (int(m[1]) * 3600 + int(m[2]) * 60 + int(m[3])) * 1000 + int(m[4]) + dt
    return f"{ms // 3600000:02d}:{ms // 60000 % 60:02d}:{ms // 1000 % 60:02d},{ms % 1000:03d}"
with open(src, encoding="utf-8-sig", newline="") as f:
    text = f.read()
with open(dst, "w", encoding="utf-8", newline="") as f:
    f.write(stamp.sub(shift, text))