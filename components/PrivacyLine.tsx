import { analyticsEnabled } from '@/lib/analytics'

// The footer's privacy claim is derived from the analytics setting, so the site
// cannot promise "no trackers" while running one.
export default function PrivacyLine() {
  return (
    <p className="label terms" data-privacy={analyticsEnabled ? 'analytics' : 'none'}>
      {analyticsEnabled
        ? 'Articles CC BY 4.0 · Google Analytics measures page views · no ads, no profiling'
        : 'Articles CC BY 4.0 · no cookies · no trackers'}
    </p>
  )
}
