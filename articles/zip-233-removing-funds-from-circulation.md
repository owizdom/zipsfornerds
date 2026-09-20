---
title: "ZIP 233: Removing Funds From Circulation"
series_number: 4
subtitle: "A way to take ZEC out of circulation on purpose, which is not the same thing as burning it."
zip: 233
zip_status: Draft
zip_category: Consensus / Ecosystem
spec_url: https://zips.z.cash/zip-0233
tag: NU7 candidate
date: 2026-09-22
status: draft
disclosure: >-
  Researched with AI assistance, working from the ZIP text and the sources listed at
  the end. Every number, quotation and mechanism was checked against those sources in
  two further review passes. Any errors are the author's own.
corrections: []
cover: /covers/zip-233-removing-funds-from-circulation/cover.svg
---

## The short version

Zcash, like Bitcoin, has a problem it inherited rather than chose: the block subsidy has an end date. ZIP 233 is the first of three proposals that try to do something about it.

- ZIP 233 adds a way for anyone to voluntarily remove ZEC from circulation, as part of an ordinary transaction.
- It is deliberately **not** a burn. The ZIP's stated intent is that removed funds "will be returned to circulation through future block subsidies, rather than being permanently destroyed or held in reserve for discretionary use."
- On its own it does almost nothing. It creates headroom under the 21 million cap. **ZIP 234** is what reissues the removed funds, and **ZIP 235** is what supplies them automatically, removing at least 60% of transaction fees.
- Together the three are called the **Network Sustainability Mechanism**.
- Mechanically it is small: a new bundle type in the V7 transaction format, with no effecting data and no authorizing data. The amount is simply an entry in the transaction's value pool deltas.
- It is an NU7 candidate and still a Draft.

## Setting the stage: the end of the subsidy

Bitcoin's design has a known terminus. The block subsidy halves until it rounds to nothing, after which miners are paid by transaction fees alone. Zcash inherited this shape.

Whether fees alone can fund security is one of the longest-running open questions in the field, and nobody has an answer backed by evidence, because no major chain has reached that point yet.

ZIP 233's motivation names the concern directly, as "concerns about the sustainability of the network design shared by Bitcoin-like systems." Its framing is about **Long Term Consensus Sustainability**: enabling removal of funds gives the network the ability to create "headroom" between the chain value and MAX_MONEY, and this "lays necessary groundwork for extending the block subsidy system, which currently has a clear final end date."

That is the key idea, and it is worth slowing down for.

The 21 million cap is a rule about total issuance. If ZEC is removed from circulation, the gap between what exists and what the cap permits grows. That gap is issuance capacity that the protocol could use again later, without ever breaking the cap.

So the cap is not being raised. The space beneath it is being reopened.

![Removing ZEC from circulation creates headroom below the 21 million cap that future subsidies can use](/figures/zip-233-removing-funds-from-circulation/fig-1-headroom.svg "Figure 1. The cap does not move. Removing coins widens the space under it, and ZIP 234 is what spends that space again.")

## The problem with calling it a burn

Most chains that destroy coins destroy them. The supply drops and that is the end of the story.

ZIP 233 is careful to be a different thing, and the distinction is the whole point. From the Abstract: "The explicit intent of this removal is that the funds will be returned to circulation through future block subsidies, rather than being permanently destroyed or held in reserve for discretionary use."

There are three possible destinations for coins taken out of circulation, and the ZIP rejects two of them:

- **Destroyed forever.** Supply shrinks permanently. Holders benefit; the security budget does not.
- **Held in a reserve someone controls.** This funds the network but creates a treasury, and with it the governance question of who decides how it is spent.
- **Returned automatically through future block subsidies.** This is what ZIP 233 intends. No human decides. Under ZIP 234 the removed value simply enlarges the reserve that every future subsidy is computed from.

That third option is what makes this a *sustainability* mechanism rather than a deflation mechanism. The ZIP says the funds will be "automatically and algorithmically reissued," and that word "algorithmically" is doing deliberate work: it is the absence of a committee.

![Three destinations for removed coins: destroyed, held in a reserve, or algorithmically reissued](/figures/zip-233-removing-funds-from-circulation/fig-2-three-destinations.svg "Figure 2. ZIP 233 takes the third path, which is what makes it a sustainability mechanism rather than a burn or a treasury.")

## An overview of ZIP 233

ZIP 233 is a Consensus / Ecosystem ZIP with status Draft. It shares its six owners, and its original author, with the other two ZIPs of the mechanism: Jason McGee, Zooko Wilcox, Mark Henderson, Tomek Piotrowski, Mariusz Pilarek and Paul Dann, with Nathan Wilcox as original author. The three share a purpose as well:

- **ZIP 233** creates the ability to remove funds from circulation.
- **ZIP 234** changes issuance to a smooth curve that can reissue removed funds.
- **ZIP 235** removes at least 60% of transaction fees from circulation automatically.

The ZIP names the combination: "This mechanism, in combination with ZIP 234 and ZIP 235, comprises a long-term strategy for the sustainability of the network. We will refer to the combined effects of these three ZIPs as the Network Sustainability Mechanism."

Notably, they need not arrive in the same upgrade: removed funds are intended to be reissued "whether or not all three ZIPs comprising the Network Sustainability Mechanism are deployed in the same network upgrade." The order is still constrained, since ZIP 234 and ZIP 235 each carry a MUST that they not be deployed before ZIP 233.

![ZIP 233 removes, ZIP 235 supplies the flow automatically, ZIP 234 reissues](/figures/zip-233-removing-funds-from-circulation/fig-3-nsm-loop.svg "Figure 3. The three ZIPs form a loop. ZIP 233 is the opening in the side of it.")

## How it works

The mechanism is much smaller than the idea.

ZIP 233 registers **bundle type 6, variant 0**, the "ZIP 233 NSM field", in the V7 transaction bundle type registry defined in ZIP 248. In that registry it has value pool deltas, but **no effecting data and no authorizing data**.

In plain terms: it is not a new kind of transaction component with its own cryptography. There is no proof and no separate signature. The amount still cannot be tampered with, because it "is committed to the transaction identifier and signature digest", so the transaction's existing authorizations cover it. Three consensus rules apply: the asset class must be ZEC, the value pool delta must be nonpositive, and the amount must be within 0 to MAX_MONEY.

What the rest amounts to is the important sentence: the amount "does not result in an output being produced in any chain value pool, and therefore from the point at which the transaction is applied to the global chain state, [it] is subtracted from the issued supply. It is unavailable for circulation on the network at least through to the end of the block in which the transaction is mined."

Two things worth noticing.

**The money goes nowhere.** Normally value moves between pools: transparent to Orchard, Orchard to Ironwood, and so on. Here value leaves a pool and no output is created anywhere. That is what "removed from circulation" means concretely.

**"At least through to the end of the block."** This is careful drafting. It commits only to what this ZIP controls. ZIP 233 removes the funds; it does not itself promise when they come back, because reissuance is ZIP 234's job. If ZIP 234 never ships, the funds stay out.

![A ZIP 233 removal produces no output in any pool, so the amount leaves the issued supply](/figures/zip-233-removing-funds-from-circulation/fig-4-no-output.svg "Figure 4. An ordinary transfer moves value between pools. A removal produces no output at all.")

## Why ZIP 233? The case for removing funds rather than burning them

### It is the smallest possible version of the idea

No new circuit, no new proof, no new signature. A bundle type with no effecting or authorizing data is about as cheap as a consensus change gets. That matters because the other two NSM ZIPs are economically contentious in ways this one is not, and keeping the mechanism trivial keeps the argument about economics rather than implementation risk.

### It separates the mechanism from the policy

ZIP 233 answers "how can ZEC be removed?" and refuses to answer "how much, and by whom?" ZIP 235 supplies one answer, taking 60% of transaction fees. Anyone can supply another, by calling this mechanism voluntarily.

That separation means the removal machinery can ship and be exercised before the network commits to any particular economic policy.

### No treasury, no committee

This is the quiet virtue. A chain wanting to extend its security budget could create a fund and appoint people to steward it. Zcash has enough history with funding governance to know what that costs in argument. Routing removed value back through the ordinary subsidy means there is no pot and nobody to lobby.

### Holders benefit without opting in

The Motivation makes a modest claim about this: reducing the circulating supply may contribute to the value of the remaining ZEC, benefiting network users "in proportion to their holdings" and, in the ZIP's words, "without requiring them to opt into any scheme, introducing extra risk, active oversight, or accounting complexity."

The hedging there is appropriate and worth noting. It says *potentially contributes* and *can be argued*. This is not a promise about price.

## Are there any drawbacks to implementing ZIP 233?

### Alone, it is a burn with good intentions

This is the central risk, and it follows from the ZIP's own design. ZIP 233 removes funds. ZIP 234 returns them. The ZIP is explicit that the pieces need not ship together.

If ZIP 233 activates and ZIP 234 does not, then ZEC gets removed from circulation with no mechanism to bring it back. The intent is recorded in a document; the behaviour is permanent destruction. Intent is not a consensus rule.

The ordering is constrained in one direction. Both companions carry a MUST: ZIP 234 "MUST be deployed at the same time or after ZIP 233", and ZIP 235 says the same. So nothing can reissue or supply before the removal mechanism exists. Nothing compels ZIP 234 to ship at all, which is the gap that matters.

Whether that matters depends on how much is removed. At today's fee levels, not much: ZIP 235 works the numbers and puts its own flow at "210.864 ZEC per year", which against annual issuance of roughly 657,000 ZEC is about 0.03%. ZIP 235 says as much, noting fees are "currently small enough that the reduction in miner fees is unlikely to be a concern." The exposure grows only if fee revenue grows, which is exactly the world the Network Sustainability Mechanism is designed for.



### "Voluntary" is doing a lot of work

Read alone, ZIP 233 sounds opt-in: a thing you may choose to do. In practice, almost all of the volume through this mechanism would come from ZIP 235, which takes a fixed proportion of every transaction fee automatically.

That is not voluntary from the fee payer's point of view. The mechanism is voluntary; the main use of it, as currently proposed, is not. Both ZIPs are honest about this individually. Reading only this one gives the wrong impression.

### It relies on an unproven premise

The whole NSM rests on the belief that fee-only security is insufficient. That is a widely shared belief, and it is still a belief. No chain has reached the end of its subsidy, so the counterfactual cannot be observed.

If the premise is wrong, the mechanism is a complication with no benefit. If it is right, waiting until the evidence arrives means acting too late. The ZIP is choosing under uncertainty, which is reasonable, but the uncertainty should not disappear from the discussion.

### It is a new distinguisher, and the ZIP says so

For a privacy chain this is the drawback that should come first, and ZIP 233 raises it itself. The mechanism "adds a new type of transparent transaction event that is fully visible to chain observers, and linked to other events performed in the transaction."

Its own assessment of the consequence is candid: transactions that intentionally remove funds "are likely to represent a small fraction of Zcash transactions, and so this will provide another tool that adversaries may use to be able to segment users of the network."

That is the cost of a voluntary mechanism: choosing to use it marks you. It matters less if ZIP 235 ships, since fee removal would then be routine rather than a choice.

### The accounting gets harder to follow

Zcash already has several pools and a turnstile system so anyone can verify the supply. Adding removals and later reissuance means the answer to "how much ZEC exists?" has more moving parts: issued, removed, reissued.

The ZIP 209 machinery tracks pool balances, and the supply stays verifiable. But it becomes harder to explain to an ordinary holder, and "21 million, halving every four years" was one of the few parts of this system a newcomer could hold in their head.

## Where this stands

ZIP 233 is a **Draft** and an NU7 candidate. So are ZIP 234 and ZIP 235.

The September coinholder poll touched the NSM but not this ZIP directly. Holders voted to keep Bitcoin-style halvings rather than move to the smoothed curve ZIP 234 proposes, and voted to delay reissuing NSM funds until February 2031.

That second result is the interesting one for ZIP 233. Reissuance is the thing that makes removal a loop rather than a burn, and coinholders have voted to postpone it by several years. The mechanism for taking ZEC out may well arrive before the mechanism for putting it back has any effect.

## Conclusion: ZIP 233 and the difference between a loan and a gift

ZIP 233 is a small consensus change carrying a large argument. The change itself is a bundle type with no proof and no signature. The argument is about whether a chain should be able to reopen space under its own supply cap in order to keep paying for its security after the subsidy runs out.

The distinction that matters most is the one between destruction and removal. A burn is a gift to holders. A removal, as intended here, is a loan to the network's future security budget, repaid automatically with nobody in charge of the repayment.

Whether it is a loan or a gift depends entirely on ZIP 234 shipping, and on reissuance actually being switched on. Coinholders have just voted to wait until 2031. Until then, anything ZIP 233 removes is out of circulation with no route home.


As always, if this was useful, share it with someone who thinks this mechanism is a burn. That is the misreading worth heading off.

Next in the series: ZIP 234, the smoothed issuance curve that coinholders declined in favour of keeping the halvings.

## Sources

- ZIP 233: Network Sustainability Mechanism: Removing Funds From Circulation. https://zips.z.cash/zip-0233
- ZIP 234: Network Sustainability Mechanism: Issuance Smoothing. https://zips.z.cash/zip-0234
- ZIP 235: Remove 60% of Transaction Fees From Circulation. https://zips.z.cash/zip-0235
- ZIP 209: Prohibit Out-of-Range Chain Value Pool Balances. https://zips.z.cash/zip-0209
- ZIP 248: Extensible Transaction Format. https://zips.z.cash/zip-0248
- ZIP index, for statuses and the NU7 candidate list. https://zips.z.cash/
- CoinDesk, "Zcash holders overwhelmingly back faster transactions and bitcoin-style halvings," 16 September 2026. https://www.coindesk.com/tech/2026/09/16/zcash-holders-overwhelmingly-back-faster-transactions-and-bitcoin-style-halvings
