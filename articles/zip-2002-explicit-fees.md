---
title: "ZIP 2002: Explicit Fees"
series_number: 7
subtitle: "Zcash fees are currently a subtraction you perform yourself. This ZIP makes them a number you write down."
zip: 2002
zip_status: Draft
zip_category: Consensus
spec_url: https://zips.z.cash/zip-2002
tag: NU7 candidate
date: 2026-09-23
status: draft
disclosure: >-
  Researched with AI assistance, working from the ZIP text and the sources listed at
  the end. Every number, quotation and mechanism was checked against those sources in
  two further review passes. Any errors are the author's own.
corrections: []
cover: /covers/zip-2002-explicit-fees/cover.svg
---

## The short version

This is the smallest ZIP in the series so far, and it fixes a class of mistake that has cost people real money on Bitcoin for fifteen years.

- Today a Zcash transaction fee is **implicit**: it is whatever is left when you subtract the outputs from the inputs. You never state it.
- That means forgetting a change output does not produce an error. It produces a very large fee, paid to a miner, irreversibly.
- ZIP 2002 makes the fee **explicit** in the V7 transaction format, as an entry in the transparent value pool balance map from ZIP 248.
- Because the fee is committed to via the txid, a hardware wallet can display the fee it is actually signing rather than recomputing it and hoping.
- Light clients gain something too: they can read a transaction's fee without downloading and inspecting its transparent inputs.
- It registers **bundle type 5, variant 0**, with no effecting data and no authorizing data. It is a Draft and an NU7 candidate, owned by Daira-Emma Hopwood.

## Setting the stage: the fee you never write down

Bitcoin made a decision early that everything since has inherited. A transaction lists inputs and outputs, and the fee is the difference. There is no fee field.

It is elegant. It is also, as the ZIP puts it, "prone to user error."

The classic failure is forgetting change. You have an input worth 10 ZEC. You want to send 1 ZEC. You must create two outputs: 1 ZEC to the recipient and about 9 ZEC back to yourself. Forget the second one, and the transaction is still perfectly valid. It sends 1 ZEC and pays a 9 ZEC fee.

Nothing rejects it. No rule is broken. The arithmetic simply means something different from what you intended, and a miner is 9 ZEC richer.

ZIP 2002's motivation lists the ways this goes wrong: it is "very easy to forget to add an output for a change address, make a calculation error, mix up units etc."

The principle it opens with is the one worth keeping: "When it comes to fee selection, it should be very hard to make mistakes."

![An implicit fee means a forgotten change output silently becomes an enormous fee](/figures/zip-2002-explicit-fees/fig-1-forgotten-change.svg "Figure 1. Both transactions are valid. Only one of them is what the sender meant.")

## The problem with implicit arithmetic

Beyond the obvious foot-gun, the ZIP names two consequences that matter more as Zcash grows up.

**Hardware wallets cannot show you the fee.** A hardware wallet's job is to display what you are about to authorise. With an implicit fee there is no fee to display: the device "must recompute the fee on its own and cannot simply display the value being committed to."

Recomputing means trusting that it has been given complete and correct information about every input. That is exactly the assumption a hardware wallet exists to avoid. The security model of a signing device is that it shows you the truth independent of the computer it is plugged into, and an implicit fee undermines that at the most consequential moment.

**Light clients cannot read fees.** To know what a transaction paid, you need its inputs' values, which means fetching and inspecting the transparent inputs. This ZIP makes it "possible for light clients to determine the fee paid by a transaction without needing to download and inspect transparent inputs."

That matters for wallets showing history, for explorers, and for anything trying to reason about fee markets without running a full node.

![With an implicit fee a signing device must recompute; with an explicit fee it can display the committed value](/figures/zip-2002-explicit-fees/fig-2-hardware-wallet.svg "Figure 2. The difference between showing a number you were given and showing a number you derived from data you were also given.")

## An overview of ZIP 2002

ZIP 2002 is a Consensus ZIP with status Draft, owned by **Daira-Emma Hopwood**. It is an NU7 candidate and applies to the V7 transaction format.

From the Abstract: it "makes the transaction fee explicit in the V7 transaction format, as an entry in the transparent transaction value pool balance map defined in ZIP 248. Instead of fees being implicit in the difference between the input value and output value of the transaction, all value transfers, including fee transfers to miners, will be explicit and committed to via the txid."

The phrase to hold onto is **all value transfers**. The fee stops being a residue and becomes a transfer like any other, stated and committed.

Structurally it is tiny. It registers **bundle type 5, variant 0** ("Transaction fee") in the V7 bundle registry, with value pool deltas but no effecting data and no authorizing data. Readers of the ZIP 233 article will recognise the shape: nothing to prove, nothing to sign, just an entry in the value pool deltas that consensus rules interpret.

The rules on sign are precise:

- For **non-coinbase** transactions, the value "MUST be nonpositive, representing the fee being removed from the transparent transaction value pool."
- For **coinbase** transactions, it "MUST be nonnegative, representing the total fees collected from other transactions in the block being added to the ZEC transparent transaction value pool."

So fees leave ordinary transactions as a negative entry and arrive in the coinbase as a positive one. The accounting is symmetric and visible on both sides, instead of appearing from nowhere as a difference.

![The fee leaves a transaction as a negative entry and arrives in the coinbase as a positive one](/figures/zip-2002-explicit-fees/fig-3-both-sides.svg "Figure 3. Both halves of the fee are written down. Today only the effect is observable, by subtraction.")

## How it works

There is not much to explain, which is the point.

A V7 transaction includes a fee bundle. The fee bundle contributes an entry to `mValuePoolDeltas` with `bundleType = 5` and `assetClass = 0`, meaning ZEC. For an ordinary transaction that value is zero or negative. Consensus checks it.

Because the entry is part of the transaction and the transaction is committed to by its txid, the fee is covered by the signature. A signing device can read it directly and show it, and any change to it changes the txid.

Note what this does *not* do. It does not change how much fees cost; that is ZIP 317's job. It does not change who receives them. It changes only whether the number is stated or inferred.

## Why ZIP 2002? The case for writing the fee down

### It converts a silent failure into a visible one

This is the whole argument and it is a good one. A forgotten change output currently produces a valid transaction with a catastrophic fee. With an explicit fee, the intended fee is stated, so software can compare stated against actual and refuse anything absurd before it is signed.

Errors that announce themselves are in a completely different class from errors that succeed quietly. Bitcoin has a long history of accidental five-figure fees; every one of them was arithmetic doing exactly what it was told.

### It fixes the hardware wallet story properly

You can mitigate this in software today. Wallets warn about large fees. But those mitigations live on the machine that might be compromised or buggy. Putting the fee in the transaction moves the guarantee into the thing being signed, which is where a hardware wallet can rely on it.

### It costs almost nothing

No circuit, no proof, no signature, no new cryptography. A bundle type with no effecting or authorizing data and a sign rule. For a change that eliminates a whole category of user error, the implementation cost is about as low as consensus changes get.

### It makes fees legible to light clients

A wallet can show what a transaction paid without fetching its inputs. Small, but it removes a reason for light clients to need more data than they otherwise would, which is the direction the whole ecosystem is moving.

## Are there any drawbacks to implementing ZIP 2002?

### It only helps V7 transactions

The change applies to the V7 transaction format. Older formats keep implicit fees for as long as they are accepted, so the class of mistake persists on the old path until the old path goes away. That is unavoidable for a format change, and it means the benefit arrives gradually rather than at activation.

### Stating a number does not stop you stating the wrong one

An explicit fee makes the value visible and checkable. It does not make it correct. Someone can still write 9 ZEC where they meant 0.0001, and now the transaction says so clearly.

That is a real improvement, because visible mistakes get caught. It is worth being precise that the ZIP removes a *silent* failure mode, not the possibility of error. The motivation's own framing is careful here: it should be "very hard to make mistakes", not impossible.

### Two ways to express the same thing, for a while

During any period where both implicit and explicit fees exist, implementations must handle both, and consistency between them has to be enforced. Transitional complexity is where bugs live. The sign rules are clear enough that this ought to be tractable, but "ought to be tractable" is how a lot of consensus bugs start.

### It needs wallet adoption to matter

The user-facing benefit arrives when wallets and hardware devices display the explicit fee and check it against what the user asked for. The consensus change permits that; it does not cause it. As with memo bundles, the value of this ZIP is mostly realised outside consensus.

## Where this stands

ZIP 2002 is a **Draft** and an NU7 candidate, and its fate is tied to the V7 transaction format landing.

Among the NU7 candidates it is one of the least contentious. It does not change anyone's economics, it does not alter privacy properties, and it makes a category of expensive mistake harder. The kind of proposal that gets overlooked precisely because nobody objects to it.

## Conclusion: ZIP 2002 and the oldest foot-gun in the book

ZIP 2002 is a one-line idea: write the fee down.

Everything else follows. A hardware wallet can show you what you are signing rather than deriving it from data supplied by a machine you may not trust. A light client can read a fee without fetching inputs. And the oldest self-inflicted wound in Bitcoin-descended systems, the forgotten change output that turns into a life-changing fee, stops being a valid transaction that quietly does the wrong thing.

The interesting thing about it is how long the implicit design survived. Fees-as-subtraction is elegant, and elegance is persuasive. It took fifteen years of people accidentally paying enormous fees for "make it explicit" to become the obvious answer.


As always, if this was useful, send it to anyone who has ever built a transaction by hand and held their breath.

That is the last article in this batch. The series continues with the remaining NU6.3 and NU7 ZIPs: ZIP 229 and the version 6 transaction format, ZIP 326 on what NU6.3 means for wallets, ZIP 235 and the 60% fee removal, and ZIP 258, the deployment ZIP that decides what actually ships.

## Sources

- ZIP 2002: Explicit Fees. https://zips.z.cash/zip-2002
- ZIP 317: Proportional Transfer Fee Mechanism. https://zips.z.cash/zip-0317
- ZIP 233: Network Sustainability Mechanism: Removing Funds From Circulation, for the comparable bundle structure. https://zips.z.cash/zip-0233
- ZIP index, for statuses and the NU7 candidate list. https://zips.z.cash/
