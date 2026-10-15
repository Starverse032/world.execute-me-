#!/bin/bash
# Vectorize every ChatGPT line drawing la_<pose>.png in a folder into
# public/la/<pose>.json + public/la/<pose>_ink.png (see scripts/lineart.py).
# usage: bash scripts/la_all.sh <folder with la_*.png>
set -e
src=${1:?usage: la_all.sh <folder with la_*.png>}
mkdir -p art/la public/la
for f in "$src"/la_*.png; do
  b=$(basename "$f" .png); pose=${b#la_}
  cp "$f" art/la/
  python3 scripts/lineart.py "art/la/$b.png" "art/la/$b.json" | tail -1
  cp "art/la/$b.json" "public/la/$pose.json"; cp "art/la/${b}_ink.png" "public/la/${pose}_ink.png"
done
ls -la public/la
