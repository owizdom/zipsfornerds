// Analytics is opt-in and off by default.
//
// Set NEXT_PUBLIC_GA_ID (a "G-..." measurement ID) to switch Google Analytics on.
// Google Analytics is a third-party script that sets cookies, so turning it on also
// changes what the footer is allowed to claim (see components/PrivacyLine.tsx) and
// is the one exception to the site's zero-third-party-request rule. The test suite
// enforces that the claim and the reality always agree.
export const gaId = process.env.NEXT_PUBLIC_GA_ID?.trim() || ''
export const analyticsEnabled = gaId.startsWith('G-')
