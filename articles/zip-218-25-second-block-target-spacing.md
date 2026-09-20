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
- The part that got almost no coverage is the second half of the proposal: **action limits**, a new cap on how much shielded work fits in a block. Without them, faster blocks would have made a denial-of-service attack on light wallets three times cheaper.
- With the limits, Orchard throughput goes from 2.9 to 6.6 transactions per second, and the worst-case sync burden on a light client drops 37%, from 271 to 169 MB a day.
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

The result, in the ZIP's own numbers, is that the configuration "more than double[s] the Orchard TPS (2.9 → 6.6 TPS), while lowering the impact a DoS attacker can impose on wallets; for example, maximum shielded sync bandwidth for light clients is reduced by 37% (271 → 169 MB/day)."

Read that carefully, because it is doing something slightly surprising. Throughput more than doubles **and** the worst case gets better. Those usually trade against each other. They do not here because the two numbers describe different things: ordinary capacity for real transactions versus the ceiling an attacker can push against. The limits raise the first and lower the second.

![Action limits raise ordinary throughput while lowering the worst-case sync burden](/figures/zip-218-25-second-block-target-spacing/fig-2-action-limits.svg "Figure 2. Orchard throughput up from 2.9 to 6.6 transactions per second; worst-case light client sync down from 271 to 169 MB a day. Figures from ZIP 218.")

The limits fall hardest on the old pools. The ZIP says they "significantly decrease the number of Sprout and Sapling pool outputs available per block, to lower the maximum shielded sync burden under attempted DoS." Sprout and Sapling outputs are the most expensive for a light client to scan and the least used in practice, so they are where the savings are cheapest to take.

## An overview of ZIP 218

ZIP 218 is a Consensus ZIP with status Draft, owned by **Dev Ojha and Evan Forbes**. It is a candidate for NU7; the ZIP index still notes that no final decision has been made about which ZIPs NU7 includes.

It does three things:

1. **Changes the block target spacing** from 75 seconds to 25.
2. **Introduces per-pool action limits** for the Sapling and Orchard shielded protocols, plus a global limit.
3. **Rescales the block subsidy** so that daily ZEC issuance is unchanged.

Point three is the one that stops the obvious objection. Three times as many blocks paying the same reward each would mean three times the inflation. The ZIP is direct: "The emission schedule of mined ZEC will be the same in terms of ZEC/day, but this requires the emission per block to be adjusted to take account of the changed block target spacing."

Miners are not being paid more or less. The same daily issuance is cut into three times as many pieces.

![The same daily ZEC issuance divided into three times as many blocks](/figures/zip-218-25-second-block-target-spacing/fig-3-issuance.svg "Figure 3. Same ZEC per day, smaller reward per block. The halving schedule is untouched by this ZIP.")

## How it works

### The spacing change, and everything measured in blocks

The target spacing becomes 25 seconds. Difficulty adjustment continues to steer towards that target.

The consequence that ripples furthest is that many protocol constants are measured in blocks, not time. A constant meaning "about an hour" as a block count now means about twenty minutes. The ZIP handles this by rescaling the constants that represent durations, marking them to "Scale by 3."

This is exactly the kind of change that is easy to get right for node software and easy to miss elsewhere. I wrote about one case last time: ZIP 318's migration timings are all expressed in blocks, and I could find no mention of ZIP 318 or wallet migration constants anywhere in ZIP 218. If both ship, a wallet's migration schedule compresses threefold unless someone rescales it deliberately.

### Confirmations and rollback risk

If blocks arrive three times faster, is one confirmation worth a third as much?

The ZIP's answer depends on the threat model, and it says so: "Rollback-risk analysis depends on the threat model. For models that bound an attacker by a fixed fraction of total hash power, reducing the block target spacing can reduce confirmation latency by nearly the same factor."

The argument is that if you model an attacker as controlling some percentage of hash power, then the security of a confirmation comes from the *proportion* of work done, not the wall-clock time it took. Three faster blocks represent a similar share of total work as one slow block did.

That holds for a proportional-hash-power model. It holds less well for models where the attacker's advantage is tied to wall-clock time, such as network latency or an attacker who can rent hash power for a fixed period. The ZIP acknowledges the dependence rather than claiming the question is settled, which is the right posture.

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

2.9 to 6.6 transactions per second. 271 to 169 MB a day, a 37% reduction. A reader can check the arithmetic and an implementer can test against it. Proposals that offer round, unfalsifiable claims are harder to evaluate and easier to get wrong.

## Are there any drawbacks to implementing ZIP 218?

### Constants measured in blocks, spread across an ecosystem

The ZIP rescales the node constants it owns. It does not, and arguably cannot, rescale every block-denominated constant in every wallet, SDK, exchange integration and bridge.

ZIP 318 is the example I have checked, and it is unlikely to be the only one. A wallet whose "wait about an hour" is a block count will silently start waiting twenty minutes. A bridge requiring N confirmations will accept transactions on a third of the previous work unless it revisits N. None of these break loudly. They just quietly mean something different.

This is my own concern rather than something the ZIP raises, and I would like to be wrong about its scale.

### Three times the block headers, forever

Every node stores and validates three times as many block headers per day, forever. Header growth is small compared with block data, but it is permanent and it compounds. For a chain that intends to run for decades, tripling a linear cost deserves more discussion than I could find in the proposal.

### More orphaned blocks

Shorter spacing means a higher proportion of blocks are found while another is still propagating. Those blocks are wasted work. This is a well-understood cost of faster block times and it tends to fall harder on smaller miners with worse connectivity, which pushes gently towards centralisation.

The ZIP's rollback discussion touches the security side of reorganisations. I did not find a treatment of the orphan rate or its distributional effect on miners, and for a change of this size I would expect one.

### The old pools take the squeeze

The action limits work partly by cutting how many Sprout and Sapling outputs fit in a block. That is defensible: those pools are deprecated and expensive to scan. But it does mean holders still using them get a degraded service as a side effect of a change sold on latency.

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
