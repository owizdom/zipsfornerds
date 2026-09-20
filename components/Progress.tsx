'use client'

import { useEffect, useRef } from 'react'

// Reading progress bar on the right edge, as a thin vertical gold line.
export default function Progress() {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      const ratio = max > 0 ? window.scrollY / max : 0
      if (ref.current) ref.current.style.transform = `scaleY(${Math.min(1, Math.max(0.04, ratio))})`
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => { window.removeEventListener('scroll', update); window.removeEventListener('resize', update) }
  }, [])
  return <div className="progress" aria-hidden="true"><div ref={ref} /></div>
}
