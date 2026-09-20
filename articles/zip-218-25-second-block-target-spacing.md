---
title: "ZIP 218: 25-second Block Target Spacing"
series_number: 3
subtitle: "Three times as many blocks, a third of the waiting, and a set of limits most of the discussion has ignored."
zip: 218
zip_status: Draft
zip_category: Consensus
spec_url: https://zips.z.cash/zip-0218
tag: NU7 candidate
date: 2026-09-21
status: draft
disclosure: >-
  Researched with AI assistance, working from the ZIP text and the sources listed at
  the end. Every number, quotation and mechanism was checked against those sources in
  two further review passes. Any errors are the author's own.
corrections: []
cover: /covers/zip-218-25-second-block-target-spacing/cover.svg
---

## The short version

This is the ZIP behind the headline everyone saw in September: Zcash blocks are getting faster.

- Today a Zcash block arrives every 75 seconds on average. ZIP 218 cuts that to 25 seconds in NU7.
- That is a straight 3x cut in how long you wait for a first confirmation. The ZIP's framing: "The user-latency goes down 3x."
- It was put to coinholders in the NU7 vote that closed on 14 September 2026, and 99.9% of participating ZEC backed it.
- The part that got almost no coverage is the second half of the proposal: **action limits**, a new cap on how much shielded work fits in a block. Without them, faster blocks would have tripled the ceiling on how much scanning work an attacker can force onto every light wallet.
- With the limits, Orchard throughput for standard two-action transactions goes from 2.9 to 6.6 per second, and the worst-case sync burden on a light client drops from 271 to 169 MB a day.
- The total ZEC issued per day does not change. The per-block reward is divided so the daily rate stays the same.

## Setting the stage: what 75 seconds costs you

Zcash inherited its rhythm from Bitcoin and then sped it up. Bitcoin targets ten minutes; Zcash targets 75 seconds. For a long time that felt fast enough.

The ZIP's motivation is about the people for whom it is not. Its first bullet is blunt: users "must wait 75 seconds on average for even a single confirmation, regardless of network utilization." That last clause matters. This is not congestion. An empty chain makes you wait just as long. It is the design.

Three situations where that hurts, all named in the ZIP:

- **Point-of-sale payments.** Standing at a counter for over a minute before a payment is even one block deep is not a payment experience anyone would choose.
- **Exchange deposits.** Deposits usually need several confirmations, and each one costs 75 seconds.
- **Cross-chain bridges.** The ZIP specifically names actors "who need 1 or 2 conf's," citing Near Intents. A bridge or intent-solver holds risk while it waits, and that risk is priced into what users pay.

So the target is latency, and the ZIP is explicit that this is the *foremost* goal rather than throughput: "The throughput goal on its own could be achieved via a block size increase. However the goal of this proposal is foremost to improve the transaction latency."

That is a useful sentence, because it rules out the obvious alternative. If you only wanted more capacity, you would make blocks bigger. Bigger blocks do nothing for the person waiting at the counter.

![At 75 seconds one confirmation takes 75 seconds; at 25 seconds the same wait yields three blocks](/figures/zip-218-25-second-block-target-spacing/fig-1-latency.svg "Figure 1. The same 75 seconds, before and after. Latency is the thing this ZIP is buying.")

## The problem with simply going faster

Here is the part that turns a one-line change into a real proposal.

A light wallet does not download the whole chain. It downloads compact blocks and performs trial decryption on shielded outputs, testing each one to see whether it belongs to you. That work is proportional to how many shielded outputs exist, not to how many are yours.

Which means an attacker can impose cost on every light wallet in the world by filling blocks with shielded outputs. Nobody has to receive them. The wallet still has to try.

Now triple the number of blocks per day at the same 2 MB block size limit, and you have tripled the ceiling on that attack. Every phone wallet's worst-case daily sync burden goes up threefold. A change sold as a user-experience improvement would have quietly made the worst day much worse.

ZIP 218's answer is **action limits**: caps on how many shielded actions may go into a block, with a global limit across all pools and separate per-pool limits.

The result, in the ZIP's own numbers, is that the configuration "more than double[s] the Orchard TPS (2.9 → 6.6 TPS), while lowering the impact a DoS attacker can impose on wallets; for example, maximum shielded sync bandwidth for light clients is reduced by 37% (271 → 169 MB/day)." Both throughput figures are for standard two-action Orchard transactions.

Read that carefully, because it is doing something slightly surprising. Throughput more than doubles **and** the worst case gets better. Those usually trade against each other. They do not here because the two numbers describe different things: ordinary capacity for real transactions versus the ceiling an attacker can push against. The limits raise the first and lower the second.

![Action limits raise ordinary throughput while lowering the worst-case sync burden](/figures/zip-218-25-second-block-target-spacing/fig-2-action-limits.svg "Figure 2. Orchard throughput up from 2.9 to 6.6 transactions per second; worst-case light client sync down from 271 to 169 MB a day. Figures from ZIP 218.")

The limits fall hardest on the old pools. The ZIP says they "significantly decrease the number of Sprout and Sapling pool outputs available per block, to lower the maximum shielded sync burden under attempted DoS." The ZIP's stated justification is usage rather than cost: "The reduced Sapling and Sprout per-block limits are justified by the current distribution of shielded funds across pools." Orchard holds the overwhelming majority, so cutting the old pools' limits buys worst-case headroom while affecting the fewest people. Per unit they are actually cheaper to scan than Orchard; it is that so many more of them fit in a block that makes them dominate the worst case.

## An overview of ZIP 218

ZIP 218 is a Consensus ZIP with status Draft, owned by **Dev Ojha and Evan Forbes**. It is a candidate for NU7; the ZIP index still notes that no final decision has been made about which ZIPs NU7 includes.

It does three things:

1. **Changes the block target spacing** from 75 seconds to 25.
2. **Introduces action limits**: a global shielded budget of 330, an Orchard limit of 330, a Sapling input/output limit of 300 and a Sprout JoinSplit limit of 25, with Sprout JoinSplits weighted double inside the global budget.
3. **Rescales the block subsidy and the halving interval** so that daily ZEC issuance, and the wall-clock gap between halvings, are unchanged. The schedule itself is rewritten: the ZIP defines `PostNU7HalvingInterval` = 5,040,000 blocks and adds a new case to the halving function.

Point three is the one that stops the obvious objection. Three times as many blocks paying the same reward each would mean three times the inflation. The ZIP is direct: "The emission schedule of mined ZEC will be the same in terms of ZEC/day, but this requires the emission per block to be adjusted to take account of the changed block target spacing."

Miners are not being paid more or less. The same daily issuance is cut into three times as many pieces, and the halving interval is tripled in blocks so that halvings still land four years apart in wall-clock time.

![The same daily ZEC issuance divided into three times as many blocks](/figures/zip-218-25-second-block-target-spacing/fig-3-issuance.svg "Figure 3. Same ZEC per day, smaller reward per block. Halvings still land four years apart in wall-clock time, though the interval in blocks is tripled to 5,040,000.")

## How it works

### The spacing change, and everything measured in blocks

The target spacing becomes 25 seconds. Two related constants move with it: the difficulty averaging window goes from 17 to 102, and the maximum supported reorganisation length goes from 99 to 600 blocks, scaled by six rather than three so the wall-clock window stays about 4.2 hours. The ZIP accepts a consequence of that explicitly, noting that "a supported reorg may invalidate a mature coinbase output."

The consequence that ripples furthest is that many protocol constants are measured in blocks, not time. A constant meaning "about an hour" as a block count now means about twenty minutes. The ZIP handles the ones it owns with a table, but not uniformly: most duration constants are marked "Scale by 3", the reorg length is "Scale by 6", and several are left alone. It is also advice rather than consensus, phrased as implementations "SHOULD scale by NU7PoWTargetSpacingRatio those constants that represent a time duration" and "SHOULD NOT scale those whose semantics are intrinsically measured in blocks."

This is exactly the kind of change that is easy to get right for node software and easy to miss elsewhere. I wrote about one case last time: ZIP 318's migration timings are all expressed in blocks, and I could find no mention of ZIP 318 or wallet migration constants anywhere in ZIP 218. If both ship, a wallet's migration schedule compresses threefold unless someone rescales it deliberately.

### Confirmations and rollback risk

If blocks arrive three times faster, is one confirmation worth a third as much?

The ZIP's answer depends on the threat model, and it says so: "Rollback-risk analysis depends on the threat model. For models that bound an attacker by a fixed fraction of total hash power, reducing the block target spacing can reduce confirmation latency by nearly the same factor, provided that block validation and propagation remain small relative to the target spacing." It then states its conclusion: the proposal "is expected to improve confirmation latency by slightly less than 3x for users applying the same rollback-risk tolerance as today."

That proviso about validation and propagation is not a throwaway. It is the condition the stale-rate experiment exists to establish.

The argument is that if you model an attacker as controlling some percentage of hash power, then the security of a confirmation comes from the *proportion* of work done, not the wall-clock time it took. Three faster blocks represent a similar share of total work as one slow block did.

That holds for a proportional-hash-power model. The ZIP supplies its own counter-case rather than leaving it to the reader: under economic rollback models, shorter block times "significantly reduce the variance of their waiting time, while the mean stays roughly the same." So the gain is real but differently shaped depending on what you think an attacker is.

### It does not compete with finality

Zcash has a separate line of work on finality, Crosslink. Faster blocks and a finality gadget are sometimes presented as alternatives. The ZIP rejects that framing: the proposal "is complementary to, and does not compete with, finality mechanisms such as Crosslink. Faster block times improve the responsiveness of the base layer regardless of whether an additional finality gadget is also deployed."

### The longer-term argument

There is a second motivation that is easy to miss and may matter more than the first. Faster blocks raise consensus bandwidth, and the ZIP says this "amplifies the scaling impact of a future shielded pool which does not require shielded sync."

Today, throughput is limited by what light wallets can afford to scan. A future pool without the shielded sync burden removes that constraint, and at that point the extra block bandwidth converts directly into throughput: "Longer term, when we get a shielded pool with no shielded sync burden, we will have 3x higher throughput."

So part of this ZIP is groundwork. It is buying capacity that cannot be fully spent yet.

## Why ZIP 218? The case for 25-second blocks and action limits

### The problem it solves is felt by everyone

Most protocol changes are invisible to ordinary users. This one is not. Every payment, every deposit, every bridge operation gets faster on day one. That rarity is worth noting: proposals that improve the common case usually involve trade-offs users also feel, and this one mostly does not.

### It pairs the change with its own mitigation

The easy version of this proposal is a one-line constant change, shipped as a UX win, with the DoS consequences left for someone else. The ZIP does not do that. It brings the action limits in the same document and quantifies the result.

Including the mitigation in the same proposal is what makes the throughput and safety numbers move in the same direction instead of against each other.

### The numbers are specific and checkable

2.9 to 6.6 transactions per second for two-action transactions. 271 to 169 MB a day. An implementer can test against these rather than against a vibe, and the stale-rate section goes further by reporting a measurement from a 99-node experiment. Proposals that offer round, unfalsifiable claims are harder to evaluate and easier to get wrong. (One pedantic note: 169/271 is a 37.6% reduction, so the ZIP's "37%" is rounded down.)

## Are there any drawbacks to implementing ZIP 218?

### Constants measured in blocks, spread across an ecosystem

The ZIP rescales the node constants it owns. It does not, and arguably cannot, rescale every block-denominated constant in every wallet, SDK, exchange integration and bridge.

ZIP 318 is the example I have checked, and it is unlikely to be the only one. A wallet whose "wait about an hour" is a block count will silently start waiting twenty minutes. A bridge requiring N confirmations will accept transactions on a third of the previous work unless it revisits N. None of these break loudly. They just quietly mean something different.

This is my own concern rather than something the ZIP raises, and I would like to be wrong about its scale.

### Three times the block headers, forever

Headers go from 1,152 to 3,456 a day. The ZIP does cost this on the wallet side, noting a 90-byte compact block header leads to "an extra 200kb of wallet bandwidth per day in exchange for the improved UX", and its table shows 0.10 MB to 0.31 MB a day.

What I could not find is the node-side storage figure. Header growth is small next to block data, but it is permanent and it compounds, and for a chain meant to run for decades that seems worth a line.

### More orphaned blocks, and the ZIP has measured them

Shorter spacing means a higher proportion of blocks are found while another is still propagating. Those blocks are wasted work, and the cost falls hardest on miners with worse connectivity, which pushes gently towards centralisation.

The ZIP has a section on this and it is one of the more convincing parts of the document. Today the stale rate is 0.4%. At 25 seconds the theoretical rate is "approximately 3.26%, derived from measured Zcash network propagation delays". They also ran it: "A devnet experiment with 99 geographically-distributed Zebra nodes producing 2MB blocks at 25-second target spacing measured a stale block rate of 4.86% and a fork rate of 0.37%. Both observed figures are below the 5.4% safety threshold set by Ethereum's historical proof-of-work stale rate."

So the orphan rate roughly tens-fold increases, from 0.4% to somewhere near 3% to 5%, and the ZIP's argument is that this remains inside a threshold the industry has already lived with. That is a real answer backed by an experiment. Whether a smaller miner finds 4.86% acceptable is a different question, and the distributional effect is the part I would still want discussed.

### The old pools take the squeeze

The action limits work partly by cutting how many Sprout and Sapling outputs fit in a block. That is defensible: those pools hold a small fraction of shielded funds. But it does mean holders still using them get a degraded service as a side effect of a change sold on latency.

Given the direction of travel, with Orchard sealed and Ironwood the destination, this looks intentional rather than accidental. It is still worth naming, because "your transactions became harder to fit into a block" is not something anyone was told they were voting on.

### The vote was not a deployment decision

99.9% of participating ZEC backed 25-second blocks, out of about 2.4 million ZEC that took part. That is a strong signal. It is not the same as shipping: the ZIP index still says of the NU7 candidates that "no decision has been made on whether to include each of these ZIPs," and the coinholder poll also backed shipping NU7 with whatever is ready by a 30 September readiness deadline.

So the honest status is: strongly endorsed, still a Draft, not yet confirmed in the upgrade.

## Where this stands

ZIP 218 is a Draft, listed as an NU7 candidate. Coinholders endorsed the block-time change in the poll that closed on 14 September 2026 with 99.9% of participating ZEC in favour.

What to watch is the NU7 deployment ZIP, which is what actually fixes the contents of the upgrade. Until that names ZIP 218, the change is likely rather than certain.

If you build anything that counts blocks, this is the moment to go and look at your constants.

## Conclusion: ZIP 218 and the constants nobody rescaled

ZIP 218 is two proposals wearing one number. The famous one cuts the block target from 75 seconds to 25 and takes a third off every confirmation wait. The quiet one caps shielded actions per block, and without it the famous one would have tripled the cost an attacker can impose on every light wallet.

That pairing is the thing worth remembering. The 3x is what got voted on and what will get reported. The action limits are what make the 3x safe, and they are the reason throughput can more than double while the worst case gets better at the same time.

The open question is not whether faster blocks are good. It is how many block-denominated constants exist out in the ecosystem, in wallets and bridges and exchange integrations, written by people who reasonably assumed 75 seconds was forever.


As always, if this was useful, pass it to someone who counts blocks for a living. They have constants to check.

Next in the series: ZIP 233, the first of the three proposals that make up the Network Sustainability Mechanism, and the one that lets ZEC be taken out of circulation on purpose.

## Sources

- ZIP 218: 25-second Block Target Spacing. https://zips.z.cash/zip-0218
- ZIP 318: Orchard to Ironwood Migration, for the block-denominated constants. https://zips.z.cash/zip-0318
- ZIP index, for ZIP statuses and the NU7 candidate list. https://zips.z.cash/
- CoinDesk, "Zcash holders overwhelmingly back faster transactions and bitcoin-style halvings," 16 September 2026. https://www.coindesk.com/tech/2026/09/16/zcash-holders-overwhelmingly-back-faster-transactions-and-bitcoin-style-halvings
- Zcash Labs, NU7 coinholder vote page, for the voting dates. https://zcashlabs.org/voting
