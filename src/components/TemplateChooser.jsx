// components/TemplateChooser.jsx
import { useState } from 'react'
import { CheckCircle2, Eye } from 'lucide-react'
import { TEMPLATES } from './ResumeTemplate'

export default function TemplateChooser({ selected, onChange, onPreview }) {
  const [hovered, setHovered] = useState(null)

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-mono font-medium" style={{ color: 'var(--text-muted)' }}>
          Choose Template
        </span>
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
          {TEMPLATES.find(t => t.id === selected)?.label}
        </span>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {TEMPLATES.map(t => {
          const isSelected = selected === t.id
          const isHovered  = hovered === t.id
          return (
            <button
              key={t.id}
              onClick={() => onChange(t.id)}
              onMouseEnter={() => setHovered(t.id)}
              onMouseLeave={() => setHovered(null)}
              className="relative flex flex-col items-center gap-2 rounded-xl p-2 transition-all duration-200"
              style={{
                background: isSelected ? 'var(--accent-glow)' : isHovered ? 'var(--bg-secondary)' : 'transparent',
                border: `1.5px solid ${isSelected ? t.accent : isHovered ? 'var(--border)' : 'var(--border)'}`,
                transform: isSelected ? 'scale(1.04)' : 'scale(1)',
              }}
            >
              {/* Mini resume thumbnail */}
              <div
                className="w-full rounded-lg overflow-hidden relative"
                style={{
                  aspectRatio: '0.707',
                  background: t.id === 'executive' ? '#fafaf8' : '#fff',
                  border: '1px solid rgba(0,0,0,0.08)',
                }}
              >
                <TemplateThumbnail template={t} />
              </div>

              {/* Label */}
              <div className="text-center">
                <div
                  className="text-xs font-medium leading-tight"
                  style={{ color: isSelected ? t.accent : 'var(--text-secondary)' }}
                >
                  {t.label}
                </div>
              </div>

              {/* Selected badge */}
              {isSelected && (
                <div
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center"
                  style={{ background: t.accent }}
                >
                  <CheckCircle2 size={11} color="#fff" />
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* Subtitle of selected */}
      <div
        className="text-center text-xs mt-2"
        style={{ color: 'var(--text-muted)' }}
      >
        {TEMPLATES.find(t => t.id === selected)?.subtitle}
      </div>
    </div>
  )
}

// SVG-based mini thumbnail that reflects each template's visual DNA
function TemplateThumbnail({ template: t }) {
  const [a, b, c] = t.preview

  if (t.id === 'classic') return (
    <svg viewBox="0 0 100 141" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      <rect width="100" height="141" fill="#fff"/>
      <rect width="38" height="141" fill={a}/>
      <rect x="10" y="18" width="20" height="2.5" rx="1" fill="#fff" opacity="0.9"/>
      <rect x="10" y="24" width="14" height="1.5" rx="0.7" fill={b} opacity="0.8"/>
      <rect x="10" y="35" width="18" height="1" rx="0.5" fill="#8fa3c8"/>
      <rect x="10" y="39" width="16" height="1" rx="0.5" fill="#8fa3c8"/>
      <rect x="10" y="43" width="14" height="1" rx="0.5" fill="#8fa3c8"/>
      <rect x="10" y="55" width="18" height="1" rx="0.5" fill="#8fa3c8"/>
      {[0,1,2,3,4].map(i => <rect key={i} x="10" y={65+i*6} width={14-i} height="1" rx="0.5" fill="#aab8d0" opacity="0.6"/>)}
      <rect x="44" y="16" width="30" height="2.5" rx="1" fill={a}/>
      <rect x="44" y="21" width="50" height="1" rx="0.5" fill="#ddd"/>
      <rect x="44" y="23" width="44" height="1" rx="0.5" fill="#ddd"/>
      <rect x="44" y="30" width="24" height="1.5" rx="0.7" fill={a} opacity="0.7"/>
      <rect x="44" y="32.5" width="50" height="0.7" fill={a}/>
      {[0,1,2,3].map(i => <rect key={i} x="46" y={37+i*4} width={40-i*3} height="1" rx="0.5" fill="#bbb"/>)}
      <rect x="44" y="55" width="24" height="1.5" rx="0.7" fill={a} opacity="0.7"/>
      <rect x="44" y="57.5" width="50" height="0.7" fill={a}/>
      {[0,1,2,3,4].map(i => <rect key={i} x="46" y={62+i*4} width={38-i*2} height="1" rx="0.5" fill="#bbb"/>)}
    </svg>
  )

  if (t.id === 'modern') return (
    <svg viewBox="0 0 100 141" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      <rect width="100" height="141" fill="#fff"/>
      <rect width="100" height="32" fill={a}/>
      <rect x="0" y="30" width="100" height="2" fill={b}/>
      <rect x="8" y="10" width="30" height="4" rx="1.5" fill="#fff" opacity="0.95"/>
      <rect x="8" y="16" width="18" height="2" rx="1" fill={b}/>
      <rect x="8" y="26" width="12" height="1.5" rx="0.7" fill="#8899aa"/>
      <rect x="26" y="26" width="12" height="1.5" rx="0.7" fill="#8899aa"/>
      <rect x="44" y="26" width="12" height="1.5" rx="0.7" fill="#8899aa"/>
      {/* Two column body */}
      <rect x="8" y="40" width="58" height="1.5" rx="0.7" fill={b} opacity="0.6"/>
      {[0,1,2].map(i=><rect key={i} x="8" y={46+i*3.5} width={50-i*4} height="1" rx="0.5" fill="#ccc"/>)}
      <rect x="8" y="60" width="58" height="1.5" rx="0.7" fill={b} opacity="0.6"/>
      {[0,1,2,3,4].map(i=><rect key={i} x="10" y={66+i*3.5} width={42-i*3} height="1" rx="0.5" fill="#ccc"/>)}
      {/* Right column */}
      <rect x="72" y="40" width="22" height="1.5" rx="0.7" fill={b} opacity="0.6"/>
      {[0,1,2,3,4,5].map(i=><rect key={i} x="72" y={46+i*5} width="22" height="3" rx="6" fill={c} opacity="0.15"/>)}
    </svg>
  )

  if (t.id === 'creative') return (
    <svg viewBox="0 0 100 141" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      <rect width="100" height="141" fill="#fff"/>
      <rect width="6" height="141" fill={`url(#grad${t.id})`}/>
      <defs><linearGradient id={`grad${t.id}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={b}/><stop offset="50%" stopColor={c}/><stop offset="100%" stopColor="#ffd700"/></linearGradient></defs>
      <rect x="6" width="36" height="141" fill={a}/>
      <rect x="14" y="14" width="18" height="3" rx="1" fill="#fff" opacity="0.95"/>
      <rect x="14" y="19" width="12" height="2" rx="1" fill="#fff" opacity="0.95"/>
      <rect x="12" y="24" width="22" height="1.5" rx="8" fill={b} opacity="0.3"/>
      {[0,1,2,3,4,5,6].map(i=>(
        <g key={i}>
          <rect x="12" y={34+i*8} width="22" height="1" rx="0.5" fill="#555"/>
          <rect x="12" y={36+i*8} width="22" height="1.5" rx="1" fill="#333" opacity="0.4"/>
        </g>
      ))}
      <rect x="48" y="14" width="32" height="3" rx="1" fill={a}/>
      <rect x="48" y="18" width="16" height="1" rx="0.5" fill={b}/>
      {[0,1,2].map(i=><rect key={i} x="48" y={24+i*3} width={38-i*4} height="1" rx="0.5" fill="#ddd"/>)}
      <rect x="48" y="36" width="32" height="2" rx="1" fill={a}/>
      {[0,1,2,3,4].map(i=><rect key={i} x="50" y={42+i*4} width={32-i*3} height="1" rx="0.5" fill="#ccc"/>)}
      <rect x="48" y="65" width="32" height="2" rx="1" fill={a}/>
      {[0,1,2,3].map(i=><rect key={i} x="50" y={71+i*4} width={32-i*4} height="1" rx="0.5" fill="#ccc"/>)}
    </svg>
  )

  if (t.id === 'executive') return (
    <svg viewBox="0 0 100 141" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      <rect width="100" height="141" fill="#fafaf8"/>
      <rect x="8" y="10" width="84" height="5" rx="1.5" fill={a} opacity="0.85"/>
      <rect x="20" y="16" width="60" height="2" rx="1" fill={b}/>
      <rect x="30" y="20" width="40" height="1" rx="0.5" fill="#9a8870"/>
      <rect x="36" y="22" width="28" height="0.7" fill={b} opacity="0.6"/>
      <line x1="8" y1="27" x2="92" y2="27" stroke={b} strokeWidth="0.8"/>
      {/* Two column */}
      <rect x="8" y="33" width="56" height="1.5" rx="0.7" fill={a} opacity="0.8"/>
      <rect x="8" y="35" width="56" height="0.5" fill={`url(#gold)`}/>
      <defs><linearGradient id="gold" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor={b}/><stop offset="100%" stopColor="transparent"/></linearGradient></defs>
      {[0,1,2].map(i=><rect key={i} x="8" y={39+i*3.5} width={52-i*4} height="1" rx="0.5" fill="#9a8870" opacity="0.7"/>)}
      <rect x="8" y="52" width="40" height="1.5" rx="0.7" fill={a} opacity="0.8"/>
      <rect x="8" y="54" width="40" height="0.5" fill={`url(#gold)`}/>
      {[0,1,2,3,4].map(i=><rect key={i} x="8" y={58+i*4} width={48-i*3} height="1" rx="0.5" fill="#bbb"/>)}
      {/* Right aside */}
      <rect x="68" width="32" height="141" fill="#f5f0e8"/>
      <rect x="72" y="33" width="22" height="1.5" rx="0.7" fill={a} opacity="0.8"/>
      <rect x="72" y="35" width="22" height="0.5" fill={`url(#gold2)`}/>
      <defs><linearGradient id="gold2" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor={b}/><stop offset="100%" stopColor="transparent"/></linearGradient></defs>
      {[0,1,2,3,4,5,6].map(i=>(
        <g key={i}>
          <rect x="72" y={39+i*6} width="6" height="1" rx="0.5" fill={b} opacity="0.6"/>
          <rect x="80" y={39+i*6} width={14-i} height="1" rx="0.5" fill="#999"/>
        </g>
      ))}
    </svg>
  )

  return null
}