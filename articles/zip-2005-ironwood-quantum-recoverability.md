---
title: "ZIP 2005: Ironwood Quantum Recoverability"
series_number: 2
subtitle: "Your shielded ZEC is guarded by a hard maths problem. This ZIP is about what happens on the day somebody solves it."
zip: 2005
zip_status: Proposed
zip_category: Consensus
spec_url: https://zips.z.cash/zip-2005
tag: NU6.3
date: 2026-09-21
status: draft
disclosure: >-
  Researched with AI assistance, working from the ZIP text and the sources listed at
  the end. Every number, quotation and mechanism was checked against those sources in
  two further review passes. Any errors are the author's own.
corrections: []
cover: /covers/zip-2005-ironwood-quantum-recoverability/cover.svg
---

## The short version

Last time we looked at how your money gets into the Ironwood pool. This time, why the pool exists at all in the shape it does.

- Zcash's shielded protocols rest on one hard problem: finding discrete logarithms on an elliptic curve. Nobody knows how to do it. A large enough quantum computer would.
- If someone could do it, the damage is not that they read your balance. ZIP 2005 says such an adversary could "cause arbitrary inflation or steal users' funds," and that **a single discrete logarithm is sufficient**.
- The natural fix is to swap in post-quantum cryptography later. That alone does not work, and the reason is the interesting part of this ZIP.
- ZIP 2005 makes a small change to how notes are built in the Ironwood pool, so that if the old protocols ever have to be switched off, a future Recovery Protocol can still get your money out.
- Funds left in Sprout, Sapling or Orchard would not be recoverable. That is the sentence to take away.
- It does not make Zcash quantum-safe. The ZIP is explicit: it "does not by itself make the protocol secure against quantum adversaries."

## Setting the stage: the one problem everything rests on

A shielded Zcash transaction proves a set of statements without revealing them: that a note exists, that you own it, that you have not already spent it, that the sums balance. The proofs are built on elliptic curves, and their security reduces to the discrete logarithm problem. Given a point on a curve, work out which number produced it. Classically that is infeasible. Shor's algorithm, on a sufficiently large quantum computer, makes it tractable.

This is not a Zcash problem. It is most of public-key cryptography. What makes it sharper here is what the money looks like when the assumption fails.

In a transparent system, an adversary who breaks the curve can steal from the keys they attack. Bad, but bounded and visible. In a shielded pool, amounts are hidden, so forged value is invisible. ZIP 2005 puts the consequence plainly in its Motivation: an adversary able to compute discrete logarithms "could cause arbitrary inflation or steal users' funds."

Read that again with the emphasis the ZIP places on it: **one** discrete logarithm is enough. Not one per victim. To be precise, the ZIP says one logarithm on BLS12-381 covers Sprout and Sapling, and one on Pallas or Vesta covers Orchard and Ironwood. So: one per curve, not one per user.

![The discrete logarithm problem sits underneath proofs, commitments and nullifiers, so breaking it breaks all three](/figures/zip-2005-ironwood-quantum-recoverability/fig-1-foundation.svg "Figure 1. Everything in a shielded transaction stands on the same assumption. That is efficient, and it is also why a single break is so expensive.")

## The problem with just swapping in new cryptography

Here is the obvious plan. Quantum computers get close. Zcash upgrades to a post-quantum proof system. Everyone carries on.

ZIP 2005 explains why that plan fails, and this is the heart of the document.

A note commitment is a short value that stands in for a note. It has two properties you care about:

- **Hiding.** The commitment reveals nothing about the note inside it.
- **Binding.** Having committed, you cannot later claim the commitment was to a different note.

Binding is what stops forgery. If you can find two different notes with the same commitment, you can put a small note into the tree and spend a large one.

The ZIP's claim is specific: the Sapling and Orchard note commitment schemes are **not post-quantum binding**. They are computationally binding, and the computation in question is exactly the one that breaks. So consider the optimistic upgrade, done thoroughly. New proof system, believed post-quantum. The note commitment tree rebuilt from public information using a quantum-resistant hash. Surely that is enough?

The ZIP says no. Even then, it "would still be possible for a quantum or discrete-logarithm-breaking adversary to forge and spend notes that are not actually in the commitment tree" and so break the Balance property.

The old commitments are already on the chain. They are already forgeable by that adversary. Rebuilding the tree around them does not repair them, because the weakness is in the commitments themselves, not in the tree or the proofs above them. You cannot re-bind the past.

![A post-quantum proof system sits above commitments that are already forgeable, so it does not fix the problem underneath](/figures/zip-2005-ironwood-quantum-recoverability/fig-2-why-upgrade-fails.svg "Figure 2. Upgrading the proof system replaces the top layer. The Balance property breaks underneath it.")

That is why this ZIP exists, and why it targets note construction rather than proofs.

## An overview of ZIP 2005

ZIP 2005 is a Consensus ZIP with status Proposed, owned by Daira-Emma Hopwood and Jack Grigg, crediting Sean Bowe, Dev Ojha and Kris Nuttycombe. It shipped as part of NU6.3, the upgrade that opened Ironwood.

It has two halves, and only one of them exists today.

**The half that shipped**: a change to how Orchard-protocol notes are derived, applied to every note in the Ironwood pool. In the ZIP's words, it is "a small change." It is not only notes: essentially the same technique is applied to the function used to derive Orchard incoming viewing keys, and note plaintexts get a new lead byte. It required no change to the Orchard circuits "for the time being", which is a large part of why it could ship on this timeline. Recovery itself would be more expensive: the ZIP says it "would involve checking a more expensive and complicated statement in zero knowledge."

**The half that does not exist yet**: the Recovery Protocol. If the discrete-log-based protocols ever have to be disabled, this would be a new shielded protocol that lets holders recover funds from recoverable Ironwood notes. The ZIP is candid about its status: it "describes the Recovery Protocol in outline but not in detail: many of its design decisions are intentionally left open."

So the shipped part is not a defence. It is a **precondition**. It makes your notes the kind of thing a future rescue can operate on, and leaves the rescue itself to be designed later.

The ZIP is careful not to oversell this. It "does not by itself make the protocol secure against quantum adversaries," and is "a necessary and substantial step toward that goal."

![Today's change makes notes recoverable; the Recovery Protocol that would use them is still to be designed](/figures/zip-2005-ironwood-quantum-recoverability/fig-3-two-halves.svg "Figure 3. Half of ZIP 2005 is live. The half that saves your money is an outline.")

## How it works

### The change to notes

Orchard notes are derived through a chain of values: a nullifier seed, a random seed, the recipient's diversified address and public key, the value, and from those a commitment. ZIP 2005 alters that derivation so that an Ironwood note carries what a future Recovery Protocol would need in order to establish, without relying on discrete logarithms, that the note was genuinely created.

The design constraint that shaped it is worth noticing. The ZIP says the change "would not require any change to the Orchard-protocol (or proposed OrchardZSA-protocol) circuits for the time being." That qualifier matters: it is the Recovery Protocol, later, that would need the expensive circuitry. Instead the change rides along with the pool that was already being created for the Orchard soundness bug, which is why a quantum-hardening step arrived in the same upgrade as an unrelated emergency fix.

### What wallets are told to do

The specification is short and unusually direct:

> Once this proposal is deployed, wallets SHOULD move all of the funds they control (including transparent, Sprout, and Sapling funds) into recoverable Ironwood-pool notes as soon as practically possible.

Three details matter.

**"All of the funds they control."** Not just shielded funds. Transparent balances are named explicitly. The ZIP's condition is worth getting right: such an adversary could forge the ECDSA signatures used in scripts "provided that the public key has been revealed (i.e. if the address has been spent from previously, or if an attack is possible in the period between a transaction being exposed and it being confirmed)." So a never-spent address is not immediately open, but the moment you spend from it, it is.

**Receiving is mandatory, sending is a recommendation.** "Other wallets are REQUIRED, as part of supporting the NU6.3 upgrade, to be able to receive these notes." Moving funds is a SHOULD. Note that this is a requirement on wallet implementations written in a ZIP, not a consensus rule, so what it really buys is that a conforming wallet can always be paid in recoverable notes.

**It never finishes.** "Non-recoverable funds may be received after existing funds have been made recoverable. Wallets SHOULD therefore treat the movement of funds to recoverable notes as an ongoing process." Someone can pay you from an old pool tomorrow. Recoverability is a state you maintain, not a task you complete.

### What is not covered

The ZIP states the exclusion directly: recovery "would not be possible for funds still in the Sprout, Sapling, or Orchard pools; all such funds would be inaccessible after their respective protocols are disabled."

Not harder to recover. Inaccessible.

This is the line that connects ZIP 2005 to the migration we covered last time. ZIP 318 gives holders a privacy-preserving way to cross into Ironwood, and ZIP 2005 is the reason the crossing is worth making even for someone who is relaxed about the Orchard soundness bug.

![Ironwood notes can be recovered; Sprout, Sapling and Orchard funds would be inaccessible once those protocols are disabled](/figures/zip-2005-ironwood-quantum-recoverability/fig-4-recoverable-or-not.svg "Figure 4. The dividing line the ZIP draws. It is about which pool your money sits in, not how careful you are.")

## Why ZIP 2005? The case for making notes recoverable now

### It buys the one thing you cannot buy later

Every other part of a post-quantum transition can be done under pressure. Proof systems can be swapped, parameters regenerated, wallets updated. The one thing that cannot be done retroactively is changing how notes already on the chain were built. Value sitting in an old note on the day the protocol is disabled is value in a form that no future protocol can vouch for.

By shipping the note change early, the ZIP converts a future emergency into a migration people can do calmly, over months. The Motivation says as much: making the change well in advance "would provide time for users to move their funds to the Ironwood pool, keeping them safe and recoverable after a subsequent post-quantum transition."

### It was cheap enough to actually ship

Quantum-hardening proposals often die because their cost is enormous and their deadline is vague. This one needed no circuit change for now, so it could ride along with a pool that was being created anyway. The expensive part is deferred to the Recovery Protocol. Cheap proposals ship. That is not a cryptographic argument, but it explains why this one is live while more complete plans remain drafts.

### It is honest about what it is not

The ZIP repeatedly refuses to claim more than it does. It is "a necessary and substantial step," not a solution. For a change whose subject matter invites hype, the restraint is notable, and it makes the document easier to trust.

## Are there any drawbacks to implementing ZIP 2005?

### The half that saves you is not designed yet

The Recovery Protocol is an outline with "many of its design decisions are intentionally left open." Everything ZIP 2005 promises depends on a protocol that does not exist, has not been specified in detail, and has not been audited.

That is defensible sequencing. You cannot design the rescue before you know what the emergency looks like, and the note change had to ship first or it would be useless. But a holder should be clear about what they have: notes in a form that a future protocol *could* recover, and a commitment from nobody that such a protocol will be finished in time. Between now and then, the guarantee is intention.

### There is a window where recoverable funds are still at risk

The ZIP names an exposure the article above does not: if an adversary attacked spendability or spend authorization "before the switch to the Recovery Protocol, then it could affect the legitimate holder's ability to spend the funds afterward." It calls the gap between this ZIP activating and that switch "the critical exposure period for recoverable Ironwood-pool funds."

So being in Ironwood is necessary rather than sufficient. It puts you in the pool that has a recovery story, during a period where the story has not been written.

### It depends on people actually moving

The strongest recommendation in the ZIP is a SHOULD, and the people least likely to act are the ones with old, untouched balances. Long-dormant funds are exactly the funds most likely to still be in Sprout or Sapling when a deadline arrives, and their owners are the least likely to be reading ZIPs.

The migration data bears this out. Orchard's exit was driven by an urgent, well-publicised soundness bug with wallet prompts pushing users through it, and even then a tail remained. A quantum deadline with no visible symptoms will move people more slowly, not faster.

### The timeline is a judgement call nobody can check

"Well in advance" is doing a lot of work. Nobody knows when a cryptographically relevant quantum computer arrives, and estimates are wide enough to be unfalsifiable. Ship too early and you spend years of migration effort against a threat that stays theoretical. Ship too late and the work is worthless.

I do not think this is a criticism of the ZIP so much as an honest description of the position it is written from. It is worth stating plainly, because "quantum" is a word that invites both dismissal and panic, and the ZIP deserves neither.

### The transparent pool is the quiet problem

The specification names transparent funds first among what should move. Transparent balances have no shielded protocol to disable, no migration prompt, and no ZIP 318-style flow to move them privately. They sit in ordinary UTXOs protected by ordinary signatures.

The ZIP tells wallets to move them. It does not say how to do so without publishing the amounts, and a transparent-to-shielded transfer reveals value crossing the boundary in exactly the way we covered last time. There is at least work in the direction: the ZIP points to a separate proposal on "Quantum Recoverability for a Subset of Transparent Addresses", which is Reserved. It addresses recoverability rather than the privacy cost of moving, so the tension between the advice and the disclosure stands.

## Where this stands

ZIP 2005's status is **Proposed**, and the note change activated with NU6.3 at Mainnet block 3,428,143, on 28 July 2026 per CoinDesk's report of the activation. Ironwood notes created since then are built the new way.

The Recovery Protocol remains an outline. There is no deadline for it, because its deadline is set by physics and engineering elsewhere in the world.

The practical reading for a holder is short. If your ZEC is in Ironwood, it is in the only pool with a recovery story. If it is anywhere else, including a transparent address, ZIP 2005's view is that it should not stay there. That is the same advice ZIP 318 gives for a different reason, which is the strongest argument either of them makes.

## Conclusion: ZIP 2005 and the work that has to happen before the break

ZIP 2005 is a narrow change with an unusually large claim attached, and it mostly earns the claim by being careful about what it does not promise.

The insight worth carrying away is the one about binding. It is tempting to assume a post-quantum future is a matter of swapping algorithms when the time comes. This ZIP shows that for a shielded pool that is not true: commitments recorded under a broken assumption stay broken, and no amount of future cryptography re-binds them. The work has to happen before the break, or it does not happen at all.

What is live today is a change to how notes are made. What would save your money is a protocol still to be written. Holding both facts at once is the right way to read this one.


As always, if this was useful, send it to someone holding ZEC outside Ironwood. They are the people this ZIP is written for.

Next in the series: ZIP 218, the proposal to cut Zcash's block time from 75 seconds to 25, which coinholders backed with 99.9% of participating ZEC.

## Sources

- ZIP 2005: Ironwood Quantum Recoverability. https://zips.z.cash/zip-2005
- ZIP 318: Orchard to Ironwood Migration. https://zips.z.cash/zip-0318
- ZIP 258: Deployment of the NU6.3 Network Upgrade. https://zips.z.cash/zip-0258
- ZIP index, for statuses. https://zips.z.cash/
- CoinDesk, "Zcash Ironwood goes live," 28 July 2026, for the activation date. https://www.coindesk.com/tech/2026/07/28/zcash-seals-usd1-7-billion-shielded-pool-as-ironwood-upgrade-activates
- ZIPs For Nerds #1: ZIP 318 (Orchard to Ironwood Migration). https://zipsfornerds.com/research/zip-318-orchard-to-ironwood-migration
