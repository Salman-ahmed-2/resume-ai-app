<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>AI Resume Builder & Interview Coach</title>
<link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@400;500&family=Lora:ital,wght@0,400;0,600;1,400&display=swap" rel="stylesheet"/>
<style>
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --bg-primary:   #f5f4f0;
  --bg-secondary: #ffffff;
  --bg-card:      #ffffff;
  --text-primary: #1a1a1a;
  --text-secondary:#4a4336;
  --text-muted:   #847a5a;
  --border:       #d0cbb8;
  --accent:       #c8a96e;
  --accent-hover: #b8934e;
  --accent-glow:  rgba(200,169,110,0.15);
}

.dark {
  --bg-primary:   #0d1117;
  --bg-secondary: #161b22;
  --bg-card:      #1a2234;
  --text-primary: #e8e5dc;
  --text-secondary:#b5ad93;
  --text-muted:   #6e644b;
  --border:       #2d3748;
  --accent:       #d4a843;
  --accent-hover: #e8b84d;
  --accent-glow:  rgba(212,168,67,0.12);
}

html { scroll-behavior: smooth; }

body {
  font-family: 'Lora', Georgia, serif;
  background: var(--bg-primary);
  color: var(--text-primary);
  transition: background 0.3s, color 0.3s;
  line-height: 1.7;
}

/* ── NAV ── */
nav {
  position: fixed; top: 0; left: 0; right: 0; z-index: 200;
  height: 58px;
  display: flex; align-items: center;
  padding: 0 2rem; gap: 1.5rem;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border);
}
.nav-logo {
  font-family: 'Syne', sans-serif;
  font-weight: 800; font-size: 1.05rem;
  color: var(--text-primary); letter-spacing: -0.02em;
}
.nav-logo em { font-family: 'Lora', serif; color: var(--accent); font-style: italic; }
.nav-links { display: flex; gap: 1.5rem; list-style: none; margin-left: auto; }
.nav-links a {
  font-family: 'Syne', sans-serif; font-size: 0.78rem;
  font-weight: 600; letter-spacing: 0.07em; text-transform: uppercase;
  color: var(--text-muted); text-decoration: none; transition: color 0.2s;
}
.nav-links a:hover { color: var(--accent); }
.theme-btn {
  background: none; border: 1px solid var(--border);
  border-radius: 8px; padding: 5px 12px; cursor: pointer;
  font-family: 'DM Mono', monospace; font-size: 11px;
  color: var(--text-muted); transition: all 0.2s;
}
.theme-btn:hover { border-color: var(--accent); color: var(--accent); }

/* ── HERO ── */
.hero {
  min-height: 100vh;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center; text-align: center;
  padding: 7rem 2rem 5rem;
  position: relative; overflow: hidden;
}
.hero-grid {
  position: absolute; inset: 0;
  background-image:
    repeating-linear-gradient(0deg, transparent, transparent 39px, var(--border) 39px, var(--border) 40px),
    repeating-linear-gradient(90deg, transparent, transparent 39px, var(--border) 39px, var(--border) 40px);
  opacity: 0.3; pointer-events: none;
}
.hero-glow {
  position: absolute;
  width: 800px; height: 450px;
  background: radial-gradient(ellipse, var(--accent-glow) 0%, transparent 68%);
  top: 50%; left: 50%; transform: translate(-50%, -55%);
  pointer-events: none;
}

.eyebrow {
  display: flex; align-items: center; gap: 14px;
  font-family: 'DM Mono', monospace; font-size: 10px;
  letter-spacing: 0.22em; text-transform: uppercase;
  color: var(--accent); margin-bottom: 1.5rem;
  position: relative; z-index: 1;
}
.eyebrow::before, .eyebrow::after {
  content: ''; width: 36px; height: 1px;
  background: var(--accent); opacity: 0.45; display: inline-block;
}

.hero-title {
  font-family: 'Syne', sans-serif; font-weight: 800;
  font-size: clamp(2.6rem, 7.5vw, 5.8rem);
  letter-spacing: -0.04em; line-height: 1.0;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
  position: relative; z-index: 1;
}
.hero-title em {
  font-family: 'Lora', serif; font-style: italic; color: var(--accent);
}

.hero-sub {
  font-size: 1.1rem; color: var(--text-secondary);
  max-width: 480px; margin: 1.2rem auto 2.2rem;
  position: relative; z-index: 1;
}

.badge-row {
  display: flex; flex-wrap: wrap; gap: 8px; justify-content: center;
  margin-bottom: 2.5rem; position: relative; z-index: 1;
}
.badge {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 5px 13px; border-radius: 999px;
  font-family: 'DM Mono', monospace; font-size: 10px;
  letter-spacing: 0.06em;
  border: 1px solid var(--border);
  background: var(--bg-secondary); color: var(--text-muted);
  transition: all 0.2s;
}
.badge:hover { border-color: var(--accent); color: var(--accent); }
.badge-hi {
  background: var(--accent-glow);
  border-color: var(--accent); color: var(--accent);
}

.hero-ctas {
  display: flex; gap: 12px; flex-wrap: wrap; justify-content: center;
  position: relative; z-index: 1;
}
.btn {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 12px 26px; border-radius: 10px; border: none;
  font-family: 'Syne', sans-serif; font-weight: 700;
  font-size: 0.85rem; letter-spacing: 0.05em; text-transform: uppercase;
  text-decoration: none; cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s, background 0.2s;
}
.btn:hover { transform: translateY(-2px); }
.btn-primary {
  background: var(--accent); color: #fff;
  box-shadow: 0 4px 20px var(--accent-glow);
}
.btn-primary:hover { background: var(--accent-hover); }
.btn-ghost {
  background: transparent; color: var(--text-secondary);
  border: 1px solid var(--border);
}
.btn-ghost:hover { border-color: var(--accent); color: var(--accent); }

/* ── ORNAMENT DIVIDER ── */
.orn {
  display: flex; align-items: center; justify-content: center; gap: 16px;
  padding: 2rem 2rem;
  font-family: 'DM Mono', monospace; font-size: 11px; color: var(--accent);
  letter-spacing: 0.15em;
}
.orn::before, .orn::after {
  content: ''; flex: 1; max-width: 220px; height: 1px; background: var(--border);
}

/* ── SECTION ── */
section { padding: 4.5rem 2rem; max-width: 1100px; margin: 0 auto; }

.sec-label {
  font-family: 'DM Mono', monospace; font-size: 10px;
  letter-spacing: 0.2em; text-transform: uppercase;
  color: var(--accent); margin-bottom: 0.7rem;
  display: flex; align-items: center; gap: 8px;
}
.sec-label::after { content: ''; width: 22px; height: 1px; background: var(--accent); opacity: 0.5; }

.sec-title {
  font-family: 'Syne', sans-serif; font-weight: 800;
  font-size: clamp(1.8rem, 4vw, 2.8rem);
  letter-spacing: -0.03em; line-height: 1.1;
  color: var(--text-primary); margin-bottom: 0.75rem;
}
.sec-title em { font-family: 'Lora', serif; font-style: italic; color: var(--accent); }

.sec-desc { font-size: 0.98rem; color: var(--text-secondary); max-width: 500px; margin-bottom: 2.5rem; }

/* ── FEATURE CARDS ── */
.feat-grid {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 18px;
}
.feat-card {
  background: var(--bg-card); border: 1px solid var(--border);
  border-radius: 16px; padding: 26px;
  transition: border-color 0.3s, transform 0.3s, box-shadow 0.3s;
}
.feat-card:hover {
  border-color: var(--accent); transform: translateY(-3px);
  box-shadow: 0 8px 30px var(--accent-glow);
}
.feat-num {
  font-family: 'DM Mono', monospace; font-size: 10px;
  letter-spacing: 0.14em; color: var(--accent); opacity: 0.75; margin-bottom: 14px;
}
.feat-chip {
  display: inline-flex; align-items: center; gap: 5px;
  font-family: 'DM Mono', monospace; font-size: 10px; letter-spacing: 0.08em;
  color: var(--accent); background: var(--accent-glow);
  border: 1px solid var(--accent); padding: 3px 9px;
  border-radius: 99px; margin-bottom: 14px;
}
.feat-card h3 {
  font-family: 'Syne', sans-serif; font-weight: 700; font-size: 1.05rem;
  color: var(--text-primary); letter-spacing: -0.01em; margin-bottom: 9px;
}
.feat-card p { font-size: 0.875rem; color: var(--text-secondary); line-height: 1.7; margin-bottom: 16px; }
.feat-list { list-style: none; border-top: 1px solid var(--border); padding-top: 14px; }
.feat-list li {
  font-size: 0.82rem; color: var(--text-muted); padding: 3px 0;
  display: flex; align-items: flex-start; gap: 8px;
}
.feat-list li::before { content: '—'; color: var(--accent); opacity: 0.5; flex-shrink: 0; margin-top: 1px; }

/* ── STEPS ── */
.steps-grid {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px;
}
.step-card {
  background: var(--bg-card); border: 1px solid var(--border);
  border-radius: 14px; padding: 24px;
  transition: border-color 0.2s;
}
.step-card:hover { border-color: var(--accent); }
.step-n {
  font-family: 'Syne', sans-serif; font-weight: 800;
  font-size: 3rem; letter-spacing: -0.05em;
  color: var(--accent); opacity: 0.22; line-height: 1; margin-bottom: 10px;
}
.step-card h3 {
  font-family: 'Syne', sans-serif; font-weight: 700; font-size: 0.92rem;
  color: var(--text-primary); margin-bottom: 7px; letter-spacing: -0.01em;
}
.step-card p { font-size: 0.84rem; color: var(--text-secondary); margin-bottom: 13px; }

/* ── CODE ── */
.code {
  background: var(--bg-primary); border: 1px solid var(--border);
  border-radius: 10px; overflow: hidden; margin: 10px 0;
}
.code-bar {
  display: flex; align-items: center; gap: 6px;
  padding: 8px 13px; border-bottom: 1px solid var(--border);
  background: var(--bg-secondary);
}
.d { width: 9px; height: 9px; border-radius: 50%; }
.dr { background: #ff6058; } .dy { background: #ffbd2e; } .dg { background: #27c840; }
.clang { margin-left: auto; font-family: 'DM Mono', monospace; font-size: 10px; color: var(--text-muted); letter-spacing: 0.1em; text-transform: uppercase; }
.code pre {
  padding: 15px; font-family: 'DM Mono', monospace;
  font-size: 0.79rem; line-height: 1.8; overflow-x: auto;
  color: var(--text-secondary);
}
.tc { color: var(--text-muted); }
.tk { color: var(--accent); }
.ts { color: var(--accent-hover); }

/* ── TABLE ── */
.tw { background: var(--bg-card); border: 1px solid var(--border); border-radius: 14px; overflow: hidden; }
.dt { width: 100%; border-collapse: collapse; font-size: 0.87rem; }
.dt th {
  text-align: left; padding: 12px 18px;
  font-family: 'DM Mono', monospace; font-size: 10px;
  letter-spacing: 0.15em; text-transform: uppercase; color: var(--text-muted);
  border-bottom: 1px solid var(--border); background: var(--bg-secondary);
}
.dt td {
  padding: 13px 18px; border-bottom: 1px solid var(--border);
  color: var(--text-secondary); vertical-align: middle;
}
.dt tr:last-child td { border-bottom: none; }
.dt tr:hover td { background: var(--accent-glow); }
.dt code {
  font-family: 'DM Mono', monospace; font-size: 0.79rem;
  color: var(--accent); background: var(--accent-glow);
  padding: 2px 7px; border-radius: 5px;
}
.dt a { color: var(--accent); text-decoration: none; border-bottom: 1px solid transparent; transition: border-color 0.2s; }
.dt a:hover { border-color: var(--accent); }
.rq { display: inline-block; width: 8px; height: 8px; border-radius: 50%; }
.rq-y { background: var(--accent); box-shadow: 0 0 6px var(--accent-glow); }
.rq-n { background: var(--border); }

/* ── NOTICE ── */
.notice {
  display: flex; gap: 13px; padding: 15px 19px; border-radius: 11px;
  margin: 1.25rem 0; font-size: 0.85rem; line-height: 1.7;
  border: 1px solid var(--border); background: var(--bg-card);
  color: var(--text-secondary);
}
.ni { flex-shrink: 0; color: var(--accent); margin-top: 1px; }
.notice strong { color: var(--accent); }
.notice code {
  font-family: 'DM Mono', monospace; font-size: 0.78rem;
  color: var(--accent); background: var(--accent-glow);
  padding: 1px 6px; border-radius: 4px;
}
.notice a { color: var(--accent); text-decoration: none; }
.notice a:hover { text-decoration: underline; }

/* ── DEPLOY CARDS ── */
.dep-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 18px; }
.dep-card {
  background: var(--bg-card); border: 1px solid var(--border);
  border-radius: 14px; padding: 26px;
  transition: border-color 0.2s, transform 0.2s;
}
.dep-card:hover { border-color: var(--accent); transform: translateY(-2px); }
.dep-letter {
  display: inline-flex; align-items: center; justify-content: center;
  width: 32px; height: 32px; border-radius: 8px;
  font-family: 'Syne', sans-serif; font-weight: 800; font-size: 0.9rem;
  background: var(--accent); color: var(--bg-primary); margin-bottom: 15px;
}
.dep-card h3 { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 0.93rem; color: var(--text-primary); margin-bottom: 9px; }
.dep-card p, .dep-card li { font-size: 0.84rem; color: var(--text-secondary); line-height: 1.75; }
.dep-card ol { padding-left: 18px; }
.dep-card li { margin-bottom: 4px; }
.dep-card a { color: var(--accent); text-decoration: none; }
.dep-card a:hover { text-decoration: underline; }
.dep-card strong { color: var(--accent); }

/* ── FILE TREE ── */
.tree {
  background: var(--bg-secondary); border: 1px solid var(--border);
  border-radius: 14px; padding: 28px 30px;
  font-family: 'DM Mono', monospace; font-size: 0.79rem;
  line-height: 2; overflow-x: auto;
}
.t-dir  { color: var(--accent); font-weight: 500; }
.t-file { color: var(--text-secondary); }
.t-com  { color: var(--text-muted); font-style: italic; }

/* ── HOOKS ── */
.hook-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
@media (max-width: 680px) { .hook-grid { grid-template-columns: 1fr; } }
.hook-card {
  background: var(--bg-card); border: 1px solid var(--border);
  border-radius: 14px; overflow: hidden;
}
.hook-bar {
  padding: 13px 18px; border-bottom: 1px solid var(--border);
  display: flex; align-items: center; gap: 9px;
  background: var(--bg-secondary);
}
.hook-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--accent); }
.hook-name { font-family: 'DM Mono', monospace; font-size: 0.78rem; color: var(--text-secondary); }
.hook-card pre {
  padding: 18px; font-family: 'DM Mono', monospace;
  font-size: 0.77rem; line-height: 1.85; overflow-x: auto;
  color: var(--text-secondary);
}

/* ── SCRIPTS ── */
.scr-list { display: flex; flex-direction: column; gap: 10px; }
.scr-row {
  display: flex; align-items: center; gap: 16px;
  background: var(--bg-card); border: 1px solid var(--border);
  border-radius: 10px; padding: 13px 18px; transition: border-color 0.2s;
}
.scr-row:hover { border-color: var(--accent); }
.scr-cmd {
  font-family: 'DM Mono', monospace; font-size: 0.79rem;
  color: var(--accent); background: var(--accent-glow);
  border: 1px solid var(--accent);
  padding: 4px 12px; border-radius: 7px; flex-shrink: 0; min-width: 170px; text-align: center;
}
.scr-desc { font-size: 0.87rem; color: var(--text-secondary); }
.scr-desc code {
  font-family: 'DM Mono', monospace; font-size: 0.77rem; color: var(--accent);
}

/* ── BROWSERS ── */
.br-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 13px; }
.br-card {
  background: var(--bg-card); border: 1px solid var(--border);
  border-radius: 12px; padding: 20px; text-align: center;
  transition: border-color 0.2s, transform 0.2s;
}
.br-card:hover { border-color: var(--accent); transform: translateY(-2px); }
.br-icon { font-size: 1.75rem; margin-bottom: 8px; display: block; }
.br-name { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 0.86rem; color: var(--text-primary); margin-bottom: 3px; }
.br-ver  { font-family: 'DM Mono', monospace; font-size: 0.73rem; color: var(--text-muted); }

/* ── FOOTER ── */
footer {
  padding: 5rem 2rem 4rem; text-align: center;
  border-top: 1px solid var(--border); background: var(--bg-secondary);
}
.foot-mark {
  font-family: 'Syne', sans-serif; font-weight: 800;
  font-size: 1.5rem; letter-spacing: -0.04em; color: var(--text-primary); margin-bottom: 0.5rem;
}
.foot-mark em { font-family: 'Lora', serif; font-style: italic; color: var(--accent); }
.foot-tag { font-size: 0.9rem; color: var(--text-muted); font-style: italic; margin-bottom: 2rem; }
.foot-links { display: flex; gap: 1.5rem; justify-content: center; flex-wrap: wrap; margin-bottom: 2rem; }
.foot-links a {
  font-family: 'Syne', sans-serif; font-size: 0.77rem; font-weight: 600;
  letter-spacing: 0.07em; text-transform: uppercase;
  color: var(--text-muted); text-decoration: none; transition: color 0.2s;
}
.foot-links a:hover { color: var(--accent); }
.foot-copy { font-family: 'DM Mono', monospace; font-size: 0.72rem; color: var(--border); letter-spacing: 0.07em; }

@media (max-width: 600px) {
  .nav-links { display: none; }
  .hero-title { font-size: 2.3rem; }
}
</style>
</head>
<body>

<!-- NAV -->
<nav>
  <div class="nav-logo">Resume<em>AI</em></div>
  <ul class="nav-links">
    <li><a href="#features">Features</a></li>
    <li><a href="#quickstart">Quick Start</a></li>
    <li><a href="#deploy">Deploy</a></li>
    <li><a href="#structure">Structure</a></li>
    <li><a href="#api">API</a></li>
  </ul>
  <button class="theme-btn" id="tb" onclick="toggle()">☽ Dark</button>
</nav>

<!-- HERO -->
<div class="hero">
  <div class="hero-grid"></div>
  <div class="hero-glow"></div>

  <div class="eyebrow">AI-Powered Career Toolkit</div>

  <h1 class="hero-title">Build Resumes.<br/>Ace <em>Interviews.</em></h1>

  <p class="hero-sub">
    ATS-optimized resumes in minutes. Real-time mock interview coaching with frontier AI. No backend. No drama.
  </p>

  <div class="badge-row">
    <span class="badge badge-hi">◆ Claude Sonnet</span>
    <span class="badge badge-hi">◆ Gemini 2.0 Flash</span>
    <span class="badge">React + Vite</span>
    <span class="badge">Client-Side Only</span>
    <span class="badge">MIT License</span>
  </div>

  <div class="hero-ctas">
    <a href="#quickstart" class="btn btn-primary">Get Started →</a>
    <a href="#features"   class="btn btn-ghost">View Features</a>
  </div>
</div>

<!-- FEATURES -->
<section id="features">
  <div class="sec-label">What's inside</div>
  <h2 class="sec-title">Four modules.<br/><em>One toolkit.</em></h2>
  <p class="sec-desc">Two frontier models. Zero server setup. Everything you need to land the job.</p>

  <div class="feat-grid">
    <div class="feat-card">
      <div class="feat-num">01 ／ AI Enhancement</div>
      <div class="feat-chip">◆ Gemini 2.0 Flash</div>
      <h3>Resume Enhancement</h3>
      <p>Transform raw experience into compelling, impact-driven narratives that hiring managers actually read.</p>
      <ul class="feat-list">
        <li>Impact-first bullet rewrites</li>
        <li>Tailored professional summary</li>
        <li>Surfaces skills you may have missed</li>
        <li>Returns clean structured JSON — fast</li>
      </ul>
    </div>

    <div class="feat-card">
      <div class="feat-num">02 ／ ATS Analysis</div>
      <div class="feat-chip">◆ Claude Sonnet</div>
      <h3>ATS Score Analyzer</h3>
      <p>Know exactly where you stand before hitting send. Beat the bots that filter 75% of resumes.</p>
      <ul class="feat-list">
        <li>Keyword matching vs. any job posting</li>
        <li>Visual score ring with % breakdown</li>
        <li>Flags missing terms & weak sections</li>
        <li>Actionable fixes, not just numbers</li>
      </ul>
    </div>

    <div class="feat-card">
      <div class="feat-num">03 ／ Mock Interview</div>
      <div class="feat-chip">◆ Claude Sonnet</div>
      <h3>Interview Engine</h3>
      <p>Rehearse until you're confident. Real-time scoring and honest feedback on every answer.</p>
      <ul class="feat-list">
        <li>5 tailored questions per session</li>
        <li>Per-answer scoring + detailed feedback</li>
        <li>Streaming responses feel natural</li>
        <li>Full-session performance tracking</li>
      </ul>
    </div>

    <div class="feat-card">
      <div class="feat-num">04 ／ Templates & Export</div>
      <div class="feat-chip">◆ In-browser</div>
      <h3>Templates & PDF Export</h3>
      <p>Four polished resume templates with a live A4 preview. One click to export a print-ready PDF.</p>
      <ul class="feat-list">
        <li>Classic · Modern · Creative · Executive</li>
        <li>Live A4 preview in an iframe</li>
        <li>Native browser PDF export</li>
        <li>Dark / light theme toggle</li>
      </ul>
    </div>
  </div>
</section>

<div class="orn">✦</div>

<!-- QUICK START -->
<section id="quickstart">
  <div class="sec-label">Get running</div>
  <h2 class="sec-title">Up in <em>four steps</em></h2>
  <p class="sec-desc">Clone, configure, ship. No backend, no Docker, no headaches.</p>

  <div class="steps-grid">
    <div class="step-card">
      <div class="step-n">01</div>
      <h3>Clone & Install</h3>
      <p>Grab the repo and install dependencies.</p>
      <div class="code">
        <div class="code-bar"><span class="d dr"></span><span class="d dy"></span><span class="d dg"></span><span class="clang">bash</span></div>
        <pre>git clone https://github.com/
  YOUR_USERNAME/ai-resume-builder
cd ai-resume-builder
npm install</pre>
      </div>
    </div>

    <div class="step-card">
      <div class="step-n">02</div>
      <h3>Configure Keys</h3>
      <p>Copy the template and add your two API keys.</p>
      <div class="code">
        <div class="code-bar"><span class="d dr"></span><span class="d dy"></span><span class="d dg"></span><span class="clang">bash</span></div>
        <pre>cp .env.example .env.local</pre>
      </div>
      <div class="code">
        <div class="code-bar"><span class="d dr"></span><span class="d dy"></span><span class="d dg"></span><span class="clang">.env</span></div>
        <pre><span class="tk">VITE_ANTHROPIC_API_KEY</span>=<span class="ts">sk-ant-...</span>
<span class="tk">VITE_GEMINI_API_KEY</span>=<span class="ts">AIza...</span></pre>
      </div>
    </div>

    <div class="step-card">
      <div class="step-n">03</div>
      <h3>Run Locally</h3>
      <p>Start the dev server and open in your browser.</p>
      <div class="code">
        <div class="code-bar"><span class="d dr"></span><span class="d dy"></span><span class="d dg"></span><span class="clang">bash</span></div>
        <pre>npm run dev
<span class="tc"># → http://localhost:5173</span></pre>
      </div>
    </div>

    <div class="step-card">
      <div class="step-n">04</div>
      <h3>Build for Production</h3>
      <p>Compile the optimized bundle for deployment.</p>
      <div class="code">
        <div class="code-bar"><span class="d dr"></span><span class="d dy"></span><span class="d dg"></span><span class="clang">bash</span></div>
        <pre>npm run build    <span class="tc"># → /dist</span>
npm run preview  <span class="tc"># serve :4173</span></pre>
      </div>
    </div>
  </div>
</section>

<div class="orn">✦</div>

<!-- ENV VARS -->
<section>
  <div class="sec-label">Configuration</div>
  <h2 class="sec-title">Environment <em>Variables</em></h2>
  <p class="sec-desc">Two keys. That's all. Neither is ever committed to git.</p>

  <div class="tw">
    <table class="dt">
      <thead><tr><th>Variable</th><th>Required</th><th>Where to get it</th></tr></thead>
      <tbody>
        <tr>
          <td><code>VITE_ANTHROPIC_API_KEY</code></td>
          <td><span class="rq rq-y"></span></td>
          <td><a href="https://console.anthropic.com/settings/keys">console.anthropic.com/settings/keys</a></td>
        </tr>
        <tr>
          <td><code>VITE_GEMINI_API_KEY</code></td>
          <td><span class="rq rq-y"></span></td>
          <td><a href="https://aistudio.google.com/app/apikey">aistudio.google.com/app/apikey</a></td>
        </tr>
        <tr>
          <td><code>VITE_APP_URL</code></td>
          <td><span class="rq rq-n"></span></td>
          <td>Your deployed URL, e.g. <code>https://yourapp.vercel.app</code></td>
        </tr>
      </tbody>
    </table>
  </div>

  <div class="notice">
    <span class="ni">⚠</span>
    <div>
      <strong>Security note:</strong> Both keys carry a <code>VITE_</code> prefix, making them visible in the client bundle — intentional for a client-side-only app. Restrict keys to your domain at
      <a href="https://console.anthropic.com">console.anthropic.com</a> and
      <a href="https://console.cloud.google.com">Google Cloud Console</a> to prevent misuse.
    </div>
  </div>
</section>

<div class="orn">✦</div>

<!-- DEPLOY -->
<section id="deploy">
  <div class="sec-label">Deployment</div>
  <h2 class="sec-title">Deploy to <em>Vercel</em></h2>
  <p class="sec-desc">Three paths to production. Pick whichever fits your workflow.</p>

  <div class="dep-grid">
    <div class="dep-card">
      <div class="dep-letter">A</div>
      <h3>One-Click Deploy</h3>
      <p>Click below. Vercel prompts you for both API keys. Done in under 60 seconds.</p>
      <br/>
      <a href="https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/ai-resume-builder&env=VITE_ANTHROPIC_API_KEY,VITE_GEMINI_API_KEY" class="btn btn-primary" style="font-size:0.8rem;padding:10px 18px">
        ▲ Deploy to Vercel
      </a>
    </div>

    <div class="dep-card">
      <div class="dep-letter">B</div>
      <h3>Vercel CLI</h3>
      <p>Prefer the terminal? Three commands and you're live.</p>
      <div class="code" style="margin-top:14px">
        <div class="code-bar"><span class="d dr"></span><span class="d dy"></span><span class="d dg"></span><span class="clang">bash</span></div>
        <pre>npm i -g vercel
vercel login
vercel --prod</pre>
      </div>
    </div>

    <div class="dep-card">
      <div class="dep-letter">C</div>
      <h3>GitHub Integration</h3>
      <ol>
        <li>Push this repo to GitHub</li>
        <li>Go to <a href="https://vercel.com/new">vercel.com/new</a> → Import</li>
        <li>Add both env vars in the dashboard</li>
        <li>Click <strong>Deploy</strong> — <code style="font-family:'DM Mono',monospace;font-size:0.77rem;color:var(--accent)">vercel.json</code> handles the rest</li>
      </ol>
    </div>
  </div>

  <div class="notice" style="margin-top:1.5rem">
    <span class="ni">ℹ</span>
    <div>
      <code>vercel.json</code> automatically applies SPA redirects, immutable cache headers on <code>/assets/*</code>, and security headers on all responses.
    </div>
  </div>
</section>

<div class="orn">✦</div>

<!-- STRUCTURE -->
<section id="structure">
  <div class="sec-label">Architecture</div>
  <h2 class="sec-title">Project <em>Structure</em></h2>
  <p class="sec-desc">A clean, flat layout — everything has a clear home.</p>

  <div class="tree">
<span class="t-dir">ai-resume-builder/</span>
│
├── <span class="t-dir">public/</span>
│   ├── <span class="t-file">og-image.png</span>          <span class="t-com">  1200×630 Open Graph image</span>
│   ├── <span class="t-file">favicon.svg</span>
│   ├── <span class="t-file">robots.txt</span>
│   └── <span class="t-file">site.webmanifest</span>
│
├── <span class="t-dir">src/</span>
│   ├── <span class="t-dir">hooks/</span>
│   │   ├── <span class="t-file">useClaudeAPI.js</span>     <span class="t-com">  Streaming wrapper for Anthropic API</span>
│   │   └── <span class="t-file">useGeminiAPI.js</span>     <span class="t-com">  JSON wrapper for Gemini API</span>
│   │
│   ├── <span class="t-dir">components/</span>
│   │   ├── <span class="t-file">ResumeForm.jsx</span>      <span class="t-com">  Multi-step form (personal · exp · edu · skills)</span>
│   │   ├── <span class="t-file">AIOutput.jsx</span>        <span class="t-com">  Markdown renderer for Claude output</span>
│   │   ├── <span class="t-file">ATSScorer.jsx</span>       <span class="t-com">  ATS keyword analysis with score ring</span>
│   │   ├── <span class="t-file">ResumePreview.jsx</span>   <span class="t-com">  Live A4 iframe preview + PDF export</span>
│   │   ├── <span class="t-file">TemplateChooser.jsx</span> <span class="t-com">  SVG thumbnail template picker</span>
│   │   └── <span class="t-file">MockInterview.jsx</span>   <span class="t-com">  Full mock interview engine</span>
│   │
│   ├── <span class="t-dir">pages/</span>
│   │   └── <span class="t-file">Builder.jsx</span>         <span class="t-com">  Main resume builder page</span>
│   │
│   ├── <span class="t-file">resumeTemplates.js</span>      <span class="t-com">  4 HTML resume template renderers</span>
│   ├── <span class="t-file">App.jsx</span>
│   └── <span class="t-file">main.jsx</span>
│
├── <span class="t-file">index.html</span>               <span class="t-com">  SEO meta · OG tags · JSON-LD schema</span>
├── <span class="t-file">vercel.json</span>              <span class="t-com">  SPA rewrites · caching · security headers</span>
├── <span class="t-file">vite.config.js</span>           <span class="t-com">  Build config · chunk splitting</span>
├── <span class="t-file">.env.example</span>            <span class="t-com">  Template — copy to .env.local</span>
└── <span class="t-file">README.md</span>
  </div>
</section>

<div class="orn">✦</div>

<!-- API HOOKS -->
<section id="api">
  <div class="sec-label">Hook Reference</div>
  <h2 class="sec-title">API <em>Hooks</em></h2>
  <p class="sec-desc">Two clean hooks. One for streaming, one for structured JSON.</p>

  <div class="hook-grid">
    <div class="hook-card">
      <div class="hook-bar">
        <div class="hook-dot"></div>
        <div class="hook-name">useClaudeAPI — Streaming</div>
      </div>
      <pre><span style="color:var(--text-muted)"># Stream tokens as they arrive</span>
<span style="color:var(--accent)">const</span> { generate, loading, error }
  = <span style="color:var(--text-primary)">useClaudeAPI</span>()

<span style="color:var(--accent)">let</span> result = <span style="color:var(--accent-hover)">''</span>
<span style="color:var(--accent)">await</span> generate(
  systemPrompt,
  userMessage,
  chunk => {
    result += chunk
    setDisplay(result)
  }
)</pre>
    </div>

    <div class="hook-card">
      <div class="hook-bar">
        <div class="hook-dot"></div>
        <div class="hook-name">useGeminiAPI — Structured JSON</div>
      </div>
      <pre><span style="color:var(--text-muted)"># Returns a parsed JS object</span>
<span style="color:var(--accent)">const</span> { generateJSON, loading, error }
  = <span style="color:var(--text-primary)">useGeminiAPI</span>()

<span style="color:var(--accent)">const</span> data = <span style="color:var(--accent)">await</span> generateJSON(
  systemPrompt,
  userPrompt
)
<span style="color:var(--text-muted)"># → parsed object or null on fail</span></pre>
    </div>
  </div>
</section>

<div class="orn">✦</div>

<!-- SCRIPTS -->
<section>
  <div class="sec-label">Scripts</div>
  <h2 class="sec-title">Available <em>Commands</em></h2>
  <p class="sec-desc">Everything you need to develop, build, and validate.</p>
  <div class="scr-list">
    <div class="scr-row"><span class="scr-cmd">npm run dev</span><span class="scr-desc">Start the dev server on <code>:5173</code> with hot module replacement</span></div>
    <div class="scr-row"><span class="scr-cmd">npm run build</span><span class="scr-desc">Compile and optimize the production bundle into <code>/dist</code></span></div>
    <div class="scr-row"><span class="scr-cmd">npm run preview</span><span class="scr-desc">Locally serve the production build from <code>/dist</code> on <code>:4173</code></span></div>
    <div class="scr-row"><span class="scr-cmd">npm run lint</span><span class="scr-desc">Run ESLint across all source files to catch errors and enforce style</span></div>
  </div>
</section>

<div class="orn">✦</div>

<!-- BROWSER SUPPORT -->
<section>
  <div class="sec-label">Compatibility</div>
  <h2 class="sec-title">Browser <em>Support</em></h2>
  <p class="sec-desc">Works great everywhere modern. PDF export is cleanest in Chromium.</p>
  <div class="br-grid">
    <div class="br-card"><span class="br-icon">🌐</span><div class="br-name">Chrome</div><div class="br-ver">v90+</div></div>
    <div class="br-card"><span class="br-icon">🔷</span><div class="br-name">Edge</div><div class="br-ver">v90+</div></div>
    <div class="br-card"><span class="br-icon">🦊</span><div class="br-name">Firefox</div><div class="br-ver">v90+</div></div>
    <div class="br-card"><span class="br-icon">🧭</span><div class="br-name">Safari</div><div class="br-ver">v15+</div></div>
    <div class="br-card"><span class="br-icon">📱</span><div class="br-name">Mobile Safari</div><div class="br-ver">iOS 15+</div></div>
  </div>
</section>

<!-- FOOTER -->
<footer>
  <div class="foot-mark">Resume<em>AI</em></div>
  <p class="foot-tag">Built with Claude &amp; Gemini. No backend. No drama. Just results.</p>
  <div class="foot-links">
    <a href="https://github.com/YOUR_USERNAME/ai-resume-builder">★ Star on GitHub</a>
    <a href="https://github.com/YOUR_USERNAME/ai-resume-builder/issues">Report Bug</a>
    <a href="https://github.com/YOUR_USERNAME/ai-resume-builder/issues">Request Feature</a>
    <a href="https://console.anthropic.com/settings/keys">Get API Key</a>
  </div>
  <p class="foot-copy">MIT LICENSE · FREE TO USE, FORK, AND BUILD UPON</p>
</footer>

<script>
  function toggle() {
    const dark = document.documentElement.classList.toggle('dark');
    document.getElementById('tb').textContent = dark ? '☀ Light' : '☽ Dark';
  }
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.documentElement.classList.add('dark');
    document.getElementById('tb').textContent = '☀ Light';
  }
</script>
</body>
</html>
