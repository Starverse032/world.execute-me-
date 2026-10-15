# Downloads the v3 (minimal geometric) fonts, subsetted to Latin + a few symbols.
import re, urllib.request, urllib.parse, pathlib
root = pathlib.Path(__file__).resolve().parent.parent
out = root / 'public' / 'fonts3'
out.mkdir(parents=True, exist_ok=True)
txt = ''.join(chr(i) for i in range(32, 127)) + '’‘“”…·×πΣ∞≈→∈⊂₁₂₃ₙ—–'
UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36'
def fetch(spec, alias):
    q = f'family={spec}&text={urllib.parse.quote(txt)}&display=block'
    css = urllib.request.urlopen(urllib.request.Request('https://fonts.googleapis.com/css2?' + q, headers={'User-Agent': UA})).read().decode()
    for block in re.findall(r'@font-face\s*{[^}]*}', css):
        w = re.search(r'font-weight:\s*(\d+)', block).group(1)
        st = re.search(r'font-style:\s*(\w+)', block).group(1)
        url = re.search(r'url\((https://[^)]+)\)', block).group(1)
        fn = f'{alias}-{w}{"i" if st == "italic" else ""}.woff2'
        (out / fn).write_bytes(urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': UA})).read())
        print(fn, (out / fn).stat().st_size)
fetch('Newsreader:opsz,wght@72,500', 'SERIF')
fetch('JetBrains+Mono:wght@400;500;700;800', 'CODE')
fetch('STIX+Two+Text:ital,wght@1,400', 'MATH')
