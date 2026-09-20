#!/usr/bin/env python3
"""Generates the SVG figures for the ZIP 318 article into public/figures/zip-318-orchard-to-ironwood-migration/.
Shared style: paper surface, ink lines, gold accent. System font stacks only, because the
SVGs are loaded through <img> and cannot see the page's webfonts.
Data figure palette (#c98500, #2a78d6) passes the dataviz validator against the paper surface.
Run: python3 scripts/make-figures-zip-318.py"""
import os
OUT = os.path.join(os.path.dirname(__file__), '..', 'public', 'figures', 'zip-318-orchard-to-ironwood-migration')
os.makedirs(OUT, exist_ok=True)
PAPER, DARK, INK, MUTED, GOLD, GOLDD, BLUE = '#f6f1e7', '#ebe3d2', '#16150f', '#6a665a', '#f4b728', '#c98500', '#2a78d6'
MONO = "ui-monospace, 'SF Mono', Menlo, Consolas, monospace"
SERIF = "Georgia, 'Times New Roman', serif"

def svg(w, h, body, title, desc):
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}" role="img" aria-labelledby="t d">
<title id="t">{title}</title><desc id="d">{desc}</desc>
<defs><marker id="arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="{INK}"/></marker></defs>
<rect width="{w}" height="{h}" fill="{PAPER}"/>
<style>.m{{font-family:{MONO};font-size:13.5px;fill:{MUTED};letter-spacing:.05em}}.mi{{font-family:{MONO};font-size:14.5px;fill:{INK}}}.sb{{font-family:{SERIF};font-size:20px;font-weight:700;fill:{INK}}}.sm{{font-family:{SERIF};font-size:16.5px;fill:{INK}}}</style>
{body}</svg>'''

def write(name, s):
    open(os.path.join(OUT, name), 'w').write(s)
    print(name, len(s))

# FIG 1: timeline
b = f'<text x="40" y="42" class="m">FIG. 1 / FROM BUG REPORT TO IRONWOOD, 2026</text><line x1="60" y1="150" x2="900" y2="150" stroke="{INK}" stroke-width="2"/>'
events = [(110, '29 MAY', 'Flaw reported', 'Taylor Hornby reports a', 'soundness bug in Orchard'),
          (345, 'BLOCK 3,363,426', 'Orchard switched off', 'Emergency soft fork', 'bans Orchard actions'),
          (580, '3 JUNE · 3,364,600', 'NU6.2', 'Orchard back on with', 'a corrected circuit'),
          (815, '28 JULY · 3,428,143', 'NU6.3', 'Ironwood opens,', 'Orchard is sealed')]
for i, (x, when, head, l1, l2) in enumerate(events):
    fill = GOLD if i == 3 else PAPER
    b += (f'<circle cx="{x}" cy="150" r="9" fill="{fill}" stroke="{INK}" stroke-width="2"/>'
          f'<text x="{x}" y="116" class="m" text-anchor="middle">{when}</text>'
          f'<text x="{x}" y="194" class="sb" text-anchor="middle">{head}</text>'
          f'<text x="{x}" y="220" class="sm" text-anchor="middle">{l1}</text><text x="{x}" y="242" class="sm" text-anchor="middle">{l2}</text>')
write('fig-1-timeline.svg', svg(960, 275, b, 'Timeline from the Orchard bug report to Ironwood',
      '29 May 2026 flaw reported; block 3,363,426 Orchard switched off; 3 June NU6.2 corrected circuit; 28 July NU6.3 opens Ironwood and seals Orchard.'))

# FIG 2: turnstile
def pool(x, name, tag):
    return (f'<rect x="{x}" y="80" width="300" height="210" fill="{DARK}" stroke="{INK}" stroke-width="2"/>'
            f'<text x="{x+150}" y="116" class="sb" text-anchor="middle">{name}</text><text x="{x+150}" y="140" class="m" text-anchor="middle">{tag}</text>'
            f'<text x="{x+150}" y="188" class="sm" text-anchor="middle">amounts hidden</text><text x="{x+150}" y="214" class="sm" text-anchor="middle">senders hidden</text><text x="{x+150}" y="240" class="sm" text-anchor="middle">receivers hidden</text>')
b = (f'<text x="40" y="42" class="m">FIG. 2 / WHAT THE CHAIN SEES AT A TURNSTILE</text>' + pool(50, 'Orchard pool', 'SEALED BY NU6.3') + pool(610, 'Ironwood pool', 'NEW IN NU6.3') +
     f'<line x1="350" y1="185" x2="606" y2="185" stroke="{INK}" stroke-width="2" marker-end="url(#arr)"/>'
     f'<rect x="395" y="143" width="170" height="84" fill="{GOLD}" stroke="{INK}" stroke-width="2"/><text x="480" y="174" class="m" text-anchor="middle" style="fill:{INK}">PUBLIC</text><text x="480" y="204" class="sb" text-anchor="middle">20 ZEC</text>'
     f'<text x="480" y="258" class="sm" text-anchor="middle">the crossing amount</text><text x="480" y="280" class="sm" text-anchor="middle">is visible to everyone</text>'
     f'<text x="480" y="336" class="sm" text-anchor="middle">Nodes count what enters and leaves each pool. Orchard can never pay out more than it took in.</text>')
write('fig-2-turnstile.svg', svg(960, 362, b, 'The turnstile between the Orchard and Ironwood pools',
      'Inside each pool amounts, senders and receivers are hidden. The amount crossing between pools is public, which lets nodes count the supply.'))

# FIG 3: naive vs ZIP 318
b = (f'<text x="40" y="42" class="m">FIG. 3 / THE SAME 123.45 ZEC, CROSSING TWO WAYS</text>'
     f'<text x="40" y="92" class="sb">Naive</text><text x="40" y="116" class="sm">one transfer, one block</text>'
     f'<line x1="250" y1="104" x2="920" y2="104" stroke="{INK}" stroke-width="1.5"/><rect x="300" y="80" width="150" height="48" fill="{BLUE}"/><text x="375" y="110" class="mi" text-anchor="middle" style="fill:#fff">123.45 ZEC</text>'
     f'<text x="468" y="96" class="sm">the whole balance,</text><text x="468" y="118" class="sm">published at once</text>'
     f'<text x="40" y="196" class="sb">ZIP 318</text><text x="40" y="220" class="sm">seven standard amounts,</text><text x="40" y="242" class="sm">random gaps, over hours</text>'
     f'<line x1="250" y1="212" x2="920" y2="212" stroke="{INK}" stroke-width="1.5"/>')
for x, v in [(265, '2'), (345, '0.2'), (460, '100'), (530, '0.05'), (650, '20'), (750, '1'), (858, '0.2')]:
    b += f'<rect x="{x}" y="192" width="58" height="40" fill="{GOLD}" stroke="{INK}" stroke-width="1.5"/><text x="{x+29}" y="218" class="mi" text-anchor="middle">{v}</text>'
b += f'<text x="250" y="272" class="m">TIME →</text><text x="920" y="272" class="m" text-anchor="end">EACH AMOUNT MATCHES TRANSFERS FROM OTHER WALLETS</text>'
write('fig-3-naive-vs-zip318.svg', svg(960, 298, b, 'A naive migration compared with a ZIP 318 migration',
      'A naive migration publishes 123.45 ZEC in one transfer. ZIP 318 sends seven standard amounts in shuffled order at random intervals.'))

# FIG 4: two phases
b = (f'<text x="40" y="42" class="m">FIG. 4 / THE TWO PHASES OF A ZIP 318 MIGRATION</text>'
     f'<rect x="40" y="70" width="410" height="262" fill="none" stroke="{INK}" stroke-width="2"/><text x="60" y="102" class="m">PHASE 1 · FULLY SHIELDED</text><text x="60" y="134" class="sb">Note preparation</text>'
     f'<text x="60" y="170" class="sm">1. Pick the standard amounts</text><text x="60" y="198" class="sm">2. Send-to-self inside Orchard so one</text><text x="82" y="220" class="sm">note exists per amount (plus its fee)</text>'
     f'<text x="60" y="248" class="sm">3. 16 actions per transaction,</text><text x="82" y="270" class="sm">spaced about 20 minutes apart</text><text x="60" y="310" class="m">ONLY TIMING AND SIZE ARE VISIBLE</text>'
     f'<line x1="450" y1="200" x2="506" y2="200" stroke="{INK}" stroke-width="2" marker-end="url(#arr)"/>'
     f'<rect x="510" y="70" width="410" height="262" fill="{DARK}" stroke="{INK}" stroke-width="2"/><text x="530" y="102" class="m">PHASE 2 · AMOUNTS PUBLIC</text><text x="530" y="134" class="sb">Scheduled transfers</text>'
     f'<text x="530" y="170" class="sm">1. Sign every transfer once, up front</text><text x="530" y="198" class="sm">2. Shuffle, then space them with random</text><text x="552" y="220" class="sm">gaps averaging 66 blocks</text>'
     f'<text x="530" y="248" class="sm">3. Background tasks refresh the shared anchor,</text><text x="552" y="270" class="sm">then, in a later window, broadcast one</text><text x="530" y="310" class="m">NEVER SYNC AND BROADCAST TOGETHER</text>')
write('fig-4-two-phases.svg', svg(960, 358, b, 'The two phases of a ZIP 318 migration',
      'Phase 1 prepares exact-value notes privately inside Orchard. Phase 2 pre-signs the transfers and broadcasts them one at a time on a random schedule.'))

# FIG 5: quantization
b = f'<text x="40" y="42" class="m">FIG. 5 / CANONICAL QUANTIZATION: EACH DIGIT BECOMES 5s, 2s AND 1s</text>'
for x, d, place, outs in [(110, '1', 'hundreds', ['100']), (290, '2', 'tens', ['20']), (470, '3', 'ones', ['2', '1']), (650, '4', 'tenths', ['0.2', '0.2']), (830, '5', 'hundredths', ['0.05'])]:
    b += (f'<text x="{x}" y="108" text-anchor="middle" style="font-family:{SERIF};font-size:48px;font-weight:700;fill:{INK}">{d}</text>'
          f'<text x="{x}" y="136" class="m" text-anchor="middle">{place.upper()}</text><line x1="{x}" y1="148" x2="{x}" y2="178" stroke="{INK}" stroke-width="1.5" marker-end="url(#arr)"/>')
    for j, o in enumerate(outs):
        ox = x - (len(outs) - 1) * 40 + j * 80
        b += f'<rect x="{ox-36}" y="186" width="72" height="42" fill="{GOLD}" stroke="{INK}" stroke-width="1.5"/><text x="{ox}" y="213" class="mi" text-anchor="middle">{o}</text>'
b += f'<text x="560" y="108" text-anchor="middle" style="font-family:{SERIF};font-size:48px;font-weight:700;fill:{INK}">.</text>'
b += f'<text x="480" y="270" class="sm" text-anchor="middle">123.45 ZEC becomes seven transfers. Anything below 0.01 ZEC stays behind in Orchard as the residual.</text>'
write('fig-5-quantization.svg', svg(960, 298, b, 'How 123.45 ZEC is broken into standard denominations',
      '1 hundred becomes 100; 2 tens become 20; 3 ones become 2 and 1; 4 tenths become 0.2 and 0.2; 5 hundredths become 0.05.'))

# FIG 6: canonical transaction
b = (f'<text x="40" y="42" class="m">FIG. 6 / THE CANONICAL MIGRATION TRANSACTION</text>'
     f'<rect x="40" y="66" width="880" height="236" fill="none" stroke="{INK}" stroke-width="2"/><text x="60" y="96" class="m">ONE TRANSACTION · FEE 15,000 ZATOSHIS · NO TRANSPARENT PARTS · LOCK_TIME 0</text>'
     f'<rect x="60" y="116" width="480" height="166" fill="{DARK}" stroke="{INK}" stroke-width="1.5"/><text x="80" y="144" class="m">ORCHARD BUNDLE · EXACTLY 2 ACTIONS</text>'
     f'<rect x="80" y="160" width="210" height="100" fill="{PAPER}" stroke="{INK}" stroke-width="1.5"/><text x="185" y="202" class="sb" text-anchor="middle">Spend</text><text x="185" y="230" class="sm" text-anchor="middle">one funding note</text>'
     f'<rect x="310" y="160" width="210" height="100" fill="{PAPER}" stroke="{INK}" stroke-width="1.5" stroke-dasharray="6 5"/><text x="415" y="202" class="sb" text-anchor="middle">Output</text><text x="415" y="230" class="sm" text-anchor="middle">change, or a dummy?</text>'
     f'<line x1="540" y1="200" x2="616" y2="200" stroke="{INK}" stroke-width="2" marker-end="url(#arr)"/><text x="578" y="186" class="m" text-anchor="middle">PUBLIC</text>'
     f'<rect x="620" y="116" width="280" height="166" fill="{GOLD}" stroke="{INK}" stroke-width="1.5"/><text x="640" y="144" class="m" style="fill:{INK}">IRONWOOD BUNDLE · 1 ACTION</text>'
     f'<rect x="640" y="160" width="240" height="100" fill="{PAPER}" stroke="{INK}" stroke-width="1.5"/><text x="760" y="202" class="sb" text-anchor="middle">Output</text><text x="760" y="230" class="sm" text-anchor="middle">one standard amount</text>'
     f'<text x="480" y="336" class="sm" text-anchor="middle">Nobody can tell whether the dashed output carries change. The Ironwood side is left unpadded on purpose.</text>')
write('fig-6-canonical-transaction.svg', svg(960, 362, b, 'The canonical migration transaction',
      'An Orchard bundle padded to exactly two actions, one spend and one output that may be change or a dummy, and an Ironwood bundle with a single action carrying one standard amount.'))

# FIG 7: anchor selection
b = (f'<text x="40" y="42" class="m">FIG. 7 / CHOOSING AN ANCHOR FROM SHARED BOUNDARIES (ONE EVERY 144 BLOCKS, ABOUT 3 HOURS)</text>'
     f'<line x1="60" y1="220" x2="920" y2="220" stroke="{INK}" stroke-width="2" marker-end="url(#arr)"/>')
for x, lab, p, hh in [(120, 'age 5', None, 0), (270, 'age 4', '6.7%', 14), (420, 'age 3', '13.3%', 28), (570, 'age 2', '26.7%', 56), (720, 'age 1', '53.3%', 112), (870, 'newest', None, 0)]:
    b += f'<line x1="{x}" y1="212" x2="{x}" y2="228" stroke="{INK}" stroke-width="2"/><text x="{x}" y="256" class="m" text-anchor="middle">{lab.upper()}</text>'
    if hh:
        b += f'<rect x="{x-28}" y="{210-hh}" width="56" height="{hh}" fill="{GOLD}" stroke="{INK}" stroke-width="1.5"/><text x="{x}" y="{200-hh}" class="mi" text-anchor="middle">{p}</text>'
b += (f'<text x="120" y="180" class="sm" text-anchor="middle">beyond the cap,</text><text x="120" y="202" class="sm" text-anchor="middle">never used</text>'
      f'<text x="870" y="180" class="sm" text-anchor="middle">excluded,</text><text x="870" y="202" class="sm" text-anchor="middle">never used</text>'
      f'<text x="480" y="298" class="sm" text-anchor="middle">Age is drawn from a geometric distribution (p = 1/2) and redrawn above the cap of 4. Bars show the odds.</text>')
write('fig-7-anchor-buckets.svg', svg(960, 324, b, 'How a wallet picks a shared anchor boundary',
      'The newest boundary is never used. Ages one to four are chosen with odds of about 53, 27, 13 and 7 percent. Older boundaries are never used.'))

# FIG 8: sync vs broadcast
b = f'<text x="40" y="42" class="m">FIG. 8 / A BACKGROUND WINDOW DOES ONE JOB, NEVER BOTH</text><line x1="60" y1="156" x2="900" y2="156" stroke="{INK}" stroke-width="2"/><text x="900" y="262" class="m" text-anchor="end">TIME →</text>'
for x, kind, l1, l2, fill in [(80, 'SYNC', 'update anchors', 'and proofs', PAPER), (295, 'BROADCAST', 'send one', 'transfer', GOLD), (510, 'SYNC', 'update anchors', 'and proofs', PAPER), (725, 'BROADCAST', 'send one', 'transfer', GOLD)]:
    b += (f'<rect x="{x}" y="92" width="160" height="128" fill="{fill}" stroke="{INK}" stroke-width="2"/><text x="{x+80}" y="126" class="m" text-anchor="middle" style="fill:{INK}">{kind}</text>'
          f'<text x="{x+80}" y="164" class="sm" text-anchor="middle">{l1}</text><text x="{x+80}" y="188" class="sm" text-anchor="middle">{l2}</text>')
b += f'<text x="480" y="300" class="sm" text-anchor="middle">If both happened in one session, the light wallet server could pair the sync with the transaction.</text>'
write('fig-8-sync-vs-broadcast.svg', svg(960, 326, b, 'Sync and broadcast happen in separate background windows',
      'Background windows alternate between syncing and broadcasting so that a server cannot pair a wallet sync with a migration transaction.'))

# FIG 9: migration progress (data figure: one stacked bar, direct labels, 2px surface gap, 4px rounded ends)
mig, rem = 3223058, 410124
W = 840; mw = round(W * mig / (mig + rem)); rw = W - mw - 2
b = (f'<text x="40" y="42" class="m">FIG. 9 / HOW MUCH OF ORCHARD HAS CROSSED (CIPHERSCAN, 20 SEPT 2026)</text>'
     f'<text x="60" y="92" class="sb">3,223,058 ZEC migrated to Ironwood</text><text x="900" y="92" class="sb" text-anchor="end">410,124 ZEC still in Orchard</text>'
     f'<rect x="60" y="108" width="{mw}" height="46" rx="4" fill="{GOLDD}"/><rect x="{60+mw+2}" y="108" width="{rw}" height="46" rx="4" fill="{BLUE}"/>'
     f'<text x="60" y="182" class="m">88.7% OF THE ORCHARD SUPPLY</text><text x="900" y="182" class="m" text-anchor="end">11.3%</text>')
write('fig-9-migration-progress.svg', svg(960, 210, b, 'Share of the Orchard supply that has migrated to Ironwood',
      '3,223,058 ZEC, 88.7 percent of the Orchard supply, has migrated to Ironwood. 410,124 ZEC, 11.3 percent, remains in Orchard. Source CipherScan, 20 September 2026.'))
