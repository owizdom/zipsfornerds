#!/usr/bin/env python3
"""Figures for ZIPs For Nerds #3 (ZIP 218). Run: python3 scripts/figures/zip-218.py"""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from style import *

SLUG = 'zip-218-25-second-block-target-spacing'

# FIG 1 — latency
b = label(40, 42, 'FIG. 1 / THE SAME 75 SECONDS, BEFORE AND AFTER', 'm', 'start')
b += label(60, 96, 'Today', 'sb', 'start') + label(60, 120, '75-second target', 'xs', 'start')
b += f'<line x1="250" y1="110" x2="910" y2="110" stroke="{INK}" stroke-width="1.5"/>'
b += f'<rect x="250" y="88" width="46" height="44" fill="{BLUE}"/><text x="273" y="117" class="mi" text-anchor="middle" fill="#ffffff">1</text>'
b += label(320, 105, 'one block. You wait the full 75 seconds', 'sm', 'start') + label(320, 127, 'for a first confirmation, busy or idle.', 'sm', 'start')
b += label(60, 208, 'NU7', 'sb', 'start') + label(60, 232, '25-second target', 'xs', 'start')
b += f'<line x1="250" y1="222" x2="910" y2="222" stroke="{INK}" stroke-width="1.5"/>'
for i in range(3):
    x = 250 + i*70
    b += f'<rect x="{x}" y="200" width="46" height="44" fill="{GOLD}" stroke="{INK}" stroke-width="1.5"/><text x="{x+23}" y="229" class="mi" text-anchor="middle">{i+1}</text>'
b += label(480, 217, 'three blocks in the same window', 'sm', 'start') + label(480, 239, 'first confirmation after 25 seconds', 'sm', 'start')
b += label(250, 290, '0s', 'm', 'start') + label(910, 290, '75s', 'm', 'end')
b += label(480, 334, 'ZIP 218: "The user-latency goes down 3x."', 'sm')
write(SLUG, 'fig-1-latency.svg', svg(960, 358, b, 'One block in 75 seconds today, three blocks in the same time after the change',
    'Today a first confirmation takes 75 seconds. At a 25-second target, three blocks arrive in that window and the first confirmation comes after 25 seconds.'))

# FIG 2 — action limits: two bars moving in opposite directions
b = label(40, 42, 'FIG. 2 / WHAT THE ACTION LIMITS DO (FIGURES FROM ZIP 218)', 'm', 'start')
b += label(60, 96, 'Orchard throughput', 'sb', 'start') + label(60, 120, 'ordinary capacity, higher is better', 'xs', 'start')
b += f'<rect x="440" y="80" width="{int(2.9/6.6*300)}" height="34" rx="4" fill="{MUTED}"/>' + label(452, 103, '2.9 TPS', 'mi', 'start')
b += f'<rect x="440" y="124" width="300" height="34" rx="4" fill="{GOLDD}"/>' + label(452, 147, '6.6 TPS', 'mi', 'start').replace('class="mi"','class="mi" fill="#ffffff"')
b += label(760, 103, 'now', 'm', 'start') + label(760, 147, 'NU7', 'm', 'start')
b += f'<line x1="60" y1="190" x2="900" y2="190" stroke="{MUTED}" stroke-width="1" stroke-dasharray="4 5"/>'
b += label(60, 234, 'Worst-case light client sync', 'sb', 'start') + label(60, 258, 'under attempted DoS, lower is better', 'xs', 'start')
b += f'<rect x="440" y="218" width="300" height="34" rx="4" fill="{MUTED}"/>' + label(452, 241, '271 MB/day', 'mi', 'start')
b += f'<rect x="440" y="262" width="{int(169/271*300)}" height="34" rx="4" fill="{BLUE}"/>' + label(452, 285, '169 MB/day', 'mi', 'start').replace('class="mi"','class="mi" fill="#ffffff"')
b += label(760, 241, 'now', 'm', 'start') + label(760, 285, 'NU7, down 37%', 'm', 'start')
b += label(480, 344, 'Ordinary capacity more than doubles while the attacker ceiling falls. They are different quantities.', 'sm')
write(SLUG, 'fig-2-action-limits.svg', svg(960, 368, b, 'Throughput rises while worst-case sync burden falls',
    'Orchard throughput rises from 2.9 to 6.6 transactions per second while the maximum shielded sync bandwidth for light clients falls from 271 to 169 MB per day, a 37 percent reduction.'))

# FIG 3 — issuance unchanged
b = label(40, 42, 'FIG. 3 / THE SAME ZEC PER DAY, CUT INTO MORE PIECES', 'm', 'start')
b += label(60, 100, 'Today', 'sb', 'start')
for i in range(4):
    b += f'<rect x="{250+i*165}" y="78" width="120" height="56" fill="{MUTED}" rx="3"/><text x="{310+i*165}" y="113" class="mi" text-anchor="middle" fill="#ffffff">R</text>'
b += label(60, 208, 'NU7', 'sb', 'start')
for i in range(12):
    b += f'<rect x="{250+i*55}" y="186" width="40" height="56" fill="{GOLD}" stroke="{INK}" stroke-width="1.2" rx="3"/><text x="{270+i*55}" y="221" class="mi" text-anchor="middle">⅓</text>'
b += f'<line x1="250" y1="272" x2="910" y2="272" stroke="{INK}" stroke-width="2"/>'
b += label(580, 300, 'one day', 'm')
b += label(480, 348, 'Three times the blocks, one third of the reward each. Daily issuance is unchanged; the halving interval triples to 5,040,000 blocks.', 'sm')
write(SLUG, 'fig-3-issuance.svg', svg(960, 372, b, 'Daily ZEC issuance is unchanged, split across three times as many blocks',
    'The same total ZEC is issued each day. With three times as many blocks, each block reward is one third the size. The halving interval is tripled in blocks so halvings stay four years apart.'))

# COVER
c = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" role="img" aria-label="One wide block above, three narrow blocks below, spanning the same width">
<rect width="800" height="600" fill="{INK}"/>
<text x="400" y="128" text-anchor="middle" font-family="{MONO}" font-size="15" letter-spacing="5" fill="{PAPER}" opacity=".55">75 SECONDS</text>
<rect x="130" y="168" width="540" height="96" fill="{MUTED}"/>
<text x="400" y="330" text-anchor="middle" font-family="{MONO}" font-size="15" letter-spacing="5" fill="{PAPER}" opacity=".55">25 SECONDS</text>'''
for i in range(3):
    c += f'<rect x="{130+i*186}" y="368" width="168" height="96" fill="{GOLD}"/>'
c += f'<text x="400" y="546" text-anchor="middle" font-family="{MONO}" font-size="16" letter-spacing="5" fill="{PAPER}" opacity=".8">THREE TIMES THE BLOCKS</text></svg>'
cover(SLUG, c)
