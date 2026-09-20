#!/usr/bin/env python3
"""Figures for ZIPs For Nerds #7 (ZIP 2002). Run: python3 scripts/figures/zip-2002.py"""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from style import *
SLUG = 'zip-2002-explicit-fees'

# FIG 1 — forgotten change
b = label(40, 42, 'FIG. 1 / THE SAME MISTAKE, WITH AND WITHOUT A CHANGE OUTPUT', 'm', 'start')
for i,(y,title,outs,fee,ok) in enumerate([
    (80, 'What you meant', [('to recipient','1 ZEC'),('change to you','8.9999 ZEC')], '0.0001 ZEC', True),
    (250, 'What you sent', [('to recipient','1 ZEC')], '9 ZEC', False)]):
    b += label(60, y+28, title, 'sb', 'start')
    b += box(250, y, 150, 56, DARK) + label(325, y+26, 'input', 'xs') + label(325, y+46, '10 ZEC', 'mi')
    b += arrow(405, y+28, 448, y+28)
    for j,(t,v) in enumerate(outs):
        b += box(455+j*180, y, 170, 56) + label(540+j*180, y+24, t, 'xs') + label(540+j*180, y+45, v, 'mi')
    fx = 455 + len(outs)*180
    b += f'<rect x="{fx}" y="{y}" width="170" height="56" fill="{GOLD if ok else "#c0392b"}" stroke="{INK}" stroke-width="2"/>'
    b += label(fx+85, y+24, 'fee', 'xs') + (label(fx+85, y+45, fee, 'mi') if ok else f'<text x="{fx+85}" y="{y+45}" class="mi" text-anchor="middle" fill="#ffffff">{fee}</text>')
b += label(480, 356, 'Both are valid. Nothing rejects the second one. The fee is whatever is left over.', 'sm')
b += label(480, 384, 'ZIP 2002: "it should be very hard to make mistakes."', 'sm')
write(SLUG, 'fig-1-forgotten-change.svg', svg(960, 408, b, 'A forgotten change output silently becomes an enormous fee',
    'With an implicit fee, forgetting the change output produces a valid transaction that pays 9 ZEC to a miner instead of 0.0001 ZEC.'))

# FIG 2 — hardware wallet
b = label(40, 42, 'FIG. 2 / WHAT A SIGNING DEVICE CAN SHOW YOU', 'm', 'start')
b += box(70, 84, 380, 220, PAPER, dash=True) + label(260, 118, 'Implicit fee, today', 'sb')
b += label(260, 162, 'The device is handed the inputs', 'sm') + label(260, 186, 'and outputs, then recomputes', 'sm') + label(260, 210, 'the fee itself.', 'sm')
b += label(260, 248, 'It must trust that the list of', 'xs') + label(260, 268, 'inputs it was given is complete.', 'xs') + cross(260, 292)
b += box(510, 84, 380, 220, GOLD) + label(700, 118, 'Explicit fee, ZIP 2002', 'sb')
b += label(700, 162, 'The fee is written in the', 'sm') + label(700, 186, 'transaction and committed to', 'sm') + label(700, 210, 'by the txid.', 'sm')
b += label(700, 248, 'The device displays the value', 'xs') + label(700, 268, 'it is actually signing.', 'xs') + tick(700, 292)
b += label(480, 350, 'Changing the fee changes the txid, so what you are shown is what you authorise.', 'sm')
write(SLUG, 'fig-2-hardware-wallet.svg', svg(960, 374, b, 'An explicit fee lets a signing device display the committed value',
    'With an implicit fee a hardware wallet must recompute the fee from data it was given. With an explicit fee it can display the value committed to by the transaction id.'))

# FIG 3 — both sides
b = label(40, 42, 'FIG. 3 / THE FEE IS WRITTEN DOWN ON BOTH SIDES', 'm', 'start')
b += box(70, 88, 340, 150) + label(240, 124, 'Ordinary transaction', 'sb') + label(240, 156, 'bundle type 5, variant 0', 'mi')
b += f'<rect x="110" y="176" width="260" height="42" fill="{BLUE}"/>' + f'<text x="240" y="204" class="mi" text-anchor="middle" fill="#ffffff">value MUST be nonpositive</text>'
b += arrow(418, 162, 542, 162, gold=True) + label(480, 148, 'fee', 'm')
b += box(548, 88, 340, 150, DARK) + label(718, 124, 'Coinbase transaction', 'sb') + label(718, 156, 'bundle type 5, variant 0', 'mi')
b += f'<rect x="588" y="176" width="260" height="42" fill="{GOLDD}"/>' + f'<text x="718" y="204" class="mi" text-anchor="middle" fill="#ffffff">value MUST be nonnegative</text>'
b += label(480, 286, 'No effecting data and no authorizing data: nothing to prove, nothing to sign.', 'sm')
b += label(480, 314, 'Just an entry in the value pool deltas that the consensus rules check.', 'sm')
write(SLUG, 'fig-3-both-sides.svg', svg(960, 338, b, 'The fee is a negative entry in a transaction and a positive entry in the coinbase',
    'For non-coinbase transactions the fee entry must be nonpositive. For coinbase transactions it must be nonnegative, representing fees collected from the block.'))

# COVER
c = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" role="img" aria-label="A subtraction sum crossed out beside a clearly written fee field">
<rect width="800" height="600" fill="{INK}"/>
<text x="400" y="200" text-anchor="middle" font-family="{MONO}" font-size="44" fill="{PAPER}" opacity=".35">in − out = ?</text>
<line x1="210" y1="186" x2="590" y2="186" stroke="#c0392b" stroke-width="6"/>
<rect x="210" y="300" width="380" height="110" fill="{GOLD}"/>
<text x="400" y="352" text-anchor="middle" font-family="{MONO}" font-size="17" letter-spacing="3" fill="{INK}">FEE</text>
<text x="400" y="390" text-anchor="middle" font-family="{MONO}" font-size="30" fill="{INK}">0.0001 ZEC</text>
<text x="400" y="546" text-anchor="middle" font-family="{MONO}" font-size="16" letter-spacing="5" fill="{PAPER}" opacity=".8">WRITE IT DOWN</text></svg>'''
cover(SLUG, c)
