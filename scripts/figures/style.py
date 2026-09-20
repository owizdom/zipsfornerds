"""Shared drawing helpers for article figures.

SVGs are loaded through <img>, so they cannot see the page's webfonts; everything
uses system stacks. Colours match the site tokens in app/globals.css. The data
palette (#c98500 with #2a78d6) passes the contrast and colour-vision checks
against the paper surface.
"""
import os

PAPER, DARK, INK, MUTED = '#f6f1e7', '#ebe3d2', '#16150f', '#6a665a'
GOLD, GOLDD, BLUE = '#f4b728', '#c98500', '#2a78d6'
MONO = "ui-monospace, 'SF Mono', Menlo, Consolas, monospace"
SERIF = "Georgia, 'Times New Roman', serif"

def svg(w, h, body, title, desc):
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}" role="img" aria-labelledby="t d">
<title id="t">{title}</title><desc id="d">{desc}</desc>
<defs><marker id="arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="{INK}"/></marker>
<marker id="arrx" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="{GOLDD}"/></marker></defs>
<rect width="{w}" height="{h}" fill="{PAPER}"/>
<style>.m{{font-family:{MONO};font-size:13.5px;fill:{MUTED};letter-spacing:.05em}}.mi{{font-family:{MONO};font-size:14.5px;fill:{INK}}}.sb{{font-family:{SERIF};font-size:20px;font-weight:700;fill:{INK}}}.sm{{font-family:{SERIF};font-size:16.5px;fill:{INK}}}.xs{{font-family:{SERIF};font-size:14px;fill:{MUTED}}}</style>
{body}</svg>'''

def box(x, y, w, h, fill=None, dash=False, sw=2):
    d = ' stroke-dasharray="6 5"' if dash else ''
    return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="{fill or PAPER}" stroke="{INK}" stroke-width="{sw}"{d}/>'

def label(x, y, text, cls='sm', anchor='middle'):
    return f'<text x="{x}" y="{y}" class="{cls}" text-anchor="{anchor}">{text}</text>'

def arrow(x1, y1, x2, y2, gold=False):
    m = 'arrx' if gold else 'arr'
    c = GOLDD if gold else INK
    return f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="{c}" stroke-width="2" marker-end="url(#{m})"/>'

def cross(cx, cy, r=13):
    return (f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="{PAPER}" stroke="{INK}" stroke-width="2"/>'
            f'<path d="M{cx-6} {cy-6}L{cx+6} {cy+6}M{cx+6} {cy-6}L{cx-6} {cy+6}" stroke="{INK}" stroke-width="2.2"/>')

def tick(cx, cy, r=13):
    return (f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="{GOLD}" stroke="{INK}" stroke-width="2"/>'
            f'<path d="M{cx-6} {cy}L{cx-1} {cy+5}L{cx+6} {cy-5}" fill="none" stroke="{INK}" stroke-width="2.2"/>')

def write(slug, name, content):
    d = os.path.join(os.path.dirname(__file__), '..', '..', 'public', 'figures', slug)
    os.makedirs(d, exist_ok=True)
    open(os.path.join(d, name), 'w').write(content)
    print(' ', slug + '/' + name, len(content))

def cover(slug, content):
    d = os.path.join(os.path.dirname(__file__), '..', '..', 'public', 'covers', slug)
    os.makedirs(d, exist_ok=True)
    open(os.path.join(d, 'cover.svg'), 'w').write(content)
    print(' ', slug + '/cover.svg', len(content))
