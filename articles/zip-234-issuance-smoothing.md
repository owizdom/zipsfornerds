---
title: "ZIP 234: Issuance Smoothing"
series_number: 5
subtitle: "The proposal to replace Zcash's halvings with a smooth curve, and the vote that said no."
zip: 234
zip_status: Draft
zip_category: Consensus
spec_url: https://zips.z.cash/zip-0234
tag: NU7 candidate
date: 2026-09-22
status: draft
disclosure: >-
  Researched with AI assistance, working from the ZIP text and the sources listed at
  the end. Every number, quotation and mechanism was checked against those sources in
  two further review passes. Any errors are the author's own.
corrections: []
cover: /covers/zip-234-issuance-smoothing/cover.svg
---

## The short version

This is the ZIP that lost. It is worth reading anyway, and arguably more interesting for it.

- Zcash pays miners a subsidy that halves every four years, a step function inherited from Bitcoin.
- ZIP 234 proposed replacing those steps with a **smooth logarithmic curve**: each block pays a fixed fraction of a quantity called the Money Reserve.
- The fraction is `BLOCK_SUBSIDY_FRACTION = 4126 / 10,000,000,000`, or 0.0000004126, per block.
- It would have kept the 21 million cap and approximated the current issuance over four-year windows.
- Crucially, the curve is what lets ZEC removed under ZIP 233 come back. A fixed halving schedule has no way to reissue anything.
- In the September 2026 coinholder poll, **98.9% of participating ZEC voted to keep the halvings.** Holders also voted to delay reissuing NSM funds until February 2031.
- ZIP 234 remains a Draft and an NU7 candidate.

## Setting the stage: what a halving actually does to a network

Every four years, Zcash's block subsidy is cut in half overnight. It is one of the most recognisable features Bitcoin gave the industry, and culturally it is enormous.

ZIP 234 concedes the cultural point before arguing with it. Halvings, it says, "have since become culturally foundational." Then it makes its case: "abrupt reductions in miner revenue can lead to short-term drops in mining participation, as evidenced by hashrate/difficulty."

And it brings evidence rather than theory. Following the 18 November 2020 halving, the ZIP records that weekly difficulty fell about 20.6% within roughly a week.

That is the mechanism the proposal is aimed at. Miner revenue halves instantly. Some miners become unprofitable instantly. They leave, hash rate drops, and the chain is measurably less expensive to attack until difficulty readjusts and the market recovers. It is a self-inflicted security dip on a published schedule, which means it is also a dip anyone can plan around.

![A halving drops miner revenue in one step; a smooth curve declines continuously](/figures/zip-234-issuance-smoothing/fig-1-step-vs-curve.svg "Figure 1. The same declining issuance, delivered two ways. The step is the thing ZIP 234 objects to.")

## The problem with a fixed schedule

There is a second problem, and for the Network Sustainability Mechanism it is the decisive one.

A halving schedule is a function of block height alone. Height 1 pays this, height 2 million pays that, forever. It cannot respond to anything.

ZIP 233 lets ZEC be removed from circulation, with the intention that it returns through future block subsidies. But a fixed schedule has nowhere to put returning funds. It does not know they exist. As ZIP 234's motivation puts it: the current schedule "does not provide a way to recycle funds removed from circulation via ZIP-233 into future issuance."

So ZIP 234 is not an aesthetic preference for curves over steps. It is the component that closes the loop. Without it, ZIP 233 removes money and nothing brings it back.

The motivation then states the consequence of doing nothing: "Once scheduled issuance ends, the network becomes reliant on transaction fees for the security budget."

## An overview of ZIP 234

ZIP 234 is a Consensus ZIP with status Draft, owned by Jason McGee, Zooko Wilcox, Mark Henderson, Tomek Piotrowski, Mariusz Pilarek and Paul Dann, with Nathan Wilcox as original author.

The proposal replaces the step function with a curve defined as a fixed portion of the **Money Reserve** at a given block height. The Money Reserve is, in effect, the unissued space beneath the cap: what MAX_MONEY permits minus what is currently in circulation.

Each block pays:

> `BLOCK_SUBSIDY_FRACTION = 4126 / 10_000_000_000 = 0.0000004126`

of the Money Reserve.

That single line has some elegant consequences.

**It is self-limiting.** The subsidy is always a fraction of what remains unissued, so issuance approaches the cap and never crosses it. The ZIP retains "the overall supply cap of MAX_MONEY."

**It never quite ends.** A fixed fraction of a shrinking reserve gets smaller forever without reaching zero. There is no terminal block after which miners are paid nothing.

**It reacts to removals automatically.** When ZIP 233 removes ZEC, the Money Reserve grows, so the subsidy grows. That is the reissuance mechanism: not a separate system, just the same formula applied to a larger reserve.

![Each block pays a fixed fraction of the Money Reserve, so removals feed straight back into the subsidy](/figures/zip-234-issuance-smoothing/fig-2-money-reserve.svg "Figure 2. Removing ZEC enlarges the reserve, and the next block's subsidy is computed from the larger number. No separate reissuance machinery is needed.")

The ZIP lists its objectives plainly, and they are unusually legible for an economics proposal: introduce a way for users to contribute to sustainability; enable removed ZEC to be reissued; retain the 21 million cap; keep the issuance rate similar to Zcash's history; make issuance easy to understand and predict; and activate at a block where the change from current issuance is as small as possible.

That last one is a nice piece of engineering judgement. The deployment height is not arbitrary. It is chosen as "the lowest height after the second halving at which the NSM issuance would be less than the current BTC-style issuance," assuming nothing has been removed. In other words, switch over at the moment the curve crosses below the steps, so nobody can claim the change was an inflation increase in disguise.

## How it works

### The calculation

For each block, take the Money Reserve at that height and pay out 0.0000004126 of it. The reserve shrinks as coins are issued, so the per-block subsidy declines smoothly. The result approximates today's issuance over four-year intervals, assuming nothing is removed.

Because the subsidy depends on the reserve rather than on height alone, anything that changes the reserve changes future issuance. Removals raise it. That is the whole design.

### Interaction with the block time change

Worth noting alongside ZIP 218, which we covered last time: if blocks arrive three times more often, a per-block fraction of the reserve would pay out three times as fast. ZIP 218 handles issuance rescaling on its side, keeping daily ZEC constant. Any deployment of both would need those two mechanisms reconciled. Both are NU7 candidates, so this is not hypothetical.

### What holders were actually asked

The September poll did not ask "curve or steps?" as a technical question. It asked whether to keep Bitcoin-style halvings, and separately when NSM-removed funds should begin to be reissued.

The answers: **98.9%** of participating ZEC voted to keep halvings, and **96.6%** voted to wait until **February 2031** before reissuing funds collected through the mechanism. About 2.4 million ZEC took part.

![Coinholders voted to keep halvings and to delay reissuance until February 2031](/figures/zip-234-issuance-smoothing/fig-3-vote.svg "Figure 3. The September 2026 coinholder poll. Percentages are of participating ZEC, with about 2.4 million ZEC voting.")

## Why ZIP 234? The case for a curve instead of halvings

### It removes a scheduled security dip

The strongest argument is the empirical one. A 20.6% weekly difficulty decline after the 2020 halving is a measurable, repeating, pre-announced weakening of the chain. A smooth curve makes miner revenue decline gradually enough that individual operators fall out continuously rather than all at once.

### It is the only part that makes removals reversible

Without ZIP 234, ZIP 233 is a burn mechanism with a sentence of good intentions attached. The curve is what turns removal into a loop. Anyone who supports the Network Sustainability Mechanism in principle has to support something shaped like this ZIP.

### The security budget never hits zero

Bitcoin's design has a date after which miners are paid only by fees. A fixed fraction of a shrinking reserve declines forever without terminating, which converts a cliff into an asymptote. Whether fee-only security would have worked is unknown; this ZIP arranges not to find out.

### The cap survives

This is the part most likely to be misread, so it is worth being blunt: ZIP 234 does not raise the 21 million cap. It retains it. The curve approaches the cap and never crosses it, because the subsidy is always a fraction of what is left.

## Are there any drawbacks to implementing ZIP 234?

### Coinholders rejected it, and that is data

98.9% is not a close vote. Whatever the technical merits, the people who own the asset said no clearly.

The ZIP anticipated part of the reason by conceding that halvings are "culturally foundational." Bitcoin-style scarcity, with its legible four-year rhythm, is a large part of why some people hold ZEC at all. Replacing it with a continuously declining fraction is a worse story even where it is a better mechanism.

I think it is also fair to say the question holders were asked ran together two things: whether the curve is a good idea, and whether halvings should be abolished. Someone could believe the NSM is worth having and still want to keep the halvings. The ballot did not offer that.

### Predictability is genuinely worse

One of the ZIP's stated objectives is that issuance should be "easy for all network users to understand and predict." A halving schedule meets that bar completely: anyone can state next decade's issuance from memory.

A fraction of a reserve that itself depends on how much ZEC people have voluntarily removed is predictable in formula and not in outcome. Miners planning capital expenditure over several years would be forecasting the behaviour of other users. That is a real cost and the ZIP's objective list does not fully acknowledge the tension.

### The reissuance delay hollows out the mechanism

Holders voted to postpone reissuance to February 2031. If ZIP 233 or ZIP 235 ship before then, ZEC would be removed from circulation for several years with no route back.

During that window the Network Sustainability Mechanism is, functionally, a burn. That may be exactly what holders wanted, since removals reduce supply and reissuance increases it. It is worth being clear that it is the opposite of what the three ZIPs were designed to do together.

### One author, three ZIPs, one economic thesis

Jason McGee owns all three NSM ZIPs. Concentrated authorship makes a coherent design and also means one worldview shapes all three documents. ZIP 234 has since gained co-owners including Zooko Wilcox, which broadens it. It is still a single thesis about how chains should be funded, and the vote suggests the thesis is not yet shared by the people paying for it.

## Where this stands

ZIP 234 is a **Draft**, an NU7 candidate, and just lost a coinholder vote on its central premise.

That does not necessarily kill it. The ZIP index notes that no decision has been made on which ZIPs NU7 includes, and votes shape rather than dictate what engineers build. But shipping a smoothed curve after 98.9% of participating ZEC voted to keep halvings would be a difficult position to hold.

The more likely path is that the NSM survives in pieces: removal without smoothing, and reissuance revisited nearer 2031. That would be an odd result for a design whose three parts were meant to work together, and it is the result the votes currently point at.

## Conclusion: ZIP 234 and the story holders chose to keep

ZIP 234 is a careful proposal that lost on the part that was never really technical.

Its mechanism is neat: pay each block a fixed fraction of what is left, and you get smooth decline, a preserved cap, no terminal block, and automatic reissuance of anything removed, all from one constant. Its evidence is concrete, with a 20.6% difficulty drop after a halving. And it is the only component that makes the rest of the Network Sustainability Mechanism a loop instead of a drain.

Against that, halvings are a story people bought into, and the four-year rhythm is legible in a way a fraction of a reserve never will be. 98.9% of participating ZEC chose the story.

The interesting question now is not whether ZIP 234 ships. It is what the other two NSM ZIPs mean without it.


As always, if this was useful, share it with someone who voted in September. This is what was on the other side of the ballot.

Next in the series: ZIP 231, memo bundles, which makes Zcash memos bigger, cheaper and prunable at the same time.

## Sources

- ZIP 234: Network Sustainability Mechanism: Issuance Smoothing. https://zips.z.cash/zip-0234
- ZIP 233: Network Sustainability Mechanism: Removing Funds From Circulation. https://zips.z.cash/zip-0233
- ZIP 235: Remove 60% of Transaction Fees From Circulation. https://zips.z.cash/zip-0235
- ZIP 218: 25-second Block Target Spacing. https://zips.z.cash/zip-0218
- ZIP index, for statuses and the NU7 candidate list. https://zips.z.cash/
- CoinDesk, "Zcash holders overwhelmingly back faster transactions and bitcoin-style halvings," 16 September 2026. https://www.coindesk.com/tech/2026/09/16/zcash-holders-overwhelmingly-back-faster-transactions-and-bitcoin-style-halvings
- Zcash Labs, NU7 coinholder vote page. https://zcashlabs.org/voting
