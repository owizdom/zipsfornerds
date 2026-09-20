// The hero diagram: what goes into one article. Pure SVG, animated with CSS.
const nodes = [
  { x: 40, y: 34, w: 150, label: 'ZIP SPEC', sub: 'zips.z.cash' },
  { x: 330, y: 58, w: 150, label: 'OWNER REVIEW', sub: 'before publishing' },
  { x: 350, y: 232, w: 160, label: 'CASE AGAINST', sub: 'in every article' },
  { x: 70, y: 268, w: 170, label: 'CORRECTIONS', sub: 'logged in public' },
]
const centre = { x: 200, y: 140, w: 150, h: 60 }

export default function HeroDiagram() {
  const cx = centre.x + centre.w / 2
  const cy = centre.y + centre.h / 2
  return (
    <figure className="hero-diagram" data-section="hero-diagram">
      <svg viewBox="0 0 540 340" role="img" aria-label="What goes into a ZIPs For Nerds article: the ZIP spec, owner review, the case against, and public corrections">
        {nodes.map((n, i) => {
          const nx = n.x + n.w / 2
          const ny = n.y + 23
          const mx = (nx + cx) / 2 + (i % 2 ? 26 : -26)
          const my = (ny + cy) / 2
          return <path key={n.label} className="wire" style={{ animationDelay: `${0.25 + i * 0.12}s` }} d={`M${cx} ${cy} Q${mx} ${my} ${nx} ${ny}`} />
        })}
        {nodes.map((n, i) => (
          <g key={n.label} className="node" style={{ animationDelay: `${0.45 + i * 0.12}s` }}>
            <rect x={n.x} y={n.y} width={n.w} height="46" />
            <text x={n.x + n.w / 2} y={n.y + 20} className="n-label">{n.label}</text>
            <text x={n.x + n.w / 2} y={n.y + 35} className="n-sub">{n.sub}</text>
          </g>
        ))}
        <g className="node centre">
          <rect x={centre.x} y={centre.y} width={centre.w} height={centre.h} />
          <text x={cx} y={cy - 3} className="n-label">ONE ARTICLE</text>
          <text x={cx} y={cy + 13} className="n-sub">one ZIP</text>
          <circle cx={cx} cy={cy + 24} r="3" />
        </g>
      </svg>
      <figcaption>est. 2026 · one ZIP at a time</figcaption>
    </figure>
  )
}
