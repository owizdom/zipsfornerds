#!/usr/bin/env python3
"""Figures for ZIPs For Nerds #4 (ZIP 233). Run: python3 scripts/figures/zip-233.py"""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from style import *

SLUG = 'zip-233-removing-funds-from-circulation'

# FIG 1 — headroom under the cap
b = label(40, 42, 'FIG. 1 / HEADROOM UNDER THE CAP', 'm', 'start')
b += f'<line x1="70" y1="86" x2="890" y2="86" stroke="{INK}" stroke-width="2.5"/>'
b += label(70, 76, 'MAX_MONEY, 21 million ZEC. This line never moves.', 'sm', 'start')
# before
b += f'<rect x="120" y="120" width="260" height="190" fill="{MUTED}"/>' + label(250, 230, 'issued', 'mi').replace('class="mi"','class="mi" fill="#ffffff"')
b += f'<rect x="120" y="96" width="260" height="24" fill="none" stroke="{MUTED}" stroke-width="1.5" stroke-dasharray="5 4"/>'
b += label(250, 340, 'Before', 'sb') + label(250, 364, 'issuance approaches the cap', 'xs')
b += arrow(410, 210, 500, 210, gold=True) + label(455, 194, 'remove', 'm')
# after
b += f'<rect x="530" y="180" width="260" height="130" fill="{MUTED}"/>' + label(660, 252, 'issued', 'mi').replace('class="mi"','class="mi" fill="#ffffff"')
b += f'<rect x="530" y="96" width="260" height="84" fill="{GOLD}" stroke="{INK}" stroke-width="1.5"/>' + label(660, 144, 'headroom', 'mi')
b += label(660, 340, 'After removals', 'sb') + label(660, 364, 'space that future subsidies can use', 'xs')
b += label(480, 404, 'Schematic, not to scale. The cap is not raised; the space beneath it is reopened.', 'sm')
write(SLUG, 'fig-1-headroom.svg', svg(960, 428, b, 'Removing ZEC creates headroom below the unchanged 21 million cap',
    'Schematic, not to scale. The MAX_MONEY cap of 21 million ZEC does not move. Removing coins from circulation widens the gap between issued supply and the cap, and that gap can fund future block subsidies.'))

# FIG 2 — three destinations
b = label(40, 42, 'FIG. 2 / THREE THINGS YOU CAN DO WITH REMOVED COINS', 'm', 'start')
for i,(t,s1,s2,ok) in enumerate([
    ('Destroy them','Supply shrinks forever.','Holders gain, security budget does not.',False),
    ('Hold them in a reserve','Funds the network, but creates','a treasury and a governance fight.',False),
    ('Reissue algorithmically','Returned through future block','subsidies. Nobody decides.',True)]):
    x = 50 + i*300
    b += box(x, 84, 260, 210, GOLD if ok else PAPER, dash=not ok)
    b += label(x+130, 126, t, 'sb') + label(x+130, 176, s1, 'sm') + label(x+130, 200, s2, 'sm')
    b += (tick if ok else cross)(x+130, 252)
b += label(480, 342, 'ZIP 233 takes the third path: "automatically and algorithmically reissued".', 'sm')
write(SLUG, 'fig-2-three-destinations.svg', svg(960, 366, b, 'Three possible destinations for removed coins',
    'Removed coins could be destroyed forever, held in a controlled reserve, or reissued automatically through future block subsidies. ZIP 233 intends the third.'))

# FIG 3 — the NSM loop
b = label(40, 42, 'FIG. 3 / THE NETWORK SUSTAINABILITY MECHANISM, AS THREE ZIPS', 'm', 'start')
cx, cy = 480, 232
b += box(330, 92, 300, 76, DARK) + label(480, 124, 'ZIP 235', 'sb') + label(480, 150, 'takes 60% of transaction fees', 'xs')
b += box(80, 250, 280, 76, GOLD) + label(220, 282, 'ZIP 233', 'sb') + label(220, 308, 'removes it from circulation', 'xs')
b += box(600, 250, 280, 76, DARK) + label(740, 282, 'ZIP 234', 'sb') + label(740, 308, 'reissues it as block subsidy', 'xs')
b += arrow(330, 140, 240, 246) + arrow(362, 288, 596, 288) + arrow(800, 246, 630, 150)
b += label(480, 376, 'ZIP 233 is the opening in the side of the loop. On its own, nothing closes it.', 'sm')
write(SLUG, 'fig-3-nsm-loop.svg', svg(960, 400, b, 'The three ZIPs of the Network Sustainability Mechanism form a loop',
    'ZIP 235 takes 60 percent of transaction fees, ZIP 233 removes them from circulation, and ZIP 234 reissues them through future block subsidies.'))

# FIG 4 — no output produced
b = label(40, 42, 'FIG. 4 / AN ORDINARY TRANSFER VERSUS A REMOVAL', 'm', 'start')
b += label(60, 96, 'Ordinary transfer', 'sb', 'start')
b += box(250, 76, 180, 64) + label(340, 114, 'pool A', 'sm')
b += arrow(435, 108, 520, 108) + label(478, 96, '20 ZEC', 'm')
b += box(525, 76, 180, 64, GOLD) + label(615, 114, 'pool B', 'sm')
b += label(730, 114, 'output created', 'xs', 'start')
b += label(60, 212, 'ZIP 233 removal', 'sb', 'start')
b += box(250, 192, 180, 64) + label(340, 230, 'pool A', 'sm')
b += arrow(435, 224, 520, 224, gold=True) + label(478, 212, '20 ZEC', 'm')
b += box(525, 192, 180, 64, PAPER, dash=True) + cross(615, 224)
b += label(730, 218, 'no output, anywhere.', 'xs', 'start') + label(730, 240, 'subtracted from issued supply', 'xs', 'start')
b += label(480, 306, 'No new proof and no new signature: a bundle type with no effecting and no authorizing data.', 'sm')
write(SLUG, 'fig-4-no-output.svg', svg(960, 330, b, 'A removal creates no output in any pool',
    'An ordinary transfer moves value from one pool to another and creates an output. A ZIP 233 removal creates no output in any pool, so the amount is subtracted from the issued supply.'))

# COVER
c = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" role="img" aria-label="A bar of gold coins with a gap opened beneath a fixed ceiling line">
<rect width="800" height="600" fill="{INK}"/>
<line x1="90" y1="140" x2="710" y2="140" stroke="{PAPER}" stroke-width="4"/>
<text x="90" y="122" font-family="{MONO}" font-size="15" letter-spacing="4" fill="{PAPER}" opacity=".7">MAX_MONEY</text>'''
for r in range(4):
    for i in range(10):
        c += f'<rect x="{115+i*58}" y="{372-r*54}" width="44" height="44" fill="{GOLD}"/>'
for i in (2,5,8):
    c += f'<rect x="{115+i*58}" y="{372-3*54}" width="44" height="44" fill="{INK}" stroke="{GOLD}" stroke-width="2" stroke-dasharray="5 4"/>'
c += f'<text x="400" y="546" text-anchor="middle" font-family="{MONO}" font-size="16" letter-spacing="5" fill="{PAPER}" opacity=".8">OUT OF CIRCULATION</text></svg>'
cover(SLUG, c)
