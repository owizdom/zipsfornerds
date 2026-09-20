#!/usr/bin/env python3
"""Figures for ZIPs For Nerds #6 (ZIP 231). Run: python3 scripts/figures/zip-231.py"""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from style import *
SLUG = 'zip-231-memo-bundles'

# FIG 1 — wasted space today
b = label(40, 42, 'FIG. 1 / WHERE THE 1024 BYTES GO TODAY', 'm', 'start')
for i,(x,used) in enumerate([(90,True),(510,False)]):
    b += box(x, 82, 360, 210)
    b += label(x+180, 118, f'Shielded output {i+1}', 'sb')
    b += f'<rect x="{x+30}" y="140" width="300" height="34" fill="{DARK}" stroke="{INK}" stroke-width="1.2"/>' + label(x+180, 163, 'note plaintext, 52 bytes', 'xs')
    fill = GOLD if used else PAPER
    b += f'<rect x="{x+30}" y="182" width="300" height="70" fill="{fill}" stroke="{INK}" stroke-width="1.2"{"" if used else " stroke-dasharray=\'6 5\'"}/>'
    b += label(x+180, 212, 'memo field, 512 bytes', 'mi') + label(x+180, 238, 'your memo' if used else 'empty, padded', 'xs')
    b += label(x+180, 276, 'paid for either way', 'xs')
b += label(480, 334, 'Wallets pad to two outputs so a payment with change looks like one without. Both carry the full field.', 'sm')
b += label(480, 362, '1024 bytes of memo space. ZIP 231: "most of this data space is wasted".', 'sm')
write(SLUG, 'fig-1-wasted-space.svg', svg(960, 386, b, 'Both padded outputs carry a full 512-byte memo field',
    'An ordinary shielded transaction is padded to two outputs. Each carries a fixed 512-byte memo field, so 1024 bytes are spent even when at most one memo is written.'))

# FIG 2 — the bundle
b = label(40, 42, 'FIG. 2 / THE MEMO MOVES OUT OF THE OUTPUT', 'm', 'start')
for i,x in enumerate([70, 70]):
    y = 86 + i*96
    b += box(x, y, 300, 76) + label(x+150, y+34, f'Shielded output {i+1}', 'sb') + label(x+150, y+60, 'memo key, 32 bytes', 'mi')
b += arrow(378, 124, 470, 170) + arrow(378, 220, 470, 194)
b += box(478, 86, 412, 178, DARK) + label(684, 120, 'Memo bundle', 'sb') + label(684, 144, 'one per transaction', 'xs')
for i in range(4):
    x = 502 + i*98
    fill = GOLD if i < 2 else PAPER
    dash = '' if i < 2 else " stroke-dasharray='5 4'"
    b += f'<rect x="{x}" y="166" width="82" height="52" fill="{fill}" stroke="{INK}" stroke-width="1.2"{dash}/>' + label(x+41, 190, 'chunk', 'xs') + label(x+41, 210, '272 B', 'xs')
b += label(684, 246, 'up to 64 chunks, so 16 KiB of memo per transaction', 'xs')
b += label(480, 306, 'Each chunk encrypts 256 bytes. Two chunks are free when a transaction has shielded outputs; beyond that you pay.', 'sm')
b += label(480, 334, 'The same two-output transaction drops from 1024 bytes to about 576.', 'sm')
write(SLUG, 'fig-2-bundle.svg', svg(960, 358, b, 'Outputs carry a 32-byte key pointing into a shared memo bundle',
    'Each shielded output carries a 32-byte memo key instead of an inline memo. The keys unlock chunks of a single shared memo bundle of up to 64 chunks, or 16 KiB.'))

# FIG 3 — pruning
b = label(40, 42, 'FIG. 3 / MEMO DATA CAN BE REPLACED BY A DIGEST', 'm', 'start')
b += label(60, 96, 'Node that keeps memos', 'sb', 'start')
for i in range(5):
    b += f'<rect x="{380+i*76}" y="76" width="64" height="44" fill="{GOLD}" stroke="{INK}" stroke-width="1.2"/>'
b += label(838, 103, 'full bundle', 'xs', 'start')
b += label(60, 196, 'Node that prunes', 'sb', 'start')
b += f'<rect x="380" y="176" width="140" height="44" fill="{DARK}" stroke="{INK}" stroke-width="1.5"/>' + label(450, 204, 'digest', 'mi')
for i in range(1,5):
    b += f'<rect x="{380+i*76+64}" y="176" width="0" height="44"/>'
b += label(540, 203, 'the bytes are gone', 'xs', 'start')
b += tick(700, 198) + label(790, 203, 'still validates', 'sm', 'start')
b += label(480, 286, 'Consensus commits to the digest, so a node can discard memo data and still validate the chain.', 'sm')
b += label(480, 314, 'The trade: memo history survives only where someone chose to keep it.', 'sm')
write(SLUG, 'fig-3-pruning.svg', svg(960, 338, b, 'A node can replace the memo bundle with a digest and still validate',
    'Memo bundles are prunable. A node may replace the entire bundle with a single digest and still validate the transaction, because consensus commits to the digest.'))

# COVER
c = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" role="img" aria-label="Two large mostly empty blocks beside a row of small tightly packed chunks">
<rect width="800" height="600" fill="{INK}"/>
<text x="120" y="150" font-family="{MONO}" font-size="15" letter-spacing="4" fill="{PAPER}" opacity=".55">512 + 512</text>'''
for i in range(2):
    c += f'<rect x="{120+i*150}" y="180" width="120" height="240" fill="none" stroke="{PAPER}" stroke-width="3" opacity=".5"/>'
    c += f'<rect x="{120+i*150}" y="{180 if i==0 else 380}" width="120" height="{56 if i==0 else 40}" fill="{GOLD}" opacity="{1 if i==0 else .35}"/>'
c += f'<text x="470" y="150" font-family="{MONO}" font-size="15" letter-spacing="4" fill="{PAPER}" opacity=".55">576</text>'
for i in range(3):
    for j in range(2):
        c += f'<rect x="{470+i*66}" y="{180+j*66}" width="56" height="56" fill="{GOLD}"/>'
c += f'<text x="400" y="546" text-anchor="middle" font-family="{MONO}" font-size="16" letter-spacing="5" fill="{PAPER}" opacity=".8">SMALLER, BIGGER, DELETABLE</text></svg>'
cover(SLUG, c)
