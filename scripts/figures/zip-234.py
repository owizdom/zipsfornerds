#!/usr/bin/env python3
"""Figures for ZIPs For Nerds #5 (ZIP 234). Run: python3 scripts/figures/zip-234.py"""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from style import *

SLUG = 'zip-234-issuance-smoothing'

# FIG 1 — step function vs smooth curve
b = label(40, 42, 'FIG. 1 / THE SAME DECLINE, DELIVERED TWO WAYS', 'm', 'start')
X0, Y0, W, H = 110, 300, 760, 190
b += f'<line x1="{X0}" y1="{Y0}" x2="{X0+W}" y2="{Y0}" stroke="{INK}" stroke-width="2"/>'
b += f'<line x1="{X0}" y1="{Y0}" x2="{X0}" y2="{Y0-H}" stroke="{INK}" stroke-width="2"/>'
b += label(X0-12, Y0-H-8, 'subsidy', 'm', 'end') + label(X0+W, Y0+26, 'time', 'm', 'end')
# steps
pts=[]
for i in range(4):
    x1 = X0 + i*(W/4); x2 = X0 + (i+1)*(W/4); y = Y0 - H/(2**i)
    pts.append(f'M{x1} {y}L{x2} {y}')
    if i < 3: pts.append(f'M{x2} {y}L{x2} {Y0 - H/(2**(i+1))}')
b += f'<path d="{" ".join(pts)}" fill="none" stroke="{BLUE}" stroke-width="3"/>'
# curve
import math
cp=[]
for k in range(0, 101):
    t = k/100
    x = X0 + t*W
    y = Y0 - H*math.exp(-1.386*4*t/2)
    cp.append(f'{"M" if k==0 else "L"}{x:.1f} {y:.1f}')
b += f'<path d="{" ".join(cp)}" fill="none" stroke="{GOLDD}" stroke-width="3"/>'
b += f'<rect x="{X0+W-230}" y="{Y0-H-34}" width="14" height="14" fill="{BLUE}"/>' + label(X0+W-208, Y0-H-22, 'halvings today', 'sm', 'start')
b += f'<rect x="{X0+W-230}" y="{Y0-H-10}" width="14" height="14" fill="{GOLDD}"/>' + label(X0+W-208, Y0-H+2, 'ZIP 234 curve', 'sm', 'start')
for i in range(1,4):
    x = X0 + i*(W/4)
    b += f'<line x1="{x}" y1="{Y0}" x2="{x}" y2="{Y0+8}" stroke="{INK}" stroke-width="1.5"/>' + label(x, Y0+26, f'halving {i}', 'm')
b += label(480, 380, 'After the 2020 halving, weekly difficulty fell about 20.6% within roughly a week (ZIP 234).', 'sm')
write(SLUG, 'fig-1-step-vs-curve.svg', svg(960, 404, b, 'Halvings as a step function compared with a smooth issuance curve',
    'Today the block subsidy halves every four years in abrupt steps. ZIP 234 proposes a smooth logarithmic curve declining continuously over the same period.'))

# FIG 2 — money reserve feedback
b = label(40, 42, 'FIG. 2 / WHY THE CURVE CAN REISSUE REMOVED COINS', 'm', 'start')
b += box(300, 78, 360, 80, DARK) + label(480, 110, 'Money Reserve', 'sb') + label(480, 136, 'what MAX_MONEY allows, minus what exists', 'xs')
b += arrow(480, 162, 480, 212)
b += box(300, 216, 360, 80, GOLD) + label(480, 248, 'Block subsidy', 'sb') + label(480, 274, '0.0000004126 of the reserve, each block', 'xs')
b += f'<path d="M300 256 Q150 256 150 118 Q150 118 296 118" fill="none" stroke="{GOLDD}" stroke-width="2" stroke-dasharray="6 5" marker-end="url(#arrx)"/>'
b += label(70, 190, 'ZIP 233', 'sb', 'start') + label(70, 214, 'removals enlarge', 'xs', 'start') + label(70, 234, 'the reserve', 'xs', 'start')
b += box(700, 216, 200, 80, PAPER, dash=True) + label(800, 248, 'issued supply', 'sm') + label(800, 272, 'approaches the cap,', 'xs') + label(800, 290, 'never crosses it', 'xs')
b += arrow(665, 256, 696, 256)
b += label(480, 348, 'One constant gives smooth decline, a preserved cap, no terminal block and automatic reissuance.', 'sm')
write(SLUG, 'fig-2-money-reserve.svg', svg(960, 372, b, 'The block subsidy is a fixed fraction of the Money Reserve',
    'Each block pays a fixed fraction of the Money Reserve. Removing coins enlarges the reserve, which raises future subsidies, so removed funds are reissued automatically.'))

# FIG 3 — the vote
b = label(40, 42, 'FIG. 3 / WHAT COINHOLDERS DECIDED, SEPTEMBER 2026', 'm', 'start')
rows = [('Keep Bitcoin-style halvings', 98.9, 'rejects the smoothed curve'),
        ('Delay NSM reissuance to February 2031', 96.6, 'removals would have no route back until then'),
        ('Cut block target to 25 seconds (ZIP 218)', 99.9, 'for comparison, the same ballot')]
for i,(t,pct,note) in enumerate(rows):
    y = 92 + i*96
    b += label(60, y, t, 'sb', 'start')
    b += f'<rect x="60" y="{y+14}" width="600" height="26" rx="4" fill="{DARK}"/>'
    b += f'<rect x="60" y="{y+14}" width="{int(600*pct/100)}" height="26" rx="4" fill="{GOLDD if i<2 else MUTED}"/>'
    b += label(676, y+34, f'{pct}%', 'mi', 'start')
    b += label(60, y+62, note, 'xs', 'start')
b += label(480, 400, 'About 2.4 million ZEC took part. Percentages are of participating ZEC.', 'sm')
write(SLUG, 'fig-3-vote.svg', svg(960, 424, b, 'Results of the September 2026 coinholder poll',
    'Coinholders voted 98.9 percent to keep Bitcoin-style halvings, 96.6 percent to delay NSM reissuance until February 2031, and 99.9 percent to cut the block target to 25 seconds.'))

# COVER
c = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" role="img" aria-label="A blue stepped line and a gold smooth curve descending together">
<rect width="800" height="600" fill="{INK}"/>'''
X0,Y0,W,H = 110, 470, 580, 300
steps=[]
for i in range(4):
    x1=X0+i*(W/4); x2=X0+(i+1)*(W/4); y=Y0-H/(2**i)
    steps.append(f'M{x1} {y}L{x2} {y}')
    if i<3: steps.append(f'M{x2} {y}L{x2} {Y0-H/(2**(i+1))}')
c += f'<path d="{" ".join(steps)}" fill="none" stroke="{PAPER}" stroke-width="5" opacity=".45"/>'
cp=[]
for k in range(101):
    t=k/100; x=X0+t*W; y=Y0-H*math.exp(-1.386*4*t/2)
    cp.append(f'{"M" if k==0 else "L"}{x:.1f} {y:.1f}')
c += f'<path d="{" ".join(cp)}" fill="none" stroke="{GOLD}" stroke-width="6"/>'
c += f'<text x="400" y="556" text-anchor="middle" font-family="{MONO}" font-size="16" letter-spacing="5" fill="{PAPER}" opacity=".8">STEPS OR A CURVE</text></svg>'
cover(SLUG, c)
