export default function LoadingSkeleton({ lines = 6 }) {
  const widths = ['w-full', 'w-5/6', 'w-4/5', 'w-full', 'w-3/4', 'w-5/6', 'w-full', 'w-2/3']

  return (
    <div className="space-y-3 py-2">
      <div className="flex items-center gap-2 mb-4">
        <div
          className="w-2 h-2 rounded-full animate-pulse-slow"
          style={{ background: 'var(--accent)' }}
        />
        <span className="text-xs font-mono" style={{ color: 'var(--accent)' }}>
          AI is thinking
          <span className="inline-block animate-[typing_1.2s_steps(3)_infinite]">...</span>
        </span>
      </div>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={`h-4 rounded-md shimmer-bg ${widths[i % widths.length]}`}
          style={{ animationDelay: `${i * 0.1}s` }}
        />
      ))}
    </div>
  )
}
