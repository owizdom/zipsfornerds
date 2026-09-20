---
title: 'ZIP 318: Orchard to Ironwood Migration'
series_number: 1
subtitle: >-
  How a Zcash wallet walks your money through a turnstile everyone can see,
  without showing anyone it was yours.
zip: 318
zip_status: Draft
zip_category: Wallet
spec_url: https://zips.z.cash/zip-0318
tag: NU6.3
date: 2026-09-20
status: published
disclosure: >-
  Researched and drafted with AI assistance (Claude), working from the ZIP text and
  the sources listed at the end. Every number, quotation and mechanism was checked
  against those sources in two further review passes. Any errors are the author's own.
corrections: []
cover: /covers/zip-318-orchard-to-ironwood-migration/cover.svg
---
## Welcome to ZIPs For Nerds

Public announcement: this is officially the first post in ZIPs For Nerds, a series that takes one Zcash Improvement Proposal (ZIP) at a time and explains it for people who want more than a headline and less than the formal specification.

The rules of the house are simple. Every article describes the problem a ZIP is trying to solve, walks through how the ZIP works, makes the case for it, and then (this part matters) gives the best arguments against it. Every claim is checked against the ZIP text and the sources listed at the end, and corrections are logged at the top of the page where you can see them.

I am starting with ZIP 318 because it is the ZIP most Zcash holders have already lived through without reading. If you opened a Zcash wallet after 28 July 2026 and found a prompt asking you to migrate your funds, ZIP 318 is the document that was meant to decide what happened next (whether your wallet actually followed it is a question I get to below). You clicked a button. Somebody spent weeks arguing about what that button should do. This article is about the argument.

## The short version

If you only have two minutes, here is ZIP 318 with the cryptography removed:

- In May 2026 a researcher found a flaw in the circuit behind Orchard, the shielded pool that still held about 3.7 million ZEC in mid-July. The flaw was fixed within days. What the fix could not do was prove that nobody had already used the flaw to counterfeit coins inside the pool.
- The answer was a new pool called Ironwood. ZEC moving from Orchard to Ironwood passes through a turnstile where the amount is public, so anyone can check that Orchard never pays out more than it took in.
- A public amount is a privacy problem. Move your whole balance in one transaction and you have published your balance.
- ZIP 318 tells wallets how to cross without doing that. Split the balance into standard amounts that many other wallets also use (1, 2, 5, 10, 20, 50 and so on). Send them one at a time at random moments over hours or days. Make every transaction look structurally identical to everyone else's.
- ZIP 318 is a Wallet ZIP and adds no consensus rules. No node will reject a wallet that ignores it. A good part of this article is about what that costs.

Still here? Good. Let's get into it.

## Setting the stage: a flaw, a sealed pool and a turnstile

Zcash keeps shielded money in pools. Sprout came first, then Sapling, then Orchard. Inside a pool the amounts, senders and receivers are hidden. The one thing the chain always shows is value crossing a pool's border: when ZEC enters or leaves a pool, the net amount is public. Hold on to that fact, because everything in ZIP 318 follows from it.

On 29 May 2026 Taylor Hornby, who had been asked to run an AI-assisted security audit of the Orchard shielded protocol, reported a soundness vulnerability in the implementation of the Orchard Action circuit. (A circuit is sound when nobody can get it to accept a false statement. This implementation left a gap, in one of its scalar multiplication gadgets, through which someone could. The protocol as specified was fine.) ZIP 257, which documents the response, says the flaw "could have allowed balance violation and theft of funds." In a pool where amounts are hidden, a forged proof is the worst kind of bug, because the coins it creates are invisible.

The response came in two steps, and the order mattered:

1. **Switch Orchard off.** An emergency soft fork, effective from Mainnet block 3,363,426, banned Orchard actions from transactions altogether. (A first attempt 60 blocks earlier failed because some mining pools had not upgraded in time, which tells you how fast this was moving.)
1. **Switch it back on, fixed.** The NU6.2 upgrade re-enabled Orchard with a corrected circuit. The ZIP index records NU6.2 activating at block 3,364,600 on 3 June 2026.

Why not ship the fix and the shutdown together? ZIP 257 gives two reasons: doing so risked revealing the vulnerability before it had been mitigated, and disabling first closed the window "more quickly, while the fix was still being prepared and reviewed."

![Timeline from the Orchard bug report on 29 May 2026 to the NU6.3 upgrade on 28 July 2026](/figures/zip-318-orchard-to-ironwood-migration/fig-1-timeline.svg "Figure 1. Sixty days from bug report to a new shielded pool. Heights from ZIP 257 and ZIP 258. The NU6.2 date is from the ZIP index and the NU6.3 date is from CoinDesk.")

That closed the hole going forward. It left a question about the past: had anyone used the flaw before it was found? Inside a shielded pool nobody can count the coins, so nobody could answer.

The turnstile is how Zcash answers questions like that. ZIP 209 has nodes track the total value that has entered and left each pool, and it makes any block that would push a pool's balance below zero invalid. In the ZIP's words: "If the total value that is unshielded exceeds the total value that was shielded for a given pool, a balance violation has occurred in the corresponding shielded transaction protocol." Orchard as a whole can never pay out more ZEC than was paid into it.

Be careful about what that buys you. The turnstile cannot tell an honest note from a counterfeit one as it leaves. What it gives everyone is a hard ceiling: the most that can ever come out of Orchard is what went in, and the balance of the new pool is exactly what was publicly counted into it. Shielded Labs describes the goal of sealing Orchard as letting anyone "verify the upper limit of how much ZEC can be used in the Orchard pool." That is a weaker promise than "the new pool is clean," and it is the honest one.

![Two shielded pools with a public turnstile between them](/figures/zip-318-orchard-to-ironwood-migration/fig-2-turnstile.svg "Figure 2. Inside a pool everything is hidden. The amount crossing between pools is public, and that is the point.")

NU6.3 built the new pool. It activated on Mainnet at block 3,428,143 (ZIP 258), on 28 July 2026 (CoinDesk's report of the activation). One detail worth knowing before we go further: Ironwood is a new pool that reuses an existing protocol. ZIP 258 describes it as "another use of the Orchard protocol." It runs an updated Action circuit, and its notes are built slightly differently (that second part is ZIP 2005, and it gets its own article). ZIP 258 also lists the rules that sealed the old pool:

- Coinbase transactions can no longer contain Orchard actions.
- No new value may enter the Orchard pool.
- Transfers between different addresses inside Orchard are disabled.

Value may still leave, "including across the turnstile into the Ironwood pool." ZIP 318 sums up the effect from a wallet's point of view: NU6.3 "disables ordinary payments within the old Orchard pool while still permitting change" and so requires wallets to add a way to migrate.

So Orchard became a room nobody can enter, where the only useful thing left to do is leave. Shielded Labs noted that about 3.7 million ZEC was sitting in it on 15 July 2026. All of it had to walk out through a counted exit, in public, one transaction at a time.

> "The amounts are publicly revealed in order to give a complete accounting to the public of how much ZEC has entered and exited which pools." (Zooko Wilcox and Taylor Hornby, Shielded Labs)

## The problem with walking through a turnstile

Meet Alice. After setting aside what she needs for fees, Alice has 123.45 ZEC in Orchard to migrate. (Yes, it is always Alice. She has been moving money around cryptography papers since 1978 and shows no sign of retiring.)

The simplest migration is one transaction that moves 123.45 ZEC to her own Ironwood address. Her address stays hidden. The amount does not. The chain now records that somebody moved exactly 123.45 ZEC at a specific block, and that number is Alice's entire balance.

It gets worse off-chain. Alice uses a phone wallet, which talks to a light wallet server. The server sees her IP address, sees which blocks she asks for, and sees her transaction arrive. ZIP 318 puts the combined risk plainly: if a wallet migrates the whole balance at once, "that amount, its timing, and (via network-layer metadata) potentially the user's IP address are all exposed at once, and the transfer can be correlated with the wallet's other activity."

"Fine," says Alice, "I will split it into random pieces." This sounds like a fix and is closer to the opposite:

- A piece worth 37.91826 ZEC matches nobody else's piece, so it works as a fingerprint.
- If the pieces add up to her balance, an observer who suspects her balance can search for the subset that sums to it.

There is also the adversary who plans ahead. Suppose Mallory sends Alice a payment of 0.31415926 ZEC (nobody said attackers lack a sense of humour), then watches the turnstile for that value or a sum containing it. ZIP 318 calls this tagging, and a migration design has to survive it.

![A naive single-transfer migration compared with a ZIP 318 migration spread over time](/figures/zip-318-orchard-to-ironwood-migration/fig-3-naive-vs-zip318.svg "Figure 3. Same money, two crossings. The top one publishes a balance. The bottom one publishes seven amounts that many other transfers also use.")

The ZIP describes the situation in one sentence that I think is the key to reading the rest of it. Because the crossing amount is always public, "the only privacy levers available to a wallet are the shape of the amounts it migrates and the timing of their broadcast." Two levers. That is all you get.

A mass migration cuts both ways. ZIP 318 notes that many people crossing in a short window "form an anonymity set," and that the same event is a risk "because an observer who can distinguish one user's transfers from the crowd learns a great deal."

There is a precedent. ZIP 308 defined a privacy-preserving migration from Sprout to Sapling, built around RPC operations on a full node. ZIP 318 adapts the idea to a harder setting: a phone, where the operating system decides when background work runs and the wallet's view of the chain comes from a server that may be watching.

## An overview of ZIP 318

ZIP 318 is a Wallet ZIP. It says what a wallet SHOULD and MUST do to be considered conforming, and it changes nothing about which transactions the network accepts. Its owners are Schell Carl Scivally, Pacu Gindre and Kris Nuttycombe, and its status is Draft.

The procedure has two phases:

1. **Note preparation.** The wallet decides which standard amounts it will migrate and rearranges the user's Orchard notes, privately, so that one note of exactly the right size exists for each planned transfer.
1. **Scheduled migration transactions.** The wallet signs every migration transaction in advance, then broadcasts them one at a time, at randomly drawn block heights, from background tasks.

![The two phases of a ZIP 318 migration: private note preparation, then scheduled public transfers](/figures/zip-318-orchard-to-ironwood-migration/fig-4-two-phases.svg "Figure 4. Phase 1 happens entirely inside Orchard and reveals no amounts. Phase 2 is where amounts become public, so that is where all the care goes.")

The ZIP lists six privacy properties the default flow should preserve, to the extent the platform allows:

- **Transfer unlinkability.** An observer cannot group one wallet's transfers together.
- **Behavioural de-correlation.** Broadcasts do not reveal when the user opens the app or when the wallet synced.
- **Balance privacy.** No transfer, and no visible set of transfers, reveals a wallet's total balance.
- **Note-distribution privacy.** The sizes of the wallet's individual notes stay hidden.
- **Holdings-concentration privacy.** The migration does not reveal how many people hold Orchard funds or how those funds are distributed among them.
- **Migration-status privacy.** An adversary who knows the values of notes a wallet received, including one who sent tagged notes on purpose, cannot tell whether or when those funds migrated.

The list of things the ZIP declines to promise is as informative. A migration in progress does not have to be resumable on another device or after a restore from seed. Background execution is best-effort. Network anonymity is offered and not mandated. And the ZIP does not claim the procedure leaks nothing, only that migration transactions are hidden among all the Orchard to Ironwood spends that share the same shape.

## How ZIP 318 works

### Consent comes first

When a wallet sees a spendable Orchard balance around NU6.3, it should surface a dedicated migration screen, and that screen MUST display the Orchard balance at risk. The wallet should offer two paths: migrate immediately, in a single transfer with minimal privacy, or migrate with privacy. Before any funds leave the Orchard pool, the wallet MUST show the full proposed schedule and get the user's confirmation. After that, individual transfers go out on schedule without asking again. The ZIP also tells wallets to keep the number of privacy settings small, because most users cannot be expected to tune them.

A subtle point for the careful reader. ZIP 315, the wallet best-practices ZIP, says "there should be per-transaction opt-in for any transfer that publically reveals amounts on chain." ZIP 318 treats one confirmation of the whole schedule as that consent. I think that reading is reasonable (nobody wants twenty pop-ups). It is ZIP 318's interpretation, though, and worth knowing as such.

### Choosing amounts: the 1-2-5 rule

Every migration transaction moves one denomination, and the permitted denominations are 1, 2 or 5 times a power of ten, in ZEC. The smallest is 0.01 ZEC and the largest is 10,000 ZEC. If the series looks familiar, check your wallet (the leather one). It is the same pattern many currencies use for banknotes.

The wallet breaks the balance down digit by digit. A 9 becomes 5, 2, 2. An 8 becomes 5, 2, 1. A 4 becomes 2, 2. The ZIP's own worked example happens to be Alice's number: 123.45 ZEC becomes 100, 20, 2, 1, 0.2, 0.2 and 0.05. A holder with 25,000 ZEC gets 10,000, 10,000 and 5,000.

![The balance 123.45 ZEC broken digit by digit into seven standard denominations](/figures/zip-318-orchard-to-ironwood-migration/fig-5-quantization.svg "Figure 5. Canonical quantization of 123.45 ZEC. Every output is a value that many other wallets will also emit.")

Two details complete the picture. Whatever is left below 0.01 ZEC is the residual, and it stays behind in Orchard. And the fee rides on top of each part: the note that funds a 20 ZEC transfer is worth 20 ZEC plus the fee, so exactly 20 ZEC arrives in Ironwood. (That is why I said Alice has 123.45 ZEC after setting fees aside. A wallet holding exactly 123.45 ZEC would migrate slightly less, and the last digits of the breakdown would change.)

The default breakdown is a pure function of the balance. Feed in the same balance and you get the same parts, every time, on any device. That turns out to be useful when things go wrong, and I come back to it under error handling below.

A wallet may also randomise the breakdown, now and then picking a 2 or a 1 where the greedy rule would pick a 5. The ZIP's provisional odds, when all three options are open, are 10% for the 1 and 25% for the 2. Randomising changes which standard amounts appear. It never produces a non-standard amount.

### Note preparation

A migration transaction spends exactly one Orchard note, so the wallet first needs one note per part, each worth its denomination plus the fee. Alice's funds probably do not look like that. They are whatever notes her payment history left her with.

Note preparation fixes this with one or more send-to-self transactions inside Orchard. They are fully shielded, so the amounts and the rearranging are invisible.

Each preparation transaction should contain exactly 16 Orchard actions, padded if needed. If you know classic Orchard, you may expect a 16-action bundle to carry up to 16 spends and 16 outputs. Under NU6.3 it does not. The ZIP explains that each spend and each output "is paired with a fabricated counterpart under NU6.3," which makes a bundle's action count the sum of its spends and outputs. A 16-action transaction can therefore consume and produce at most 16 notes in total: 15 spends and one output when consolidating, for example, or one spend and 15 outputs when splitting.

A wallet with many small notes, or one note that has to split into more than 15 funding notes, needs several layers of preparation. The ZIP points out that the number of layers grows with the logarithm of the note count (base roughly 15), and that on-chain a holder splitting one huge note looks the same as a user sweeping up dust.

Even these hidden transactions should be spaced out. The gap between one preparation transaction and the next is drawn from an exponential distribution with a mean of 16 blocks (about twenty minutes), and any draw above 96 blocks is thrown away and redrawn. The reason: a burst of identical sixteen-action transactions would form a recognisable cluster and announce that a migration is about to begin.

### The canonical migration transaction

A conforming migration transaction should follow one template (the ZIP's word is SHOULD, for every item):

- exactly one Orchard spend, with the Orchard bundle padded to exactly two actions;
- exactly one Ironwood output, carrying one standard denomination, in a single-action bundle with no padding;
- no transparent inputs or outputs, and no spends from any other pool;
- the canonical fee, provisionally the ZIP 317 minimum. With two Orchard actions and one Ironwood action that is three logical actions at 5,000 zatoshis each, so 15,000 zatoshis;
- lock_time of zero, and nothing else that could set the transaction apart.

![The canonical migration transaction: a two-action Orchard bundle and a single-action Ironwood bundle](/figures/zip-318-orchard-to-ironwood-migration/fig-6-canonical-transaction.svg "Figure 6. One spend, one possibly-empty output, one Ironwood output. If your wallet builds anything else, it is standing outside the crowd.")

The two-action Orchard bundle is one spend action and one output action, and an observer cannot tell whether that output carries change or a zero-valued dummy. The single action on the Ironwood side is unpadded on purpose. There is nothing left to hide on that side, a padding action would cost an extra proof, and the ZIP singles out hardware wallets, where proving data has to cross a slow link. What matters, the ZIP says, is that "one action count is pinned as canonical," because optional padding would split wallets into two visibly different groups.

Expiry heights get the same treatment. The wallet takes the scheduled broadcast height, rounds it down to a multiple of 34,560 blocks (thirty days at 75-second blocks), and adds 69,120. Every migration transaction scheduled in the same thirty-day window, from any wallet, carries the same expiry. The ZIP works the first case: NU6.3 activated at 3,428,143, so every transfer scheduled before block 3,456,000 expires at 3,490,560.

### Anchors, buckets and cohorts

A shielded spend proves that its note exists in the note commitment tree as of some earlier block. That reference point is the anchor. A wallet normally anchors near its latest synced block, and that is a leak, because the anchor then tells an observer roughly when this wallet last synced.

ZIP 318 replaces personal anchors with shared ones. Boundaries are the blocks whose height divides evenly by 144, which comes to one every three hours. A migration transaction MUST anchor to a boundary that is after NU6.3 activation and at or after the block where its funding note was created.

The wallet picks among the eligible boundaries at random, weighted toward recent ones. The anchor's age, counted in boundaries back from the newest one the wallet has seen, is drawn from a geometric distribution with parameter one half, starting at one. So the newest boundary is never used, and the likeliest choice is the one before it. Draws above the cap of four are thrown away and redrawn.

![Odds of choosing each anchor boundary: about 53, 27, 13 and 7 percent for ages one to four](/figures/zip-318-orchard-to-ironwood-migration/fig-7-anchor-buckets.svg "Figure 7. Anchor selection. The odds shown are my own arithmetic from the ZIP's rule: a geometric draw with parameter one half, redrawn above the cap of four.")

A note for the ZIP's owners, offered with respect. The text says "the mean age is two boundaries (about six hours)." That is the mean of the untruncated distribution, and it was accurate to four decimal places while the cap was 16. With the cap of four applied, I get 26/15, or about 1.7 boundaries (roughly five hours), so the sentence looks like a leftover from the timing change I describe in the drawbacks section. Separately, the text has listed the newest observed boundary in the candidate set, and then excluded it in the draw, since the first merged version. Neither point changes how a wallet behaves.

All transactions sharing a boundary form a cohort, and a wallet is allowed to place several of its parts in one cohort. Standard amounts make that safe. Three 100 ZEC transfers in one cohort could belong to one wallet or to three, and nothing on-chain says which.

### Scheduling

The wallet shuffles its parts into a random order, so that the sequence of amounts says nothing about progress. (A largest-first order would let an observer guess how far along a wallet is.) It then assigns each part a broadcast height by adding random gaps. Each gap is drawn from an exponential distribution with a mean of 66 blocks, about 82 minutes, and draws above 576 blocks (twelve hours) are redrawn. All randomness has to come from a cryptographically secure generator.

The exponential distribution is chosen for a specific property. It is memoryless, so seeing one of Alice's broadcasts tells an observer nothing about when her next will come. The rationale adds that independent Poisson processes merge into a single Poisson process, which means the combined traffic of every conforming wallet cannot be separated back into individual wallets by timing.

How long does Alice wait? Seven parts at an average of 82 minutes each is about ten hours. There is also a mandatory pause before the first transfer: the schedule MUST start no earlier than one full three-hour bucket past the first boundary at or after the creation of her funding notes, which adds somewhere between three and six hours. Add preparation and a realistic expectation is most of a day. The ZIP says as much about large holders: duration grows at roughly one mean delay per part.

One piece of machinery makes this workable. Under the version 6 transaction format that arrived with NU6.3, the anchor is committed as authorizing data and sits outside the signature hash. The wallet can therefore sign the entire schedule in one session, and attach or refresh each transaction's anchor and proof later, near broadcast time, without asking for another signature. Under the version 5 rules the anchor was fixed at signing, and the gap between anchor age and broadcast height would have revealed when the schedule was prepared.

### Keeping sync and broadcast apart

Syncing reveals things to the light wallet server. Broadcasting reveals a transaction. If both happen in the same session, the server can pair them. So ZIP 318 says a single background window MUST be used either to sync and update proofs or to broadcast, never both.

![Background windows alternate between syncing and broadcasting and never do both](/figures/zip-318-orchard-to-ironwood-migration/fig-8-sync-vs-broadcast.svg "Figure 8. One job per window. It is the cheapest rule in the ZIP and one of the most important.")

Phones complicate this. iOS and Android decide when background tasks run, and some Android vendors suppress them even with permissions granted. The ZIP treats scheduling as best-effort throughout. A slip of up to about two hours counts as normal. If a window is missed, the wallet catches up when the user next opens it, under two conditions: it should disclose that sending at app-open time weakens privacy for that transfer, and it MUST NOT send more than one overdue transfer per open, because several public amounts in one session leak balance. Product copy is not supposed to call the migration automatic or guaranteed, and the catch-up prompt must not look like an error.

### Network-layer privacy

Before the schedule is committed, the wallet MUST present a network privacy step. It MUST offer Tor and, if available, Nym, and route all migration broadcasts through the chosen network when enabled. If neither works in the user's region, it should suggest a trusted VPN. The user may decline all of them. The wallet MUST show a disclaimer explaining that a server or network operator can match the broadcasting IP address to the public crossing, and that reused IPs may leak the wallet's total Orchard balance to the server operator.

### When things go wrong

The error-handling section covers the cases you would expect. A failed broadcast keeps its pre-signed transaction and retries. If the user spends Orchard funds outside the migration and invalidates a queued transfer, the wallet MUST detect it, MUST tell the user, and MUST rebuild the schedule for what remains. An expired transaction is rebuilt with a fresh anchor and expiry and the same denomination. If the canonical fee changes between preparation and broadcast, the affected parts should be rebuilt, or the remaining balance prepared again.

This is where the pure-function breakdown earns a mention. After a reinstall, or a restore on a new device, the local schedule is gone. Because every migration transaction has the canonical shape, the wallet can use its viewing keys to see which standard amounts have already landed in Ironwood, and it may then start a fresh migration for whatever remains. (Notes that already have standard values should be left out of the recomputed balance and spent directly.) The authors considered going further with a fully stateless design, which the deterministic breakdown would have made robust, and decided against it because persisted, pre-signed transactions make the timing protections much easier to get right.

> "The security analysis of migration strategies is subtle, and the more obvious strategies leak significant information ..." (ZIP 318, Motivation)

## Why ZIP 318? The case for the design

### Collision beats randomness

The most useful idea in the ZIP runs against instinct. When an amount has to be public, an unpredictable amount is the wrong goal. Privacy comes from collision, meaning many wallets emitting the same value, and from ambiguity about which values belong together. The ZIP says a high-entropy random amount "collides with no other wallet and is a near-unique fingerprint."

The rejected alternatives show how the authors got there:

- Random amounts per transfer were ruled out as fingerprints.
- A random partition of the balance was ruled out because the pieces sum to the balance and invite subset-sum reconstruction.
- An earlier design used whole-ZEC parts plus a leftover below 1 ZEC, and the leftover turned out to be the problem: a rare value that made it dangerous to put two parts in the same cohort.

The ZIP records that last design as "Superseded by canonical-only quantization, which has no remainder output." Every emitted value is one that other wallets emit too.

### It survives tagging

Go back to Mallory and the 0.31415926 ZEC. Three mechanisms defeat the plan. Migrated amounts come from the standard set whatever the funding notes were worth, so the tagged value never appears at the turnstile, and any tail below 0.01 ZEC stays in Orchard as residual. Note preparation is fully shielded, so nobody sees the tagged note being consumed. And if the wallet randomises its breakdown, even someone who knows Alice's exact balance cannot predict which amounts she will emit. What Mallory keeps is population-level information: some wallets migrated during some period. Not much of a return on a pi joke.

### One signing session

Exact-value funding notes look like a privacy feature and are really an operational one, which the ZIP states openly. They let every part be funded independently, so the whole schedule can be signed once and broadcast in any order. Shielded Labs spells out what the alternative looks like for hardware wallet users under its own sign-each-transaction strategy, for a balance in the low thousands of ZEC: they would have to "manually approve each of the roughly 25 or more migration transactions on their hardware device." One session is kinder.

### The crowd includes people who never heard of ZIP 318

A canonical migration transaction is built to look like an Orchard to Ironwood spend made by hand, with one condition the ZIP is careful to state: the match holds for manual spends "to the extent that they are built to this same single-action shape, which wallet builders are encouraged to use for this transfer form." Since NU6.3 disabled ordinary payments inside Orchard, those crossings make up essentially all remaining Orchard activity. The crowd a migration transaction hides in is therefore every conforming cross-pool spend on the network, which is larger than the set of wallets running this flow.

### The worst case is no worse

The alternative the authors considered was a guided flow that creates each transfer when the user opens the app. It was dismissed because every broadcast would coincide with an app open and with the scan requests the server already sees. The scheduled design can fail, if background tasks never run and the user sends everything from the catch-up prompt. In that case it performs like the guided flow. When the background tasks do run, it performs much better.

## Are there any drawbacks?

I promised the best arguments against. Here they are, and most of them come from people who worked on the migration.

### It is slow, and the ZIP has already been changed because of it

The first merged version of ZIP 318 used a mean gap of 144 blocks between transfers, about three hours. One day after activation, Dev Ojha opened a pull request to shorten it, "based on observed migration rates and user impatience feedback," crediting the Vizor wallet team for the analysis and CipherScan's Kenbak for the migration data. It was merged three days after activation. The change cut the mean transfer gap to 66 blocks, cut the mean preparation gap from 24 blocks to 16, and cut the anchor age cap from 16 boundaries (about two days) to 4.

One part of that proposal did not survive review. It would have allowed wallets to anchor at the most recent boundary, to mix scheduled transfers with manual ones. Kris Nuttycombe, one of the ZIP's owners, objected that this "would allow strong IP correlations by light wallet servers between scan time and transmission time, when the transmission time is close to a boundary," and that on iOS it would cause a lot of missed schedules. The published text keeps the minimum age at one.

I read that exchange as the design's central tension made visible, within days of launch. Every hour of delay buys privacy and costs patience. In my view, a user who loses patience and presses "migrate immediately" gets the worst outcome the ZIP allows, and thins the crowd for everyone else while doing it.

### The network layer may matter more than everything above

Zooko Wilcox and Taylor Hornby of Shielded Labs published a threat model for the migration while ZIP 318 was in review. Its first recommendation is blunt. They recommend "one primary defense: strengthen network-level privacy (i.e. using an appropriately configured Nym or Tor relay) before migration, to protect users from having their balances linked with their identity." Mixing concurrent migrations by amount and timing, which is most of what ZIP 318 specifies, is their secondary defense.

Their document includes its own, slightly different, algorithm for amounts and timing in an appendix. Zooko's comment on the ZIP 318 pull request says of that appendix that it is "much less important for practical protection of real users than the other parts" (the emphasis on "much less important" is his). He was talking about their algorithm. I will let you decide how far the remark travels.

Their reasoning is that the attack most likely to hurt someone is a server or network observer linking an IP address to an approximate balance, and that no choice of amounts prevents it. They also set a higher bar than routing broadcasts through Tor. To make identifying information unlinkable, they argue, a wallet would also need to download compact blocks over Tor or Nym, query transparent addresses at randomised times, and create fresh Tor circuits for unlinkable operations, each with a cost to user experience.

ZIP 318 requires wallets to offer network privacy and to warn users. It stops short of requiring anyone to use it. The wording of even that requirement is unsettled: an issue opened by zancas on 23 July 2026, still open as I write, asks whether "MUST offer Tor and (if available) Nym" makes Tor mandatory for every wallet, given that the requirements section lists "Tor, VPN, or Nym" as alternatives.

### Does every wallet really have to look the same?

ZIP 318 leans yes. The canonical shape is a SHOULD, and the ZIP allows a different amount-selection strategy "provided it achieves the same effect." Its rationale is firm, though: the shape exists to unify the anonymity set, and optional differences partition it.

Shielded Labs says probably not. In the same pull request comment, Zooko writes that "we currently think that it is not necessary for all or many wallet implementations and users to use compatible (indistinguishable on the blockchain) migration transactions" (he stressed the "not"), and gives that as another reason their appendix matters less than the rest. Their threat model makes the argument for hardware wallets: a different strategy lets an attacker split the traffic into groups, "but partitioning the traffic does not necessarily enable him to overcome the defenses and violate the security invariants." Their view is that a small cohort of users who start together, behind strong network privacy, may protect each other well enough.

This matters because wallets have in fact diverged. CipherScan's tracker, when I checked it on 20 September 2026, listed four entries as ZIP 318 compliant: Vizor, ZODL on iOS and on Android, and zcash_pool_migration, the Rust library in librustzcash that ZODL uses. (CipherScan labels that library the reference implementation of ZIP 318. Its own README calls it "A backend-agnostic engine for migrating Zcash wallet funds between value pools.") It described Zkool's desktop wallet as "Private migration, not ZIP-318: separate splitting and migration phases, privacy-first note selection, and a speed slider." (A privacy and speed slider is one of the alternatives ZIP 318 explicitly rejected.) Brave and Edge were listed as unknown. Separately, an issue filed against Brave's codebase on 14 September 2026 reports that its migration code pads the Ironwood bundle to two actions where the ZIP specifies one, which would cost a one-spend transaction 20,000 zatoshis where the canonical transaction pays 15,000.

If ZIP 318 is right, each of these differences shrinks somebody's crowd. If Shielded Labs is right, it matters much less than whether those users turned on Tor. I have not seen the question settled.

Two smaller points belong here. The ZIP is still a Draft, and its own reference implementation section is still a TODO, even though working code exists (the zcash_pool_migration crate above). The ZIP should link it. And the design is stateful: the schedule and the pre-signed transactions live on one device.

### Large holders get the weakest protection

The 10,000 ZEC cap bounds how rare any single transfer can be, and a large balance still shows. The ZIP accepts that "Total part count and migration duration for very large balances loosely indicate bucketed magnitude," says plainly that "Whales remain weakly protected," and expects some to choose a single transfer for the sake of speed. It defends that as deliberate, on the grounds that forcing large holders through a long process would hurt adoption and shrink the crowd.

Shielded Labs goes further and questions whether hiding the distribution of wealth should be a goal at all. Their document separates two failures. An attacker learning that a specific IP address holds about a million ZEC puts a person at risk. The public learning that some unidentified wallet holds a million ZEC does not, and they suggest that it might even benefit Zcash for that distribution to be known. ZIP 318 lists holdings-concentration privacy among its invariants. The two documents disagree here as well.

### A question about NU7

This one is my own question, and I have not seen it discussed.

ZIP 318 expresses almost all of its timing in blocks, and gives the wall-clock equivalents for 75-second block spacing. In the NU7 coinholder poll, which closed on 14 September 2026, 99.9% of participating ZEC backed cutting the block target to 25 seconds. ZIP 218 is the proposal that specifies that change. (The ZIP index still says no decision has been made on which ZIPs NU7 will include, so treat this as likely and not final.)

If that activates while migrations are still running, here is what the arithmetic says:

- The mean gap between transfers, 66 blocks, shrinks from about 82 minutes to about 27.
- The anchor bucket, 144 blocks, shrinks from three hours to one.
- The expiry window, 34,560 blocks, shrinks from thirty days to ten, so the ZIP's promise of "between one and two months of validity" would no longer hold. (An owner could fairly answer that the ZIP defines EXPIRY_MODULUS as "the number of blocks corresponding to 30 days," so the number rescales by definition. The code in librustzcash carries it as a fixed constant, which is why I think the question is worth asking out loud.)

ZIP 218 rescales node constants that represent durations. I searched its text and found no mention of ZIP 318 or of wallet migration constants. The ZIP's own rationale warns against delays that are short relative to the bucket interval, and both would shrink together, so that ratio survives. The absolute spread of a wallet's transfers over time would not. One person is well placed to sort this out: Dev Ojha co-owns ZIP 218 (with Evan Forbes) and also wrote the pull request that retuned ZIP 318's timing.

> "If you get on a bus all by yourself, you'll be revealing your balance ..." (Zooko Wilcox and Taylor Hornby, Shielded Labs)

## Where the migration stands

When I checked CipherScan's Ironwood tracker on 20 September 2026, at block 3,489,725, it showed 3,223,060 ZEC migrated from Orchard into Ironwood, which it reports as 88.7% of the Orchard supply, carried by 22,886 transactions. 410,123 ZEC was still in Orchard.

![Bar showing 88.7 percent of the Orchard supply migrated to Ironwood and 11.3 percent remaining](/figures/zip-318-orchard-to-ironwood-migration/fig-9-migration-progress.svg "Figure 9. Orchard's exit, as of 20 September 2026. Source: CipherScan. Ironwood's own balance, about 3.97 million ZEC, is a different number: roughly 4.55 million ZEC has entered it from all sources (Orchard, the transparent pool, Sapling and coinbase rewards) and roughly 0.58 million has since left.")

The rush is over. Those 22,886 transactions work out to about 420 a day across the 54 days since activation. The tracker counted 200 in the previous 24 hours.

That tail matters for anyone who has not migrated yet. The design depends on a crowd, and the crowd is thinning. The ZIP's own analysis notes that in the first days after activation privacy rested "on cohort size" because every migrating wallet shared the same few anchors. Latecomers still draw from the same small window of recent anchors. My reading is that what they lack is company inside each cohort, and that for a late migrator the Shielded Labs advice about network-level privacy carries more weight than it did in July.

## Conclusion

ZIP 318 is a careful answer to a narrow question: if an amount must be public, how do you keep it from pointing at you? Its answer is to stop trying to be unpredictable and start trying to be common. Standard amounts, a standard transaction shape, shared anchors and shared expiry heights all push in one direction, which is making one wallet's transfers look like everyone's.

Its limits are the ones its authors and reviewers named. It is slow enough that its timing was retuned within days of launch, citing user impatience. It protects large holders least. It asks wallets to build structurally identical transactions while the ZIP is still a Draft, and some have not. And the researcher who found the original bug, together with his co-author, thinks the network layer deserves more attention than the arithmetic.

If you still hold ZEC in Orchard, the practical reading is short. Use a wallet that CipherScan lists as ZIP 318 compliant, choose the private migration, turn on Tor or Nym when the wallet offers it, and let the schedule run. Then go outside. It will take a while.

I will close with a request: if this helped, send it to one person who holds ZEC and has never opened a ZIP. And if you own ZIP 318 and I have something wrong, tell me. The corrections log at the top of this page is there to be used.

Next in the series: ZIP 2005, Ironwood Quantum Recoverability, and what it means for a note to be recoverable after the cryptography under it breaks.

## Sources

- ZIP 318: Orchard to Ironwood Migration. https://zips.z.cash/zip-0318
- ZIP 257: Deployment of the Orchard Temporary Vulnerability Mitigation and NU6.2 Network Upgrade. https://zips.z.cash/zip-0257
- ZIP 258: Deployment of the NU6.3 Network Upgrade. https://zips.z.cash/zip-0258
- ZIP 209: Prohibit Out-of-Range Chain Value Pool Balances. https://zips.z.cash/zip-0209
- ZIP 317: Proportional Transfer Fee Mechanism. https://zips.z.cash/zip-0317
- ZIP 308: Sprout to Sapling Migration. https://zips.z.cash/zip-0308
- ZIP 315: Best Practices for Wallet Implementations. https://zips.z.cash/zip-0315
- ZIP 218: 25-second Block Target Spacing. https://zips.z.cash/zip-0218
- ZIP index: settled network upgrade (NU6.2 height and date) and NU7 candidate list. https://zips.z.cash/
- Zooko Wilcox and Taylor Hornby, Shielded Labs, "Threat Model: migrating user funds from Orchard to Ironwood." https://docs.google.com/document/d/1z4Aj7tO34RKk0SXZYkNXtswxdBXKbR_IJ_Xw5EJljkc
- zcash/zips pull request 1317, "[ZIP 318] Orchard to Ironwood migration" (Zooko's comment, 15 July 2026). https://github.com/zcash/zips/pull/1317
- zcash/zips pull request 1343, "ZIP 318: Shorten migration timing" (opened 29 July 2026, merged 31 July 2026). https://github.com/zcash/zips/pull/1343
- zcash/zips issue 1341, on the Tor and Nym wording (open). https://github.com/zcash/zips/issues/1341
- zcash_pool_migration, the migration engine in librustzcash. https://github.com/zcash/librustzcash/tree/main/zcash_pool_migration
- brave/brave-browser issue 58958, migration fee overpayment from extra bundle padding. https://github.com/brave/brave-browser/issues/58958
- CipherScan, Ironwood upgrade and migration tracker (pool balances, sources of Ironwood ZEC, wallet compliance table). https://cipherscan.app/ironwood
- CoinDesk, "Zcash Ironwood goes live, here's everything to keep track of," 28 July 2026. https://www.coindesk.com/tech/2026/07/28/zcash-seals-usd1-7-billion-shielded-pool-as-ironwood-upgrade-activates
- Zcash Labs, NU7 coinholder vote page (snapshot and closing dates). https://zcashlabs.org/voting
- CoinDesk, "Zcash holders overwhelmingly back faster transactions and bitcoin-style halvings," 16 September 2026. https://www.coindesk.com/tech/2026/09/16/zcash-holders-overwhelmingly-back-faster-transactions-and-bitcoin-style-halvings
