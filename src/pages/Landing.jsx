import { Link } from 'react-router-dom'
import { FileText, Mic, Mail, ArrowRight, Sparkles, Zap, Star } from 'lucide-react'

const features = [
  {
    to: '/builder',
    icon: FileText,
    label: 'Resume Builder',
    tagline: 'ATS-Optimized Resumes',
    desc: 'Input your experience and let AI craft a compelling, professional resume tailored to any role or industry.',
    stat: '3x more interviews',
  },
  {
    to: '/coach',
    icon: Mic,
    label: 'Interview Coach',
    tagline: 'AI Mock Interviews',
    desc: 'Practice with an AI coach that asks real interview questions and gives expert feedback on your answers.',
    stat: '85% confidence boost',
  },
  {
    to: '/cover-letter',
    icon: Mail,
    label: 'Cover Letter',
    tagline: 'Personalized Letters',
    desc: 'Generate tailored cover letters that speak directly to the job description and showcase your unique value.',
    stat: '2x application success',
  },
]

const testimonials = [
  { name: 'Zara Ahmed', role: 'Software Engineer ', text: 'Got 4 offers in 2 weeks using this tool. The resume builder is insanely good.' },
  { name: 'Marcus Chen', role: 'Product Manager ', text: 'The interview coach helped me nail my PM interviews. Highly recommend.' },
  { name: 'Priya Nair', role: 'Data Scientist', text: 'Cover letter generator saved me hours. Every letter felt genuinely personalized.' },
]

export default function Landing() {
  return (
    <div className="pt-16">
      {/* Hero */}
      <section className="relative overflow-hidden min-h-screen flex items-center">
        {/* Background decoration */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background: 'radial-gradient(ellipse 80% 60% at 50% -10%, var(--accent-glow), transparent)',
          }}
        />
        <div className="absolute top-32 left-10 w-64 h-64 rounded-full opacity-5" style={{ background: 'var(--accent)', filter: 'blur(60px)' }} />
        <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full opacity-5" style={{ background: 'var(--accent)', filter: 'blur(80px)' }} />

        <div className="relative max-w-6xl mx-auto px-6 py-24 text-center animate-stagger">
          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-mono font-medium mb-8"
            style={{
              background: 'var(--accent-glow)',
              border: '1px solid var(--accent)',
              color: 'var(--accent)',
            }}
          >
            <Sparkles size={12} />
            Powered by AI
          </div>

          {/* Headline */}
          <h1
            className="font-display text-5xl md:text-7xl font-bold leading-tight mb-6"
            style={{ color: 'var(--text-primary)' }}
          >
            Land your
            <span
              className="italic block"
              style={{ color: 'var(--accent)' }}
            >
              dream job
            </span>
            with AI
          </h1>

          <p
            className="font-body text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
            style={{ color: 'var(--text-secondary)' }}
          >
            Build ATS-beating resumes, ace mock interviews, and write
            personalized cover letters — all powered by AI.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/builder" className="btn-primary flex items-center justify-center gap-2 text-sm font-semibold">
              <Zap size={16} />
              Build My Resume
            </Link>
            <Link to="/coach" className="btn-ghost flex items-center justify-center gap-2 text-sm">
              Practice Interview
              <ArrowRight size={15} />
            </Link>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-center gap-8 mt-16 flex-wrap">
            {[
              { label: 'Resumes Created', value: '50K+' },
              { label: 'Interviews Practiced', value: '200K+' },
              { label: 'Job Offers Received', value: '12K+' },
            ].map(stat => (
              <div key={stat.label} className="text-center">
                <div
                  className="font-display text-3xl font-bold"
                  style={{ color: 'var(--accent)' }}
                >
                  {stat.value}
                </div>
                <div className="text-xs font-body mt-1" style={{ color: 'var(--text-muted)' }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <p className="section-label mb-3">What We Offer</p>
          <h2
            className="font-display text-4xl md:text-5xl font-bold"
            style={{ color: 'var(--text-primary)' }}
          >
            Everything you need to{' '}
            <span className="italic" style={{ color: 'var(--accent)' }}>get hired</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {features.map(({ to, icon: Icon, label, tagline, desc, stat }) => (
            <Link
              key={to}
              to={to}
              className="card p-8 group transition-all duration-300 hover:-translate-y-1"
              style={{}}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'var(--accent)'
                e.currentTarget.style.boxShadow = '0 12px 40px var(--accent-glow)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--border)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 transition-all duration-300 group-hover:scale-110"
                style={{ background: 'var(--accent-glow)', border: '1px solid var(--accent)' }}
              >
                <Icon size={22} style={{ color: 'var(--accent)' }} />
              </div>

              <p className="section-label mb-2">{tagline}</p>
              <h3
                className="font-display text-xl font-semibold mb-3"
                style={{ color: 'var(--text-primary)' }}
              >
                {label}
              </h3>
              <p className="text-sm leading-relaxed mb-5" style={{ color: 'var(--text-secondary)' }}>
                {desc}
              </p>

              <div
                className="flex items-center justify-between pt-4"
                style={{ borderTop: '1px solid var(--border)' }}
              >
                <span className="text-xs font-mono font-medium" style={{ color: 'var(--accent)' }}>
                  {stat}
                </span>
                <ArrowRight
                  size={16}
                  style={{ color: 'var(--accent)' }}
                  className="transition-transform group-hover:translate-x-1"
                />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section
        className="py-24"
        style={{ background: 'var(--bg-secondary)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}
      >
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="section-label mb-3">The Process</p>
            <h2 className="font-display text-4xl font-bold" style={{ color: 'var(--text-primary)' }}>
              Three steps to your{' '}
              <span className="italic" style={{ color: 'var(--accent)' }}>next role</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Input Your Story',
                desc: 'Share your experience, skills, and target role. Our AI understands context and nuance.',
              },
              {
                step: '02',
                title: 'AI Does the Work',
                desc: 'AI crafts tailored content — optimized for ATS systems and hiring managers.',
              },
              {
                step: '03',
                title: 'Iterate & Apply',
                desc: 'Refine, customize, and apply with confidence. Track what works and keep improving.',
              },
            ].map(({ step, title, desc }) => (
              <div key={step} className="flex flex-col items-start gap-4">
                <span
                  className="font-display text-6xl font-bold opacity-20"
                  style={{ color: 'var(--accent)' }}
                >
                  {step}
                </span>
                <h3 className="font-display text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-6xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <p className="section-label mb-3">Social Proof</p>
          <h2 className="font-display text-4xl font-bold" style={{ color: 'var(--text-primary)' }}>
            People who got <span className="italic" style={{ color: 'var(--accent)' }}>hired</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map(({ name, role, text }) => (
            <div
              key={name}
              className="card p-6 flex flex-col gap-4"
            >
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={13} fill="var(--accent)" style={{ color: 'var(--accent)' }} />
                ))}
              </div>
              <p className="text-sm leading-relaxed italic" style={{ color: 'var(--text-secondary)' }}>
                "{text}"
              </p>
              <div className="mt-auto pt-4" style={{ borderTop: '1px solid var(--border)' }}>
                <div className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{name}</div>
                <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{role}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section
        className="py-24 text-center"
        style={{
          background: 'var(--accent-glow)',
          borderTop: '1px solid var(--accent)',
          borderBottom: '1px solid var(--accent)',
        }}
      >
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
            Ready to start your{' '}
            <span className="italic" style={{ color: 'var(--accent)' }}>journey</span>
          </h2>
          <p className="text-lg mb-10" style={{ color: 'var(--text-secondary)' }}>
            Join thousands of job seekers using AI to land their dream jobs.
          </p>
          <Link to="/builder" className="btn-primary inline-flex items-center gap-2 text-sm font-semibold px-8 py-4">
            <Sparkles size={16} />
            Get Started Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center text-sm" style={{ color: 'var(--text-muted)', borderTop: '1px solid var(--border)' }}>
        <p>ResumeAI © {new Date().getFullYear()} · Built with CARE</p>
      </footer>
    </div>
  )
}
