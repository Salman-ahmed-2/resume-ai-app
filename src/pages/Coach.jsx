import { useState, useRef, useEffect, useCallback } from 'react'
import {
  Mic, Send, RotateCcw, ChevronRight,
  CheckCircle, AlertCircle, Lightbulb,
  User, Bot, Loader2, Play, BarChart2, X
} from 'lucide-react'
import { useAI } from '../hooks/useAI.js'
import { useGate } from '../hooks/useGate'
import { useAuth } from '../context/AuthContext'
import UpgradeModal from '../components/UpgradeModal'
import { PostActionAd } from '../components/AdBanner'
import AuthModal from '../components/AuthModal'

// ─── Score helpers ─────────────────────────────────────────────────────────────
function scoreColor(s) {
  if (s == null) return 'var(--border)'
  if (s >= 8)   return '#22c55e'
  if (s >= 6)   return 'var(--accent)'
  if (s >= 4)   return '#f97316'
  return '#ef4444'
}
function scoreLabel(s) {
  if (s == null) return '—'
  if (s >= 8)   return 'Excellent'
  if (s >= 6)   return 'Good'
  if (s >= 4)   return 'Needs Work'
  return 'Poor'
}

const Q_TYPES = {
  behavioural:     { label: 'Behavioural',   color: '#818cf8', bg: 'rgba(129,140,248,.12)' },
  'role-specific': { label: 'Role-Specific', color: '#34d399', bg: 'rgba(52,211,153,.12)'  },
  'culture-fit':   { label: 'Culture Fit',   color: '#f472b6', bg: 'rgba(244,114,182,.12)' },
}
const Q_ORDER = ['behavioural','behavioural','role-specific','role-specific','culture-fit']

// ─── System prompt ─────────────────────────────────────────────────────────────
function buildSystemPrompt(role, company) {
  return `You are a tough but fair interviewer at ${company || 'a leading company'} hiring for ${role || 'Software Engineer'}.

STRICT RULES — follow exactly:
1. Ask ONE question per turn. Never bundle multiple questions.
2. After ANY user answer, respond ONLY with valid JSON — no markdown, no prose outside the JSON.

After each answer respond with:
{
  "type": "feedback",
  "score": <integer 1-10, strict — most answers score 4-7>,
  "good": "<1-2 sentences on strengths>",
  "missing": "<1-2 sentences on gaps>",
  "model_answer": "<2-3 sentence ideal answer>",
  "next_question": "<next question text, or empty string if interview complete>",
  "question_type": "<behavioural | role-specific | culture-fit>",
  "question_number": <integer 2-5>,
  "interview_complete": <true only after scoring the 5th answer>
}

For the START_INTERVIEW trigger ONLY respond with:
{
  "type": "intro",
  "message": "<2-sentence warm welcome mentioning role and company and that you will ask 5 questions>",
  "first_question": "<first behavioural question>",
  "question_type": "behavioural",
  "question_number": 1
}

QUESTION ORDER: Q1 behavioural · Q2 behavioural · Q3 role-specific · Q4 role-specific · Q5 culture-fit.
Score 8-10 ONLY for excellent STAR-structured answers with specifics and measurable outcomes. Be strict.`
}

function parseJSON(raw) {
  if (!raw) return null
  // 1. Strip markdown fences
  let cleaned = raw.replace(/```json|```/gi, '').trim()
  // 2. Try direct parse
  try { return JSON.parse(cleaned) } catch { /* fall through */ }
  // 3. Extract the first {...} block — handles prose before/after JSON
  const match = cleaned.match(/\{[\s\S]*\}/)
  if (match) {
    try { return JSON.parse(match[0]) } catch { /* fall through */ }
  }
  return null
}

// ─── ScoreRing ─────────────────────────────────────────────────────────────────
function ScoreRing({ score, size = 52, sw = 5 }) {
  const r    = (size - sw * 2) / 2
  const circ = 2 * Math.PI * r
  const off  = score == null ? circ : circ - (circ * score) / 10
  const col  = scoreColor(score)
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ flexShrink: 0 }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--border)" strokeWidth={sw} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={col} strokeWidth={sw}
        strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={off}
        transform={`rotate(-90 ${size/2} ${size/2})`}
        style={{ transition: 'stroke-dashoffset .85s cubic-bezier(.16,1,.3,1), stroke .4s' }} />
      <text x={size/2} y={size/2+1} textAnchor="middle" dominantBaseline="middle"
        style={{ fontSize: size*.27+'px', fontWeight: 700,
          fill: score == null ? 'var(--text-muted)' : col,
          fontFamily: "'DM Sans', sans-serif" }}>
        {score ?? '—'}
      </text>
    </svg>
  )
}

// ─── QTypeBadge ────────────────────────────────────────────────────────────────
function QTypeBadge({ type }) {
  const cfg = Q_TYPES[type] || Q_TYPES.behavioural
  return (
    <span style={{
      fontSize: '10px', fontWeight: 600, padding: '2px 8px', borderRadius: 20,
      background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}44`,
      letterSpacing: '.4px', textTransform: 'uppercase', whiteSpace: 'nowrap',
    }}>
      {cfg.label}
    </span>
  )
}

// ─── FeedbackCard ──────────────────────────────────────────────────────────────
function FeedbackCard({ data }) {
  const [open, setOpen] = useState(true)
  const col = scoreColor(data.score)
  return (
    <div style={{
      background: 'var(--bg-card)', border: `1px solid var(--border)`,
      borderLeft: `3px solid ${col}`, borderRadius: 12, overflow: 'hidden', marginTop: 8,
    }}>
      <button onClick={() => setOpen(o => !o)} style={{
        width: '100%', display: 'flex', alignItems: 'center', gap: 10,
        padding: '10px 14px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
      }}>
        <ScoreRing score={data.score} size={38} sw={4} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>Answer Feedback</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>
            {scoreLabel(data.score)} · {data.score}/10
          </div>
        </div>
        <ChevronRight size={13} style={{
          color: 'var(--text-muted)', flexShrink: 0,
          transform: open ? 'rotate(90deg)' : 'rotate(0)', transition: 'transform .2s',
        }} />
      </button>
      {open && (
        <div style={{ padding: '0 14px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            { icon: CheckCircle, color: '#22c55e', title: 'What worked',      text: data.good,         italic: false },
            { icon: AlertCircle, color: '#f97316', title: 'What was missing', text: data.missing,       italic: false },
            { icon: Lightbulb,   color: '#818cf8', title: 'Model answer',     text: data.model_answer, italic: true  },
          ].map(({ icon: Icon, color, title, text, italic }) => (
            <div key={title} style={{ display: 'flex', gap: 8 }}>
              <Icon size={13} style={{ color, flexShrink: 0, marginTop: 2 }} />
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color, marginBottom: 3,
                  textTransform: 'uppercase', letterSpacing: '.5px' }}>{title}</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.55,
                  fontStyle: italic ? 'italic' : 'normal' }}>{text}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── ScoreTracker ──────────────────────────────────────────────────────────────
function ScoreTracker({ scores, currentQ, role, company }) {
  const answered = scores.filter(s => s != null).length
  const avg = answered
    ? Math.round(scores.filter(s => s != null).reduce((a, b) => a + b, 0) / answered * 10) / 10
    : null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div className="card" style={{ padding: 14 }}>
        <div className="section-label" style={{ marginBottom: 6 }}>Session</div>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.3 }}>{role || 'Interview'}</div>
        {company && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{company}</div>}
        <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
          <BarChart2 size={12} style={{ color: 'var(--text-muted)' }} />
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{answered}/5 answered</span>
        </div>
        <div style={{ marginTop: 6, height: 3, borderRadius: 3,
          background: 'var(--border)', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${(answered/5)*100}%`,
            background: 'var(--accent)', borderRadius: 3, transition: 'width .5s' }} />
        </div>
      </div>

      {avg != null && (
        <div className="card" style={{ textAlign: 'center', padding: '14px' }}>
          <div className="section-label" style={{ textAlign: 'center', marginBottom: 4 }}>Avg Score</div>
          <div style={{ fontSize: 34, fontWeight: 700, color: scoreColor(avg), lineHeight: 1 }}>{avg}</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>out of 10</div>
        </div>
      )}

      <div className="card" style={{ padding: 14 }}>
        <div className="section-label" style={{ marginBottom: 8 }}>Questions</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          {Array.from({ length: 5 }, (_, i) => {
            const s   = scores[i]
            const act = i + 1 === currentQ
            const col = scoreColor(s)
            return (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '6px 8px', borderRadius: 8,
                background: act ? 'var(--accent-glow)' : 'transparent',
                border: `1px solid ${act ? 'var(--accent)' : 'transparent'}`,
                transition: 'all .2s',
              }}>
                <div style={{
                  width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                  background: s != null ? col + '22' : act ? 'var(--accent-glow)' : 'transparent',
                  border: `1.5px solid ${s != null ? col : act ? 'var(--accent)' : 'var(--border)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10, fontWeight: 700,
                  color: s != null ? col : act ? 'var(--accent)' : 'var(--text-muted)',
                }}>
                  {s != null ? s : i + 1}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 11, fontWeight: act ? 600 : 400,
                    color: act ? 'var(--accent)' : 'var(--text-muted)' }}>Q{i+1}</div>
                  <div style={{ fontSize: 9, overflow: 'hidden', textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap', color: act ? 'var(--text-muted)' : 'var(--border)' }}>
                    {Q_TYPES[Q_ORDER[i]]?.label}
                  </div>
                </div>
                {s != null && (
                  <div style={{ width: 26, height: 3, borderRadius: 2, background: 'var(--border)' }}>
                    <div style={{ width: `${(s/10)*100}%`, height: '100%',
                      background: col, borderRadius: 2, transition: 'width .5s' }} />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <div className="card" style={{ padding: '12px 14px' }}>
        <div className="section-label" style={{ marginBottom: 8 }}>Score Guide</div>
        {[['8–10','#22c55e','Excellent'],['6–7','var(--accent)','Good'],
          ['4–5','#f97316','Fair'],['1–3','#ef4444','Weak']].map(([range, color, label]) => (
          <div key={range} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: color, flexShrink: 0 }} />
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>{range}</span> — {label}
            </span>
          </div>
        ))}
      </div>

      <div className="card" style={{ padding: '12px 14px' }}>
        <div className="section-label" style={{ marginBottom: 8 }}>STAR Tips</div>
        {['Situation — set the scene','Task — your responsibility',
          'Action — what YOU did','Result — quantify the outcome'].map(tip => (
          <div key={tip} style={{ display: 'flex', alignItems: 'flex-start', gap: 6, marginBottom: 5 }}>
            <ChevronRight size={10} style={{ color: 'var(--accent)', flexShrink: 0, marginTop: 2 }} />
            <span style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.4 }}>{tip}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── SetupScreen ───────────────────────────────────────────────────────────────
const interviewTypes = [
  { value: 'behavioral',    label: 'Behavioral',    desc: 'STAR method, soft skills' },
  { value: 'technical',     label: 'Technical',     desc: 'Problem solving, coding' },
  { value: 'system-design', label: 'System Design', desc: 'Architecture & scale' },
  { value: 'leadership',    label: 'Leadership',    desc: 'Management & strategy' },
  { value: 'case',          label: 'Case Study',    desc: 'Business problems' },
  { value: 'pm',            label: 'Product',       desc: 'Product thinking' },
]
const industries = ['Technology','Finance','Healthcare','Consulting','Marketing','Sales','Design','Operations']
const levels     = ['Entry Level','Mid Level','Senior','Staff / Principal','Manager','Director','VP / C-Suite']

function SetupScreen({ onStart, loading, isLoggedIn, onRequireSignIn }) {
  const [config, setConfig] = useState({
    type: 'behavioral', industry: 'Technology', level: 'Senior', role: '', company: '',
  })
  const sc = (k, v) => setConfig(c => ({ ...c, [k]: v }))
  const canStart = config.role.trim() && !loading

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '24px 16px' }}>
      <div style={{ maxWidth: 560, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>

        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 60, height: 60, borderRadius: 16, margin: '0 auto 16px',
            background: 'var(--accent-glow)', border: '1.5px solid var(--accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Mic size={28} style={{ color: 'var(--accent)' }} />
          </div>
          <h1 className="font-display" style={{ fontSize: 28, fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 8px' }}>
            Mock Interview
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
            Practice with a tough-but-fair AI interviewer.<br />
            Get scored and coached on every answer.
          </p>
        </div>

        <div>
          <label className="section-label" style={{ display: 'block', marginBottom: 10 }}>Interview Type</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            {interviewTypes.map(t => (
              <button key={t.value} onClick={() => sc('type', t.value)}
                style={{
                  padding: '12px 10px', borderRadius: 10, textAlign: 'left', cursor: 'pointer',
                  background: config.type === t.value ? 'var(--accent-glow)' : 'var(--bg-secondary)',
                  border: `1.5px solid ${config.type === t.value ? 'var(--accent)' : 'var(--border)'}`,
                  transition: 'all .18s',
                }}>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2,
                  color: config.type === t.value ? 'var(--accent)' : 'var(--text-primary)' }}>
                  {t.label}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{t.desc}</div>
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <label className="section-label">Target Role *</label>
            <input className="input-field" placeholder="Senior Software Engineer"
              value={config.role} onChange={e => sc('role', e.target.value)} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <label className="section-label">Company (optional)</label>
            <input className="input-field" placeholder="Google, Stripe…"
              value={config.company} onChange={e => sc('company', e.target.value)} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <label className="section-label">Industry</label>
            <select className="input-field" value={config.industry} onChange={e => sc('industry', e.target.value)}>
              {industries.map(i => <option key={i}>{i}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <label className="section-label">Seniority</label>
            <select className="input-field" value={config.level} onChange={e => sc('level', e.target.value)}>
              {levels.map(l => <option key={l}>{l}</option>)}
            </select>
          </div>
        </div>

        <div className="card" style={{ padding: '14px 16px' }}>
          <div className="section-label" style={{ marginBottom: 10 }}>Interview Structure · 5 Questions</div>
          {[['2 Behavioural questions', Q_TYPES.behavioural.color],
            ['2 Role-specific questions', Q_TYPES['role-specific'].color],
            ['1 Culture-fit question', Q_TYPES['culture-fit'].color]].map(([txt, col]) => (
            <div key={txt} style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 6 }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: col, flexShrink: 0 }} />
              <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{txt}</span>
            </div>
          ))}
        </div>

        <button
          onClick={() => {
            if (!isLoggedIn) { onRequireSignIn(); return }
            if (config.role.trim() && !loading) onStart(config)
          }}
          disabled={!canStart}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            width: '100%', padding: '14px 20px', borderRadius: 10,
            background: canStart ? 'var(--accent)' : 'var(--border)',
            border: 'none', color: canStart ? '#fff' : 'var(--text-muted)',
            fontSize: 14, fontWeight: 600, fontFamily: 'inherit',
            cursor: canStart ? 'pointer' : 'not-allowed', transition: 'all .2s',
          }}>
          {loading ? <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> : <Play size={15} />}
          {loading ? 'Starting…' : 'Start Interview'}
        </button>
        {!isLoggedIn && (
          <p style={{ marginTop: 10, fontSize: 12, color: 'var(--text-muted)' }}>
            Sign in to start interviews and track usage.
          </p>
        )}
      </div>
    </div>
  )
}

// ─── FinalResults ──────────────────────────────────────────────────────────────
function FinalResults({ scores, role, company, onRestart }) {
  const filled  = scores.map(s => s ?? 5)
  const avg     = filled.reduce((a, b) => a + b, 0) / filled.length
  const verdict = avg >= 7.5 ? { label: 'Strong Hire', col: '#22c55e',       icon: '🏆' }
    : avg >= 6  ? { label: 'Hire',        col: 'var(--accent)',  icon: '✅' }
    : avg >= 4  ? { label: 'Maybe',       col: '#f97316',        icon: '⚠️' }
    :             { label: 'No Hire',     col: '#ef4444',        icon: '❌' }
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', padding: '32px 20px', gap: 22, overflowY: 'auto' }}>
      <div style={{ fontSize: 56, lineHeight: 1 }}>{verdict.icon}</div>
      <div style={{ textAlign: 'center' }}>
        <div className="section-label" style={{ textAlign: 'center', marginBottom: 4 }}>Interview Complete</div>
        <div className="font-display" style={{ fontSize: 30, fontWeight: 600, color: verdict.col }}>{verdict.label}</div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
          {role}{company ? ` at ${company}` : ''}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
        {filled.map((s, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <ScoreRing score={s} size={52} sw={4.5} />
            <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Q{i+1}</div>
          </div>
        ))}
      </div>
      <div className="card" style={{ textAlign: 'center', padding: '16px 32px' }}>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Average Score</div>
        <div className="font-display" style={{ fontSize: 46, fontWeight: 700, color: verdict.col, lineHeight: 1 }}>
          {avg.toFixed(1)}
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>out of 10.0</div>
      </div>
      <button onClick={onRestart} style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '12px 28px', borderRadius: 10, maxWidth: 300, width: '100%',
        background: 'var(--accent)', border: 'none',
        color: '#fff', fontSize: 14, fontWeight: 600, fontFamily: 'inherit',
        cursor: 'pointer', justifyContent: 'center',
      }}>
        <RotateCcw size={14} /> Start New Interview
      </button>
    </div>
  )
}

// ─── Chat bubble ───────────────────────────────────────────────────────────────
function Bubble({ msg }) {
  const isUser = msg.role === 'user'
  return (
    <div style={{ display: 'flex', flexDirection: isUser ? 'row-reverse' : 'row',
      gap: 10, alignItems: 'flex-start' }}>
      <div style={{
        width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
        background: isUser ? 'var(--accent-glow)' : 'var(--bg-card)',
        border: `1.5px solid ${isUser ? 'var(--accent)' : 'var(--border)'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {isUser
          ? <User size={14} style={{ color: 'var(--accent)' }} />
          : <Bot  size={14} style={{ color: 'var(--text-muted)' }} />}
      </div>
      <div style={{ maxWidth: '78%', display: 'flex', flexDirection: 'column', gap: 6 }}>
        {!isUser && msg.questionType && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <QTypeBadge type={msg.questionType} />
            {msg.questionNumber && (
              <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 }}>
                Q{msg.questionNumber} of 5
              </span>
            )}
          </div>
        )}
        <div style={{
          padding: '10px 14px', lineHeight: 1.6, fontSize: 13.5,
          borderRadius: isUser ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
          background: isUser ? 'var(--accent-glow)' : 'var(--bg-card)',
          border: `1px solid ${isUser ? 'var(--accent)' : 'var(--border)'}`,
          color: 'var(--text-primary)',
        }}>
          {msg.content}
        </div>
        {msg.feedback && <FeedbackCard data={msg.feedback} />}
      </div>
    </div>
  )
}

function TypingBubble() {
  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
      <div style={{ width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
        background: 'var(--bg-card)', border: '1.5px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Bot size={14} style={{ color: 'var(--text-muted)' }} />
      </div>
      <div style={{ padding: '11px 16px', borderRadius: '14px 14px 14px 4px',
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', gap: 6 }}>
        <Loader2 size={13} style={{ color: 'var(--accent)', animation: 'coachSpin 1s linear infinite' }} />
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Thinking…</span>
      </div>
    </div>
  )
}

// ─── Main Coach page ───────────────────────────────────────────────────────────
export default function Coach() {
  const [phase,       setPhase]       = useState('setup')
  const [config,      setConfig]      = useState(null)
  const [messages,    setMessages]    = useState([])       // display messages
  const [input,       setInput]       = useState('')
  const [scores,      setScores]      = useState(Array(5).fill(null))
  const [currentQ,    setCurrentQ]    = useState(1)
  const [apiError,    setApiError]    = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showPostAd,  setShowPostAd]  = useState(false)

  
  const apiHistoryRef = useRef([])

  const bottomRef = useRef(null)
  const inputRef  = useRef(null)

  const { generate, loading } = useAI()
  const { isLoggedIn } = useAuth()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const { gate, showUpgradeModal, limitField, closeUpgradeModal } = useGate('interviews_completed')

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  // ── Start interview ──────────────────────────────────────────────────────────
  const handleStart = useCallback(async (cfg) => {
    if (!isLoggedIn) {
      setApiError('Sign in to start the interview and track usage.')
      setShowAuthModal(true)
      return
    }
    const allowed = await gate()
    if (!allowed) return

    setConfig(cfg)
    setPhase('interview')
    setApiError('')
    setMessages([])
    setScores(Array(5).fill(null))
    setCurrentQ(1)
    apiHistoryRef.current = []  

    let raw = ''
   
    const triggerMsg = [{ role: 'user', content: 'START_INTERVIEW' }]
    await generate(buildSystemPrompt(cfg.role, cfg.company), triggerMsg, chunk => { raw = chunk })

    const data = parseJSON(raw)
    if (!data || data.type !== 'intro') {
      setApiError('Failed to start — bad response from AI. Please try again.')
      setPhase('setup')
      return
    }

   
    const introText = `${data.message}\n\n${data.first_question}`
    apiHistoryRef.current = [
      { role: 'user',      content: 'START_INTERVIEW' },
      { role: 'assistant', content: introText },
    ]

    setMessages([
      { id: 'intro', role: 'assistant', content: data.message },
      { id: 'q1',   role: 'assistant', content: data.first_question,
        questionType: data.question_type, questionNumber: data.question_number },
    ])
    setTimeout(() => inputRef.current?.focus(), 100)
  }, [gate, generate, isLoggedIn])

  // ── Send answer ──────────────────────────────────────────────────────────────
  const handleSend = useCallback(async () => {
    if (!input.trim() || loading || !config) return
    const answer = input.trim()
    setInput('')
    setApiError('')

    
    setMessages(prev => [...prev, { id: Date.now(), role: 'user', content: answer }])


    apiHistoryRef.current = [...apiHistoryRef.current, { role: 'user', content: answer }]

    let raw = ''
    await generate(
      buildSystemPrompt(config.role, config.company),
      apiHistoryRef.current,  
      chunk => { raw = chunk }
    )

    const data = parseJSON(raw)
    if (!data || data.type !== 'feedback') {
    
      const hint = raw ? ` (got: ${raw.slice(0, 120)}…)` : ''
      setApiError(`Unexpected AI response — please try giving a more detailed answer.${hint}`)
     
      apiHistoryRef.current = apiHistoryRef.current.slice(0, -1)
      return
    }

   
    apiHistoryRef.current = [...apiHistoryRef.current, { role: 'assistant', content: raw.trim() }]

   
    setScores(prev => { const n = [...prev]; n[currentQ - 1] = data.score; return n })

    const feedbackMsg = {
      id: Date.now() + 1,
      role: 'assistant',
      content: data.interview_complete
        ? `That wraps up your ${config.role} interview${config.company ? ` at ${config.company}` : ''}. Great effort!`
        : 'Here\'s my feedback on your answer:',
      feedback: { score: data.score, good: data.good, missing: data.missing, model_answer: data.model_answer },
    }
    setMessages(prev => [...prev, feedbackMsg])

    if (data.interview_complete) {
      setShowPostAd(true)
      setTimeout(() => setPhase('results'), 1000)
    } else if (data.next_question) {
      setTimeout(() => {
        const nextQNum = currentQ + 1
        setCurrentQ(nextQNum)
        const nextQMsg = {
          id: Date.now() + 2,
          role: 'assistant',
          content: data.next_question,
          questionType: data.question_type,
          questionNumber: data.question_number,
        }
       
        apiHistoryRef.current = [
          ...apiHistoryRef.current,
          { role: 'assistant', content: data.next_question },
        ]
        setMessages(prev => [...prev, nextQMsg])
        inputRef.current?.focus()
      }, 350)
    }
  }, [input, loading, messages, config, currentQ, generate])

  const handleKeyDown = e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  const handleRestart = () => {
    setPhase('setup')
    setMessages([])
    setScores(Array(5).fill(null))
    setCurrentQ(1)
    setApiError('')
    setSidebarOpen(false)
    setShowPostAd(false)
    apiHistoryRef.current = []
  }

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="pt-16" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <style>{`
        @keyframes coachSpin    { to { transform: rotate(360deg); } }
        @keyframes coachFadeUp  { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:none; } }
        .coach-msg-in { animation: coachFadeUp .25s ease both; }

        .coach-sidebar-mobile { display: none !important; }
        @media (max-width: 768px) {
          .coach-sidebar-desktop { display: none !important; }
          .coach-sidebar-mobile  { display: block !important; }
          .coach-grid-2 { grid-template-columns: 1fr !important; }
          .coach-header-role { display: none; }
        }
      `}</style>

      {/* Top bar */}
      <header style={{
        position: 'sticky', top: 64, zIndex: 30, height: 52, flexShrink: 0,
        display: 'flex', alignItems: 'center', padding: '0 20px', gap: 10,
        background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)',
      }}>
        <Mic size={16} style={{ color: 'var(--accent)', flexShrink: 0 }} />
        <span className="font-display" style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>
          Interview Coach
        </span>

        {phase === 'interview' && config && (
          <>
            <span style={{ color: 'var(--border)', margin: '0 2px' }}>·</span>
            <span className="coach-header-role" style={{
              fontSize: 12, color: 'var(--text-muted)', flex: 1,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {config.role}{config.company ? ` at ${config.company}` : ''} · {config.level}
            </span>
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
              <button
                className="coach-sidebar-mobile"
                onClick={() => setSidebarOpen(o => !o)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  padding: '5px 10px', borderRadius: 7, border: '1px solid var(--border)',
                  background: 'transparent', color: 'var(--text-muted)', fontSize: 12,
                  fontFamily: 'inherit', cursor: 'pointer',
                }}>
                <BarChart2 size={13} /> Scores
              </button>
              <button onClick={handleRestart} style={{
                display: 'flex', alignItems: 'center', gap: 5,
                padding: '5px 10px', borderRadius: 7, border: '1px solid var(--border)',
                background: 'transparent', color: 'var(--text-muted)', fontSize: 12,
                fontFamily: 'inherit', cursor: 'pointer',
              }}>
                <RotateCcw size={11} /> Reset
              </button>
            </div>
          </>
        )}
      </header>

      {/* Body */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>

        {phase === 'setup' && (
          <SetupScreen
            onStart={handleStart} loading={loading}
            isLoggedIn={isLoggedIn} onRequireSignIn={() => setShowAuthModal(true)}
          />
        )}

        {phase === 'results' && (
          <FinalResults
            scores={scores}
            role={config?.role || 'Interview'}
            company={config?.company || ''}
            onRestart={handleRestart}
          />
        )}

        {phase === 'interview' && (
          <>
            {/* Chat column */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
              <div style={{ flex: 1, overflowY: 'auto', padding: '20px 16px',
                display: 'flex', flexDirection: 'column', gap: 18 }}>
                {messages.map(m => <Bubble key={m.id} msg={m} />)}
                {loading && <TypingBubble />}
                {apiError && (
                  <div style={{
                    padding: '10px 14px', borderRadius: 10,
                    background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.2)',
                    color: '#ef4444', fontSize: 12, display: 'flex', alignItems: 'center', gap: 8,
                  }}>
                    <AlertCircle size={13} /> {apiError}
                  </div>
                )}
                <div ref={bottomRef} />
              </div>

              {/* Input bar */}
              <div style={{
                flexShrink: 0, padding: '12px 16px',
                borderTop: '1px solid var(--border)',
                background: 'var(--bg-secondary)',
              }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
                  <textarea
                    ref={inputRef}
                    rows={3}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={loading}
                    placeholder="Type your answer… (Enter to send · Shift+Enter for new line)"
                    className="input-field"
                    style={{ resize: 'none', lineHeight: 1.55, fontSize: 13.5,
                      minHeight: 72, maxHeight: 140, padding: '10px 14px', flex: 1 }}
                  />
                  <button
                    onClick={handleSend}
                    disabled={!input.trim() || loading}
                    style={{
                      width: 44, height: 44, borderRadius: 12, flexShrink: 0, alignSelf: 'flex-end',
                      background: input.trim() && !loading ? 'var(--accent)' : 'var(--border)',
                      border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: input.trim() && !loading ? 'pointer' : 'not-allowed', transition: 'all .2s',
                    }}>
                    {loading
                      ? <Loader2 size={16} style={{ color: '#fff', animation: 'coachSpin 1s linear infinite' }} />
                      : <Send size={16} style={{ color: '#fff' }} />}
                  </button>
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>
                  💡 STAR format: <em>Situation → Task → Action → Result</em>
                </div>
              </div>
            </div>

            {/* Desktop sidebar */}
            <aside className="coach-sidebar-desktop" style={{
              width: 220, flexShrink: 0,
              borderLeft: '1px solid var(--border)',
              background: 'var(--bg-primary)',
              padding: '16px 14px', overflowY: 'auto',
            }}>
              <ScoreTracker
                scores={scores} currentQ={currentQ}
                role={config?.role || ''} company={config?.company || ''}
              />
            </aside>

            {/* Mobile sidebar overlay */}
            {sidebarOpen && (
              <>
                <div
                  onClick={() => setSidebarOpen(false)}
                  style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.3)', zIndex: 40 }}
                />
                <aside style={{
                  position: 'fixed', right: 0, top: 0, bottom: 0, width: 272, zIndex: 50,
                  background: 'var(--bg-secondary)', borderLeft: '1px solid var(--border)',
                  padding: '16px 14px', overflowY: 'auto',
                  boxShadow: '-8px 0 32px rgba(0,0,0,.12)',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between',
                    alignItems: 'center', marginBottom: 14 }}>
                    <span className="font-display" style={{ fontSize: 14, fontWeight: 600,
                      color: 'var(--text-primary)' }}>Score Tracker</span>
                    <button onClick={() => setSidebarOpen(false)} style={{
                      width: 26, height: 26, borderRadius: 6,
                      border: '1px solid var(--border)', background: 'transparent',
                      color: 'var(--text-muted)', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <X size={12} />
                    </button>
                  </div>
                  <ScoreTracker
                    scores={scores} currentQ={currentQ}
                    role={config?.role || ''} company={config?.company || ''}
                  />
                </aside>
              </>
            )}
          </>
        )}
      </div>

      {/* <PostActionAd show={showPostAd} onDismiss={() => setShowPostAd(false)} /> */}
      <AuthModal open={showAuthModal} onClose={() => setShowAuthModal(false)} defaultTab="signin" />
      <UpgradeModal
        open={showUpgradeModal}
        onClose={closeUpgradeModal}
        limitField={limitField}
        onContinueFree={closeUpgradeModal}
      />
    </div>
  )
}