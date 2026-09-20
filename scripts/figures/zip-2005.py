#!/usr/bin/env python3
"""Figures for ZIPs For Nerds #2 (ZIP 2005). Run: python3 scripts/figures/zip-2005.py"""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from style import *

SLUG = 'zip-2005-ironwood-quantum-recoverability'

# FIG 1 — one assumption under everything
b = label(40, 42, 'FIG. 1 / WHAT RESTS ON THE DISCRETE LOGARITHM PROBLEM', 'm', 'start')
for i, (x, t, s) in enumerate([(70, 'Proofs', 'that a note exists'), (365, 'Commitments', 'that a note is what it says'), (660, 'Nullifiers', 'that it is not double spent')]):
    b += box(x, 80, 230, 92) + label(x+115, 118, t, 'sb') + label(x+115, 146, s, 'xs')
    b += f'<line x1="{x+115}" y1="172" x2="{x+115}" y2="222" stroke="{INK}" stroke-width="2"/>'
b += box(70, 224, 820, 74, DARK) + label(480, 258, 'The discrete logarithm problem', 'sb') + label(480, 282, 'hard for classical computers, tractable for a large quantum computer', 'xs')
b += label(480, 342, 'One break undermines all three at once. ZIP 2005: a single discrete logarithm is sufficient.', 'sm')
write(SLUG, 'fig-1-foundation.svg', svg(960, 366, b, 'Proofs, commitments and nullifiers all rest on the discrete logarithm problem',
    'Three parts of a shielded transaction, proofs, note commitments and nullifiers, all depend on the same hardness assumption, so one break affects all of them.'))

# FIG 2 — why a later upgrade does not fix it
b = label(40, 42, 'FIG. 2 / WHY SWAPPING THE PROOF SYSTEM LATER DOES NOT WORK', 'm', 'start')
b += box(60, 78, 380, 66, DARK) + label(250, 110, 'New post-quantum proof system', 'sb') + label(250, 132, 'believed secure', 'xs')
b += box(60, 158, 380, 66, DARK) + label(250, 190, 'Commitment tree rebuilt', 'sb') + label(250, 212, 'with a quantum-resistant hash', 'xs')
b += box(60, 238, 380, 76, PAPER, dash=True) + label(250, 270, 'Old note commitments', 'sb') + label(250, 294, 'already on chain, already forgeable', 'xs')
b += cross(250, 340) + label(250, 378, 'Balance breaks here', 'sm')
b += f'<line x1="470" y1="90" x2="470" y2="355" stroke="{MUTED}" stroke-width="1.5" stroke-dasharray="4 5"/>'
b += label(510, 112, 'Replaced', 'm', 'start') + label(510, 192, 'Replaced', 'm', 'start') + label(510, 272, 'CANNOT BE REPLACED', 'm', 'start')
b += label(510, 300, 'The commitments are historical', 'xs', 'start') + label(510, 322, 'facts. Nothing re-binds them.', 'xs', 'start')
b += label(510, 366, 'An adversary can forge and spend notes', 'sm', 'start') + label(510, 388, 'that were never in the tree.', 'sm', 'start')
write(SLUG, 'fig-2-why-upgrade-fails.svg', svg(960, 412, b, 'Upgrading the proof system does not repair old commitments',
    'A new proof system and a rebuilt tree replace the upper layers, but note commitments already recorded on chain remain forgeable, which breaks the Balance property.'))

# FIG 3 — the two halves
b = label(40, 42, 'FIG. 3 / TWO HALVES OF ZIP 2005', 'm', 'start')
b += box(50, 80, 400, 210, DARK) + label(250, 114, 'SHIPPED WITH NU6.3', 'm') + label(250, 150, 'The note change', 'sb')
b += label(250, 186, 'Ironwood notes are derived so that', 'sm') + label(250, 210, 'a future protocol can verify them', 'sm') + label(250, 234, 'without discrete logarithms', 'sm')
b += tick(250, 266)
b += arrow(455, 185, 505, 185)
b += box(510, 80, 400, 210, PAPER, dash=True) + label(710, 114, 'NOT YET DESIGNED', 'm') + label(710, 150, 'The Recovery Protocol', 'sb')
b += label(710, 186, 'Would actually get your funds out', 'sm') + label(710, 210, 'if the old protocols are disabled.', 'sm') + label(710, 234, '"Described in outline but not in detail"', 'xs')
b += cross(710, 266)
b += label(480, 332, 'What exists today is a precondition, not a defence.', 'sm')
write(SLUG, 'fig-3-two-halves.svg', svg(960, 358, b, 'The shipped note change and the undesigned Recovery Protocol',
    'ZIP 2005 has two halves: a note derivation change that shipped with NU6.3, and a Recovery Protocol that is only described in outline.'))

# FIG 4 — recoverable or not (old pools on the left, so the arrow runs the way funds actually move)
b = label(40, 42, 'FIG. 4 / WHICH FUNDS COULD BE RECOVERED', 'm', 'start')
b += box(60, 86, 380, 250, DARK) + label(250, 124, 'Sprout · Sapling · Orchard', 'sb') + label(250, 150, 'INACCESSIBLE', 'm')
b += label(250, 196, 'Plus transparent balances,', 'sm') + label(250, 222, 'which the ZIP names first among', 'sm') + label(250, 246, 'what wallets should move.', 'sm') + cross(250, 296)
b += box(520, 86, 380, 250, GOLD) + label(710, 124, 'Ironwood', 'sb') + label(710, 150, 'RECOVERABLE', 'm')
b += label(710, 196, 'Notes built the new way.', 'sm') + label(710, 222, 'A future Recovery Protocol', 'sm') + label(710, 246, 'could get these funds out.', 'sm') + tick(710, 296)
b += arrow(445, 210, 512, 210, gold=True) + label(480, 196, 'move', 'm')
b += label(480, 378, 'The ZIP: funds left behind would be "inaccessible after their respective protocols are disabled".', 'sm')
write(SLUG, 'fig-4-recoverable-or-not.svg', svg(960, 402, b, 'Funds move from older pools into Ironwood, where they could be recovered',
    'Funds left in the Sprout, Sapling or Orchard pools would be inaccessible once those protocols are disabled. Transparent balances have no protocol to disable, but the ZIP still tells wallets to move them. Funds in the Ironwood pool could be recovered by a future protocol.'))

# COVER
c = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" role="img" aria-label="A lattice of gold note commitments, most intact, some broken apart">
<rect width="800" height="600" fill="{INK}"/>
<g stroke="{GOLD}" stroke-width="1.5" opacity=".28">'''
for i in range(7):
    for j in range(5):
        c += f'<line x1="{110+i*97}" y1="{110+j*95}" x2="{207+i*97}" y2="{110+j*95}"/><line x1="{110+i*97}" y1="{110+j*95}" x2="{110+i*97}" y2="{205+j*95}"/>'
c += '</g>'
import random
random.seed(2005)
for i in range(7):
    for j in range(5):
        x, y = 110+i*97, 110+j*95
        if (i+j*3) % 7 == 3:
            c += f'<path d="M{x-13} {y-13}L{x+13} {y+13}M{x+13} {y-13}L{x-13} {y+13}" stroke="{PAPER}" stroke-width="3" opacity=".8"/>'
        else:
            c += f'<rect x="{x-11}" y="{y-11}" width="22" height="22" fill="{GOLD}"/>'
c += f'<text x="400" y="556" text-anchor="middle" font-family="{MONO}" font-size="16" letter-spacing="5" fill="{PAPER}" opacity=".8">RECOVERABLE OR NOT</text></svg>'
cover(SLUG, c)
