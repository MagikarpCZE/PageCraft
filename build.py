"""
Build: index_orig.html (clean source) + style.css -> index.html (optimised, UTF-8)

Fixes applied:
  1. Remove Google Analytics from <head>  (GDPR – GA fires conditionally in script.js)
  2. Self-host Google Fonts: download woff2 to fonts/, inline @font-face CSS,
     preload critical Saira-800 fonts  (eliminates Google Fonts CDN latency)
  3. Inline + minify style.css as <style>  (eliminates render-blocking request)
  4. Add defer to <script src="script.js">
  5. Wrap portfolio PNG <img> in <picture> (WebP source + PNG fallback)
  6. footer <h4 class="footer__contact-title"> -> <h3>  (heading order, a11y)
"""

import re, pathlib, urllib.request

SRC       = pathlib.Path(r"c:\Users\Jakub\Desktop\pagecraft\index_orig.html")
CSS       = pathlib.Path(r"c:\Users\Jakub\Desktop\pagecraft\style.css")
DEST      = pathlib.Path(r"c:\Users\Jakub\Desktop\pagecraft\index.html")
FONTS_DIR = pathlib.Path(r"c:\Users\Jakub\Desktop\pagecraft\fonts")
FONTS_DIR.mkdir(exist_ok=True)

FONT_UA = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
    "AppleWebKit/537.36 (KHTML, like Gecko) "
    "Chrome/124.0.0.0 Safari/537.36"
)
FONT_URL = (
    "https://fonts.googleapis.com/css2?"
    "family=Saira:wght@300;400;600;700;800"
    "&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300"
    "&display=swap"
)

# 1. Read source ---------------------------------------------------------------
raw = SRC.read_bytes()
if raw[:2] in (b'\xff\xfe', b'\xfe\xff'):
    html = raw.decode('utf-16')
elif raw[:3] == b'\xef\xbb\xbf':
    html = raw.decode('utf-8-sig')
else:
    html = raw.decode('utf-8')
print(f"Source: {len(html)} chars  Czech: {'ě' in html or 'š' in html}")

# 2. Remove GA block from <head> -----------------------------------------------
html, n = re.subn(
    r'\s*<!-- =+ Google Analytics =+ -->\s*'
    r'<script[^>]*googletagmanager[^>]*></script>\s*'
    r'<script>.*?</script>',
    '', html, flags=re.DOTALL)
print(f"GA removed: {n}")

# 3. Self-host Google Fonts ----------------------------------------------------
print("Fetching Google Fonts CSS...")
req = urllib.request.Request(FONT_URL, headers={'User-Agent': FONT_UA})
with urllib.request.urlopen(req, timeout=20) as r:
    fonts_css = r.read().decode('utf-8')

# Extract all @font-face blocks then download woff2 files
face_blocks = re.findall(r'@font-face\s*\{[^}]+\}', fonts_css, re.DOTALL)

woff2_re  = re.compile(r'url\((https://fonts\.gstatic\.com/[^\)]+\.woff2)\)')
family_re = re.compile(r"font-family:\s*'([^']+)'")
weight_re = re.compile(r'font-weight:\s*([\d ]+)')

local_faces      = []
critical_preloads = []   # Saira 800 hrefs for <link rel="preload">
url_to_local      = {}   # woff2_url -> local_name  (dedup shared variable-font files)

for block in face_blocks:
    woff2_m = woff2_re.search(block)
    if not woff2_m:
        local_faces.append(block)
        continue

    woff2_url = woff2_m.group(1)

    if woff2_url in url_to_local:
        local_name = url_to_local[woff2_url]   # same file already on disk
    else:
        local_name = woff2_url.split('/')[-1]   # use Google's own filename (unique hash)
        local_path = FONTS_DIR / local_name
        if not local_path.exists():
            print(f'  Downloading {local_name}...')
            req2 = urllib.request.Request(woff2_url)
            with urllib.request.urlopen(req2, timeout=20) as r2:
                local_path.write_bytes(r2.read())
        else:
            print(f'  Cached: {local_name}')
        url_to_local[woff2_url] = local_name

    local_block = re.sub(
        r'url\(' + re.escape(woff2_url) + r'\)',
        f"url('fonts/{local_name}')",
        block
    )
    local_faces.append(local_block)

    # Preload Saira 800 — used by hero h1 (LCP element), needs latin + latin-ext for Czech
    family_m = family_re.search(block)
    weight_m = weight_re.search(block)
    family = family_m.group(1).lower().replace(' ', '-') if family_m else ''
    weight = weight_m.group(1).strip()                   if weight_m else ''
    if family == 'saira' and '800' in weight and f'fonts/{local_name}' not in critical_preloads:
        critical_preloads.append(f'fonts/{local_name}')

face_css = '\n'.join(local_faces)
print(f"@font-face blocks: {len(face_blocks)}, Saira-800 preloads: {len(critical_preloads)}")

# Remove all Google Fonts links (preconnect + blocking stylesheet) from source HTML
html = re.sub(
    r'\n\s*<link[^>]+(fonts\.googleapis\.com|fonts\.gstatic\.com)[^>]*/?>',
    '', html)
print("Google Fonts links removed from HTML")

# Insert Saira-800 preload hints before the stylesheet link
# (which becomes the inline <style> in step 4 — keeps preloads ahead of CSS block)
preload_tags = '\n'.join(
    f'  <link rel="preload" href="{href}" as="font" type="font/woff2" crossorigin />'
    for href in critical_preloads
)
html = html.replace(
    '<link rel="stylesheet" href="style.css"',
    preload_tags + '\n  <link rel="stylesheet" href="style.css"',
    1
)
print(f"Preload tags added: {len(critical_preloads)}")

# 4. Minify CSS and inline (with @font-face prepended) -------------------------
css_raw = CSS.read_text(encoding='utf-8-sig')  # strips BOM if present

def minify(css):
    css = re.sub(r'/\*.*?\*/', '', css, flags=re.DOTALL)
    css = re.sub(r'\s*\n\s*', ' ', css)
    css = re.sub(r' {2,}', ' ', css)
    css = re.sub(r'\s*([{};:,>~+])\s*', r'\1', css)
    css = re.sub(r';\}', '}', css)
    # Strip units from bare zero — NOT % (0% is required in @keyframes selectors)
    css = re.sub(r'(?<!\w)0(px|em|rem)', r'0', css)
    return css.strip()

css_min   = minify(css_raw)
faces_min = minify(face_css)   # strips subset comments, collapses whitespace
print(f"CSS: {len(css_raw)} -> {len(css_min)} chars")
print(f"@font-face CSS minified: {len(faces_min)} chars")

# Inline: @font-face first, then site CSS
html, n = re.subn(
    r'<link\s+rel="stylesheet"\s+href="style\.css"\s*/?>',
    f'<style>{faces_min}{css_min}</style>', html)
print(f"CSS inlined: {n}")

# 5. Defer script.js -----------------------------------------------------------
html, n = re.subn(
    r'<script\s+src="script\.js"></script>',
    '<script src="script.js" defer></script>', html)
print(f"script.js defer: {n}")

# 6. Wrap portfolio PNGs in <picture> ------------------------------------------
def wrap_pic(m):
    tag, name = m.group(1), m.group(2)
    tag = tag.rstrip('>').rstrip('/').rstrip() + ' />'
    return (
        f'<picture>\n'
        f'                <source srcset="img/{name}.webp" type="image/webp" />\n'
        f'                {tag}\n'
        f'              </picture>'
    )
html, n = re.subn(
    r'(<img\s+src="img/(beran|puresound)\.png"[^>]*class="portfolio__img"[^>]*/?>)',
    wrap_pic, html, flags=re.DOTALL)
print(f"<picture> wrapped: {n}")

# 7. footer h4 -> h3 -----------------------------------------------------------
html, n = re.subn(r'<h4(\s+class="footer__contact-title"[^>]*)>', r'<h3\1>', html)
html = html.replace('</h4>', '</h3>', 1)
print(f"footer h4->h3: {n}")

# 8. Verify --------------------------------------------------------------------
assert 'ě' in html or 'š' in html,     "FAIL: no Czech chars"
assert '\ufffd' not in html,            "FAIL: replacement chars"
assert not html.startswith('\ufeff'),   "FAIL: BOM at start"
assert '<style>' in html,               "FAIL: no inline style"
assert 'font-face' in html,             "FAIL: no @font-face in style"
assert 'fonts/' in html,                "FAIL: no local font references in HTML"
assert critical_preloads,               "FAIL: no Saira-800 critical preloads found"
assert '<picture>' in html,             "FAIL: no picture element"
assert 'googletagmanager' not in html.split('</head>')[0], "FAIL: GA in head"
assert 'fonts.googleapis.com' not in html, "FAIL: still linking Google Fonts"
assert '<h3 class="footer__contact-title"' in html, "FAIL: footer still h4"
assert 'width:100%' in css_min,         "FAIL: 100% stripped from CSS"
assert '0%,' in css_min or 'from' in css_min, "FAIL: 0% stripped from keyframes"
print("\nAll checks PASSED ✓")

# 9. Save ----------------------------------------------------------------------
DEST.write_text(html, encoding='utf-8')
print(f"Saved {DEST}  ({DEST.stat().st_size/1024:.1f} KB)")
