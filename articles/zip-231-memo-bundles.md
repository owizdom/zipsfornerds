---
title: "ZIP 231: Memo Bundles"
series_number: 6
subtitle: "Every shielded transaction carries a kilobyte of mostly empty memo space. This ZIP makes memos bigger, cheaper and deletable at once."
zip: 231
zip_status: Draft
zip_category: Consensus / Wallet
spec_url: https://zips.z.cash/zip-0231
tag: NU7 candidate
date: 2026-09-23
status: draft
disclosure: >-
  Researched with AI assistance, working from the ZIP text and the sources listed at
  the end. Every number, quotation and mechanism was checked against those sources in
  two further review passes. Any errors are the author's own.
corrections: []
cover: /covers/zip-231-memo-bundles/cover.svg
---

## The short version

Zcash lets you attach a private note to a shielded payment. The way that works today wastes space on almost every transaction ever made.

- Every shielded output carries a fixed **512-byte** memo field, whether you wrote a memo or not.
- An ordinary transaction is padded to two outputs, so it spends **1024 bytes** on memo data. Usually both are empty.
- ZIP 231 replaces the inline field with a **32-byte memo key** per output, plus one shared **memo bundle** per transaction.
- The same two-output transaction drops from 1024 bytes to about **576 bytes**.
- Memos can also get bigger: up to **64 chunks** of 256 bytes, so **16 KiB** in one transaction, paying a proportionate fee.
- Two things become possible that were not before: one memo readable by several recipients, and memo data that can be **pruned** from storage without stopping a node from validating the chain.
- It is an NU7 candidate, still a Draft, owned by Jack Grigg, Kris Nuttycombe, Daira-Emma Hopwood and Arya Solhi.

## Setting the stage: the memo field nobody uses

Zcash memos are one of the genuinely useful things a shielded chain can offer. An invoice reference, a refund address, a note to a friend, all encrypted to the recipient.

The implementation, in transaction versions v2 through v5, is simple: each Sapling or Orchard shielded output contains a ciphertext holding a 52-byte note plaintext plus a 512-byte memo field, with a 16-byte authentication tag. The memo is always there. If you did not write one, the space carries padding.

Now add the privacy design on top. To stop observers distinguishing a payment with change from one without, wallets pad transactions to two outputs, or two Orchard actions. Both outputs carry their 512 bytes.

The result, in the ZIP's words: such a transaction "will consume 1024 bytes of block space for memo data", and "virtually all transactions with shielded components consume at least 1024 bytes of block space for memo data, and between half and 3/4 of that data payload is ordinarily waste."

It gets worse with more inputs. An Orchard transfer spending several notes incurs a memo cost of 512 bytes times the number of input notes, and as the ZIP notes, "ordinarily, most of this data space is wasted, as most wallets support only a single 512-byte memo to be sent to the recipient of the transfer."

So the common case is: pay for two or more memo slots, use at most one, and every node stores the padding forever.

![Today both padded outputs carry a full 512-byte memo field even when empty](/figures/zip-231-memo-bundles/fig-1-wasted-space.svg "Figure 1. The ordinary two-output shielded transaction. 1024 bytes of memo space, typically carrying one memo or none.")

## The problem with an inline field

Three separate limitations follow from putting the memo inside the output, and ZIP 231 addresses all three with one change.

**It is fixed size, so it is both too big and too small.** 512 bytes is far more than an empty memo needs and far less than a long one. There is no way to pay for more, so the ZIP notes that "sending memo data greater than 512 bytes requires sending multiple outputs."

**It cannot be shared.** The memo lives inside an output, encrypted to that output's recipient. If you pay three people and want all three to read the same note, you store it three times.

**It can never be deleted.** Because the memo ciphertext is part of the output, it is part of what a node needs to validate the transaction. Every node keeps every memo forever, including the padding in the empty ones.

That last point is the structural one. The Motivation puts it as defining "a mechanism by which validating nodes may reduce their long-term storage requirements by pruning memo data."

## An overview of ZIP 231

ZIP 231 is a Consensus / Wallet ZIP with status Draft, owned by **Jack Grigg, Kris Nuttycombe, Daira-Emma Hopwood and Arya Solhi**, crediting Sean Bowe and Nate Wilcox. It is an NU7 candidate and applies to the V7 transaction format.

The change, in one sentence from the Abstract: it decouples memo data from outputs "by introducing a per-transaction memo bundle. Each shielded output carries a 32-byte memo key rather than an inline 512-byte memo field."

The memo key is not the memo. It is used to derive a symmetric encryption key, which decrypts that output's memo from the bundle.

The ZIP lists four outcomes:

- Memo data for a two-output transaction drops from at least 1024 bytes to about 576 bytes.
- Larger memos become possible, with a proportionate fee increase.
- Memo data can be shared between multiple recipients of a transaction.
- Memo data can be pruned from a stored transaction "without impairing the ability of a consensus node to validate the transaction."

![A 32-byte key in each output points into one shared, separately encrypted memo bundle](/figures/zip-231-memo-bundles/fig-2-bundle.svg "Figure 2. The memo moves out of the output. What stays behind is a 32-byte key that unlocks a chunk of the shared bundle.")

## How it works

### The bundle

A memo bundle is a sequence of **272-byte memo chunks**, each encrypting **256 bytes** of memo plaintext. Those chunks represent zero or more encrypted memos.

Each V7 transaction may contain a single memo bundle, and a bundle may contain at most `memo_chunk_limit` = **64** chunks. That caps memo data in one transaction at 64 × 256 = **16384 bytes**, or 16 KiB.

The 16-byte difference between 272 and 256 is the ChaCha20Poly1305 authentication tag on each chunk, which the ZIP records as a 6.25% per-chunk overhead. It is what lets a recipient tell which chunks are theirs.

### Padding, and where 576 comes from

A bundle cannot carry just one chunk. To stop the number of chunks becoming a fingerprint, the ZIP requires that a V7 transaction with any shielded outputs "include at least 2 memo chunks in its memo bundle and pad the memo to a multiple of 2 chunks". Padding chunks are made by encrypting random data under a random key, so they are "indistinguishable from real encrypted memo chunks to an observer who does not hold the memo key".

The ZIP states the resulting figure as approximately 576 bytes and does not show its working, so I will not invent a derivation for it. The shape of the win is what matters: two 32-byte keys plus a minimum two-chunk bundle, against 1024 bytes of inline fields, and you stop paying twice for space you used once.

### Fees scale with memo size

Memo capacity is no longer free-but-fixed; it is paid for. The conventional fee is altered so that a memo bundle may contain **two free chunks** if the transaction has any shielded outputs, and any chunk beyond that requires a marginal fee.

That is a sensible default. Two free chunks is 512 bytes of memo, which covers ordinary use at no extra cost, while a 16 KiB memo pays for the block space it occupies. Note that the fee rule and the padding rule are different things: padding to an even number of chunks is a consensus MUST in ZIP 231, whereas the conventional fee is a ZIP 317 formula that wallets are not obliged to follow.

### Pruning

This is the part with the longest-lived consequences.

Memo bundles are encoded "in a prunable manner: the entire memo bundle can be replaced by a single digest."

A node that does not need the memo data can discard it and keep a hash. The transaction still validates, because what consensus commits to is the digest. As the Network protocol section puts it, decoupling memo data this way mitigates "the long-term storage costs that memo data imposes on node operators, while preserving the ability of every node to validate the full transaction chain using the memo bundle digest."

Today, memo data is permanent for everyone. After this, it is permanent only for those who choose to keep it.

![Memo bundles can be replaced by a digest, so a node can discard memo data and still validate](/figures/zip-231-memo-bundles/fig-3-pruning.svg "Figure 3. Consensus commits to the digest, not the bytes. That is what makes memo data optional to store.")

### Sharing a memo

To share a memo, the same memo key is placed in each recipient's note plaintext, so both unlock the same memo. One copy on chain, several readers. A memo may span many chunks, and chunks belonging to different memos are interleaved, so a recipient trial-decrypts the bundle to find their own.

## Why ZIP 231? The case for taking memos out of outputs

### It makes the common case cheaper

The ZIP's own figures make the case: "virtually all transactions with shielded components consume at least 1024 bytes of block space for memo data, and between half and 3/4 of that data payload is ordinarily waste." Cutting roughly 450 bytes from the typical transaction compounds across every transaction the chain will ever carry.

One thing it does not buy is throughput under ZIP 218. Those limits count actions, not bytes, and ZIP 218 records that the action limit is what binds: a full 2 MB block could hold up to 617 Orchard actions today, against a cap of 330 across pools. Saving memo bytes does not help against a limit denominated in actions.

### It fixes three problems with one mechanism

Bigger memos, shareable memos, prunable memos, a much smaller output ciphertext and the light-client argument in the ZIP's motivation are separate wants. They all fall out of the same decision to move the memo out of the output and address it by key. That is the sign of a change made at the right layer.

### Pruning is a long-term storage argument

Chains accumulate. Every byte a node must keep forever is a slow tax on running one. Making memo data prunable means the chain's permanent footprint grows more slowly than its history, without giving up validation.

### Paying for what you use

Replacing a fixed allowance with two free chunks plus marginal pricing is straightforwardly fairer. Light users stop subsidising the padding; heavy users can buy more and pay for it.

## Are there any drawbacks to implementing ZIP 231?

### It trades one distinguisher for another, and the ZIP says so

This is the part worth reading in the ZIP itself, because it has a Privacy Implications section that sets out the trade directly.

Today's arrangement is not neutral. Because every shielded output has its own memo field, the ZIP notes that "a chain observer can therefore infer a likely 1:1 correlation between transaction recipients and memo payloads. The maximum number of distinct memos is precisely known."

ZIP 231 removes that correlation. An observer "now only knows upper bounds on the amount of memo data being conveyed, and the number of possible distinct memos", and cannot "distinguish between many recipients receiving many small memos, and the same set of recipients receiving one large shared memo."

What it introduces instead is a size signal. A wallet attaching an authenticated reply-to address exceeds 512 bytes and so "may be distinguishable from other ordinary wallet behaviour". The ZIP considered forcing every bundle to 16 chunks to hide that, and rejected it as "an unreasonable amount of waste in the case of ordinary transactions."

Its own summary is the fairest statement of the position: the change "eliminates a potential distinguisher along one axis in exchange for a potential distinguisher along another." Whether that is a good trade depends on how common large memos become, which nobody can know yet.

### Prunable means losable

Pruning is optional, which means storage of memo data becomes a choice made by whoever runs infrastructure. If most nodes prune, memo history survives only where someone deliberately keeps it.

That is a reasonable trade for node operators and a change in what users can assume. Today a memo is on the chain, permanently, for anyone who can decrypt it. After this, recovering an old memo from a fresh sync may depend on finding a node that chose to keep the bytes. Wallets should probably store their own memos rather than relying on the chain, and that expectation needs setting clearly.

### 16 KiB is a lot of room in a block

A single transaction can now carry 16 KiB of memo data. It is paid for, and pricing is the usual defence against abuse. But Zcash blocks are 2 MB, and ZIP 218 introduces action limits partly to bound the block processing rate and partly to cap what light clients must scan.

Memo chunks are not actions, so they are not covered by those limits. The ZIPs do answer this: ZIP 231 argues that capping a bundle at 16 KiB "limits the rate at which the chain size can grow cheaply", and ZIP 317 states that the fee for extra memo chunks "scales at the same rate as adding logical actions, so it isn't a cheaper mechanism for an adversary to bloat chain size". For scale, 16 KiB is under 1% of a 2 MB block. I still think the two limits deserve to be reasoned about together, since both are NU7 candidates, but the pricing answer exists.

### More complexity in every wallet

An inline memo field is trivial to implement. A key derivation, a shared bundle, individually encrypted chunks, selective decryption and a pruning path are not. Every wallet has to implement this correctly, including the padding rule, the trial decryption and the pruning path.

## Where this stands

ZIP 231 is a **Draft** and an NU7 candidate. The ZIP index still records that no decision has been made on which ZIPs NU7 includes, and the September poll backed shipping NU7 with whatever is ready by a 30 September readiness deadline, which puts pressure on every candidate that needs wallet work.

This one needs a lot of wallet work. It changes how every shielded output is constructed and read, so unlike a pure consensus tweak it cannot land usefully until wallets follow.

## Conclusion: ZIP 231 and the kilobyte nobody was using

ZIP 231 is the kind of proposal that looks like housekeeping and is actually a structural change.

The observation underneath it is almost embarrassing once stated: Zcash has been spending a kilobyte per shielded transaction on memo fields that are usually empty, because the memo was put inside the output. Move it out, address it with a key, and the same change makes memos smaller in the common case, larger when you want, shareable between recipients, and deletable by anyone who does not want to store them.

The cost is that memo data stops being uniform. Today every output looks identical in this respect. Afterwards, the size of a bundle says something about the sender. On a chain built to make transactions look alike, that is the trade worth arguing about.


As always, if this was useful, send it to someone building a Zcash wallet. They are the ones who have to implement it.

Next in the series: ZIP 2002, a small proposal that makes the transaction fee something you state rather than something implied by arithmetic.

## Sources

- ZIP 231: Memo Bundles. https://zips.z.cash/zip-0231
- ZIP 218: 25-second Block Target Spacing, for the action limits. https://zips.z.cash/zip-0218
- ZIP 317: Proportional Transfer Fee Mechanism. https://zips.z.cash/zip-0317
- ZIP index, for statuses and the NU7 candidate list. https://zips.z.cash/
- CoinDesk, "Zcash holders overwhelmingly back faster transactions and bitcoin-style halvings," 16 September 2026, for the NU7 readiness deadline. https://www.coindesk.com/tech/2026/09/16/zcash-holders-overwhelmingly-back-faster-transactions-and-bitcoin-style-halvings
