// resumeTemplates.js
// Each template is a pure function: (resumeData) => HTML string
// resumeData shape:
// {
//   personal: { firstName, lastName, email, phone, location, linkedin, summary },
//   experience: [{ company, role, startDate, endDate, current, description, bullets[] }],
//   education:  [{ school, degree, field, year, gpa }],
//   skills:     { technical, soft, languages, certifications },
//   targetRole: string,
//   aiSummary:  string,   // from Gemini
//   aiSkills:   string[], // from Gemini
// }

function esc(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function bullets(desc = '', aiBullets = []) {
  if (aiBullets && aiBullets.length > 0) {
    return aiBullets.map(b => `<li>${esc(b)}</li>`).join('')
  }
  if (!desc) return ''
  return desc.split(/\n|•/).filter(Boolean).map(s => `<li>${esc(s.trim())}</li>`).join('')
}

function dateRange(exp) {
  if (!exp.startDate && !exp.endDate) return ''
  const end = exp.current ? 'Present' : exp.endDate || ''
  return `${exp.startDate || ''} – ${end}`
}

function skillList(skills = {}, aiSkills = []) {
  if (aiSkills && aiSkills.length > 0) return aiSkills
  const raw = [skills.technical, skills.soft, skills.languages, skills.certifications]
    .filter(Boolean).join(', ')
  return raw.split(',').map(s => s.trim()).filter(Boolean)
}

// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATE 1 — CLASSIC CORPORATE
// Serif, navy sidebar, traditional HR layout
// ─────────────────────────────────────────────────────────────────────────────
export function renderClassic(data) {
  const p = data.personal || {}
  const name = [p.firstName, p.lastName].filter(Boolean).join(' ') || 'Your Name'
  const summary = data.aiSummary || p.summary || ''
  const skills = skillList(data.skills, data.aiSkills)
  const exp = (data.experience || []).filter(e => e.company || e.role)
  const edu = (data.education || []).filter(e => e.school || e.degree)

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=EB+Garamond:wght@400;500;600&family=Source+Sans+3:wght@300;400;600&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { width: 210mm; min-height: 297mm; background: #fff; }
  body { font-family: 'Source Sans 3', sans-serif; font-size: 9.5pt; color: #2c2c2c; display: flex; }
  
  /* Sidebar */
  .sidebar { width: 68mm; background: #1a2744; color: #e8ecf4; padding: 32px 20px; flex-shrink: 0; }
  .sidebar h1 { font-family: 'EB Garamond', serif; font-size: 22pt; font-weight: 600; line-height: 1.1; color: #fff; margin-bottom: 4px; }
  .sidebar .role { font-size: 8.5pt; color: #8fa3c8; letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 24px; font-weight: 300; }
  .sidebar .divider { width: 30px; height: 2px; background: #4a7fcb; margin-bottom: 20px; }
  .sidebar-section { margin-bottom: 24px; }
  .sidebar-section h3 { font-size: 7pt; letter-spacing: 2px; text-transform: uppercase; color: #8fa3c8; margin-bottom: 10px; font-weight: 600; }
  .contact-item { font-size: 8pt; color: #c8d4e8; margin-bottom: 6px; line-height: 1.4; word-break: break-all; }
  .contact-label { font-size: 7pt; color: #8fa3c8; display: block; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 1px; }
  .skill-tag { display: inline-block; background: rgba(74,127,203,0.2); border: 1px solid rgba(74,127,203,0.4); color: #9db8e0; font-size: 7.5pt; padding: 2px 8px; border-radius: 2px; margin: 2px 2px 2px 0; }

  /* Main */
  .main { flex: 1; padding: 32px 28px; }
  .section { margin-bottom: 22px; }
  .section-title { font-family: 'EB Garamond', serif; font-size: 13pt; color: #1a2744; font-weight: 600; border-bottom: 1.5px solid #1a2744; padding-bottom: 4px; margin-bottom: 12px; }
  .summary-text { font-size: 9.5pt; line-height: 1.6; color: #3a3a3a; }
  .exp-item { margin-bottom: 14px; }
  .exp-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; margin-bottom: 3px; }
  .exp-role { font-weight: 600; font-size: 10pt; color: #1a2744; }
  .exp-date { font-size: 8pt; color: #7a8aaa; font-style: italic; white-space: nowrap; text-align: right; }
  .exp-company { font-size: 9pt; color: #4a7fcb; margin-bottom: 6px; }
  ul { padding-left: 14px; }
  li { font-size: 9pt; line-height: 1.6; margin-bottom: 3px; color: #3a3a3a; }
  .edu-item { display: flex; justify-content: space-between; margin-bottom: 8px; }
  .edu-degree { font-weight: 600; font-size: 9.5pt; color: #1a2744; }
  .edu-school { font-size: 9pt; color: #555; }
  .edu-year { font-size: 8.5pt; color: #7a8aaa; }

  @media print {
    html, body { width: 210mm; height: 297mm; }
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  }
</style>
</head>
<body>
  <div class="sidebar">
    <h1>${esc(name)}</h1>
    <div class="role">${esc(data.targetRole || 'Professional')}</div>
    <div class="divider"></div>

    <div class="sidebar-section">
      <h3>Contact</h3>
      ${p.email ? `<div class="contact-item"><span class="contact-label">Email</span>${esc(p.email)}</div>` : ''}
      ${p.phone ? `<div class="contact-item"><span class="contact-label">Phone</span>${esc(p.phone)}</div>` : ''}
      ${p.location ? `<div class="contact-item"><span class="contact-label">Location</span>${esc(p.location)}</div>` : ''}
      ${p.linkedin ? `<div class="contact-item"><span class="contact-label">LinkedIn</span>${esc(p.linkedin)}</div>` : ''}
    </div>

    ${skills.length ? `
    <div class="sidebar-section">
      <h3>Skills</h3>
      ${skills.map(s => `<span class="skill-tag">${esc(s)}</span>`).join('')}
    </div>` : ''}

    ${edu.length ? `
    <div class="sidebar-section">
      <h3>Education</h3>
      ${edu.map(e => `
        <div style="margin-bottom:12px">
          <div style="font-size:9pt;font-weight:600;color:#c8d4e8">${esc(e.degree || '')}</div>
          ${e.field ? `<div style="font-size:8pt;color:#9db8e0">${esc(e.field)}</div>` : ''}
          <div style="font-size:8pt;color:#8fa3c8">${esc(e.school || '')}${e.year ? ` · ${esc(e.year)}` : ''}</div>
        </div>
      `).join('')}
    </div>` : ''}
  </div>

  <div class="main">
    ${summary ? `
    <div class="section">
      <div class="section-title">Professional Summary</div>
      <p class="summary-text">${esc(summary)}</p>
    </div>` : ''}

    ${exp.length ? `
    <div class="section">
      <div class="section-title">Experience</div>
      ${exp.map(e => `
        <div class="exp-item">
          <div class="exp-header">
            <span class="exp-role">${esc(e.role || '')}</span>
            <span class="exp-date">${dateRange(e)}</span>
          </div>
          <div class="exp-company">${esc(e.company || '')}</div>
          <ul>${bullets(e.description, e.bullets)}</ul>
        </div>
      `).join('')}
    </div>` : ''}
  </div>
</body>
</html>`
}

// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATE 2 — MODERN MINIMAL
// Clean, full-width, geometric accent line, sans-serif
// ─────────────────────────────────────────────────────────────────────────────
export function renderModern(data) {
  const p = data.personal || {}
  const name = [p.firstName, p.lastName].filter(Boolean).join(' ') || 'Your Name'
  const summary = data.aiSummary || p.summary || ''
  const skills = skillList(data.skills, data.aiSkills)
  const exp = (data.experience || []).filter(e => e.company || e.role)
  const edu = (data.education || []).filter(e => e.school || e.degree)

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;700&family=DM+Serif+Display&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { width: 210mm; min-height: 297mm; background: #fff; }
  body { font-family: 'DM Sans', sans-serif; font-size: 9.5pt; color: #1e1e1e; }

  .header { background: #0f1923; color: white; padding: 36px 40px 28px; position: relative; overflow: hidden; text-align: left; }
  .header::after { content:''; position:absolute; bottom:0; left:0; right:0; height:3px; background: linear-gradient(90deg, #00d4aa, #0077ff); }
  .header-name { font-family: 'DM Serif Display', serif; font-size: 28pt; letter-spacing: -0.5px; color: #fff; line-height: 1.1; margin-bottom: 8px; }
  .header-role { font-size: 10pt; color: #00d4aa; font-weight: 500; letter-spacing: 0.5px; margin-bottom: 14px; }
  .header-contact { display: flex; gap: 20px; flex-wrap: wrap; align-items: center; }
  .header-contact span { font-size: 8pt; color: #8899aa; white-space: nowrap; }
  .header-contact span strong { color: #ccd6e0; font-weight: 500; margin-right: 3px; }

  .body { padding: 28px 40px; }
  .two-col { display: grid; grid-template-columns: 1fr 68mm; gap: 32px; }
  
  .section { margin-bottom: 22px; }
  .section-title { font-size: 7pt; font-weight: 700; letter-spacing: 2.5px; text-transform: uppercase; color: #00d4aa; margin-bottom: 12px; display: flex; align-items: center; gap: 8px; }
  .section-title::after { content:''; flex:1; height:1px; background:#e8ecf0; }
  .summary-text { font-size: 9.5pt; line-height: 1.7; color: #333; font-weight: 300; }

  .exp-item { margin-bottom: 16px; padding-left: 12px; border-left: 2px solid #e0e7ef; }
  .exp-item:hover { border-left-color: #00d4aa; }
  .exp-role { font-weight: 700; font-size: 10pt; color: #0f1923; margin-bottom: 4px; }
  .exp-meta { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; margin-bottom: 6px; }
  .exp-company { font-size: 9pt; color: #0077ff; font-weight: 500; }
  .exp-date { font-size: 8pt; color: #aab; text-align: right; }
  ul { padding-left: 12px; margin-top: 6px; }
  li { font-size: 8.5pt; line-height: 1.6; margin-bottom: 3px; color: #444; }

  .skill-pill { display: inline-block; background: #f0f7ff; color: #0055cc; border: 1px solid #c0d8f8; font-size: 7.5pt; padding: 3px 9px; border-radius: 20px; margin: 2px; font-weight: 500; }
  .edu-item { margin-bottom: 12px; }
  .edu-degree { font-weight: 600; font-size: 9.5pt; }
  .edu-school { font-size: 9pt; color: #667; margin-top: 1px; }
  .edu-year { font-size: 8pt; color: #00d4aa; font-weight: 500; margin-top: 2px; }

  @media print {
    html, body { width: 210mm; height: 297mm; }
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  }
</style>
</head>
<body>
  <div class="header">
    <div class="header-name">${esc(name)}</div>
    <div class="header-role">${esc(data.targetRole || 'Professional')}</div>
    <div class="header-contact">
      ${p.email ? `<span><strong>✉</strong>${esc(p.email)}</span>` : ''}
      ${p.phone ? `<span><strong>☎</strong>${esc(p.phone)}</span>` : ''}
      ${p.location ? `<span><strong>◎</strong>${esc(p.location)}</span>` : ''}
      ${p.linkedin ? `<span><strong>in</strong>${esc(p.linkedin)}</span>` : ''}
    </div>
  </div>

  <div class="body">
    <div class="two-col">
      <div>
        ${summary ? `
        <div class="section">
          <div class="section-title">Summary</div>
          <p class="summary-text">${esc(summary)}</p>
        </div>` : ''}

        ${exp.length ? `
        <div class="section">
          <div class="section-title">Experience</div>
          ${exp.map(e => `
            <div class="exp-item">
              <div class="exp-role">${esc(e.role || '')}</div>
              <div class="exp-meta">
                <span class="exp-company">${esc(e.company || '')}</span>
                <span class="exp-date">${dateRange(e)}</span>
              </div>
              <ul>${bullets(e.description, e.bullets)}</ul>
            </div>
          `).join('')}
        </div>` : ''}
      </div>

      <div>
        ${skills.length ? `
        <div class="section">
          <div class="section-title">Skills</div>
          ${skills.map(s => `<span class="skill-pill">${esc(s)}</span>`).join('')}
        </div>` : ''}

        ${edu.length ? `
        <div class="section">
          <div class="section-title">Education</div>
          ${edu.map(e => `
            <div class="edu-item">
              <div class="edu-degree">${esc(e.degree || '')}</div>
              <div class="edu-school">${esc(e.school || '')}${e.field ? ` · ${esc(e.field)}` : ''}</div>
              ${e.year ? `<div class="edu-year">${esc(e.year)}</div>` : ''}
            </div>
          `).join('')}
        </div>` : ''}
      </div>
    </div>
  </div>
</body>
</html>`
}

// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATE 3 — CREATIVE BOLD
// Strong typography, colorful accent sidebar, icon row, editorial feel
// ─────────────────────────────────────────────────────────────────────────────
export function renderCreative(data) {
  const p = data.personal || {}
  const name = [p.firstName, p.lastName].filter(Boolean).join(' ') || 'Your Name'
  const [firstName, ...rest] = name.split(' ')
  const lastName = rest.join(' ')
  const summary = data.aiSummary || p.summary || ''
  const skills = skillList(data.skills, data.aiSkills)
  const exp = (data.experience || []).filter(e => e.company || e.role)
  const edu = (data.education || []).filter(e => e.school || e.degree)

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Outfit:wght@300;400;500&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { width: 210mm; min-height: 297mm; background: #fff; }
  body { font-family: 'Outfit', sans-serif; font-size: 9.5pt; color: #111; display: flex; }

  .accent-bar { width: 10px; background: linear-gradient(180deg, #ff4d6d, #ff8800, #ffd700); flex-shrink: 0; }
  .sidebar { width: 60mm; background: #111; color: #fff; padding: 40px 22px; flex-shrink: 0; display: flex; flex-direction: column; }
  .name-first { font-family: 'Syne', sans-serif; font-size: 20pt; font-weight: 800; color: #fff; line-height: 1.1; letter-spacing: -0.02em; }
  .name-last  { font-family: 'Syne', sans-serif; font-size: 20pt; font-weight: 400; color: #ff4d6d; line-height: 1.1; letter-spacing: -0.02em; margin-bottom: 10px; }
  .role-tag { font-size: 7.5pt; background: rgba(255,77,109,0.15); color: #ff8099; border: 1px solid rgba(255,77,109,0.3); display: inline-block; padding: 4px 12px; border-radius: 20px; margin-bottom: 24px; letter-spacing: 0.8px; font-weight: 600; }

  .s-section { margin-bottom: 22px; }
  .s-title { font-family: 'Syne', sans-serif; font-size: 7pt; letter-spacing: 2px; text-transform: uppercase; color: #ff4d6d; margin-bottom: 10px; font-weight: 600; }
  .contact-row { font-size: 8pt; color: #bbb; margin-bottom: 5px; line-height: 1.4; }
  .skill-bar-wrap { margin-bottom: 7px; }
  .skill-name { font-size: 8pt; color: #ddd; margin-bottom: 3px; }
  .skill-bar { height: 3px; background: #333; border-radius: 2px; }
  .skill-bar-fill { height: 3px; border-radius: 2px; background: linear-gradient(90deg, #ff4d6d, #ff8800); }

  .main { flex: 1; padding: 36px 28px; }
  .section { margin-bottom: 22px; }
  .section-title { font-family: 'Syne', sans-serif; font-size: 11pt; font-weight: 700; color: #111; margin-bottom: 12px; display: flex; align-items: center; gap: 8px; }
  .section-title::before { content: ''; width: 18px; height: 3px; background: linear-gradient(90deg, #ff4d6d, #ff8800); display: inline-block; border-radius: 2px; }
  .summary-text { font-size: 9.5pt; line-height: 1.7; color: #333; }

  .exp-item { margin-bottom: 16px; }
  .exp-role { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 10.2pt; color: #111; letter-spacing: -0.01em; margin-bottom: 4px; }
  .exp-sub { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; margin-bottom: 6px; }
  .exp-company { font-size: 9pt; color: #ff4d6d; font-weight: 500; }
  .exp-date { font-size: 8pt; color: #999; font-style: italic; text-align: right; }
  ul { padding-left: 12px; margin-top: 6px; }
  li { font-size: 8.5pt; line-height: 1.6; margin-bottom: 3px; color: #444; }
  li::marker { color: #ff4d6d; }

  .edu-item { margin-bottom: 10px; }
  .edu-degree { font-family: 'Syne', sans-serif; font-weight: 600; font-size: 9.5pt; }
  .edu-school { font-size: 9pt; color: #666; }

  @media print {
    html, body { width: 210mm; height: 297mm; }
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  }
</style>
</head>
<body>
  <div class="accent-bar"></div>
  <div class="sidebar">
    <div class="name-first">${esc(firstName)}</div>
    <div class="name-last">${esc(lastName)}</div>
    <div class="role-tag">${esc(data.targetRole || 'Creative Professional')}</div>

    <div class="s-section">
      <div class="s-title">Contact</div>
      ${p.email    ? `<div class="contact-row">✉ ${esc(p.email)}</div>` : ''}
      ${p.phone    ? `<div class="contact-row">☎ ${esc(p.phone)}</div>` : ''}
      ${p.location ? `<div class="contact-row">◎ ${esc(p.location)}</div>` : ''}
      ${p.linkedin ? `<div class="contact-row">in ${esc(p.linkedin)}</div>` : ''}
    </div>

    ${skills.length ? `
    <div class="s-section">
      <div class="s-title">Skills</div>
      ${skills.slice(0, 8).map((s, i) => `
        <div class="skill-bar-wrap">
          <div class="skill-name">${esc(s)}</div>
          <div class="skill-bar"><div class="skill-bar-fill" style="width:${Math.max(60, 100 - i * 8)}%"></div></div>
        </div>
      `).join('')}
    </div>` : ''}

    ${edu.length ? `
    <div class="s-section">
      <div class="s-title">Education</div>
      ${edu.map(e => `
        <div style="margin-bottom:10px">
          <div style="font-size:9pt;font-weight:600;color:#eee">${esc(e.degree || '')}</div>
          <div style="font-size:8pt;color:#aaa">${esc(e.school || '')}${e.year ? ` · ${esc(e.year)}` : ''}</div>
        </div>
      `).join('')}
    </div>` : ''}
  </div>

  <div class="main">
    ${summary ? `
    <div class="section">
      <div class="section-title">About Me</div>
      <p class="summary-text">${esc(summary)}</p>
    </div>` : ''}

    ${exp.length ? `
    <div class="section">
      <div class="section-title">Experience</div>
      ${exp.map(e => `
        <div class="exp-item">
          <div class="exp-role">${esc(e.role || '')}</div>
          <div class="exp-sub">
            <span class="exp-company">${esc(e.company || '')}</span>
            <span class="exp-date">${dateRange(e)}</span>
          </div>
          <ul>${bullets(e.description, e.bullets)}</ul>
        </div>
      `).join('')}
    </div>` : ''}
  </div>
</body>
</html>`
}

// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATE 4 — EXECUTIVE ELEGANT
// Luxury two-column, gold rule, refined serif typography
// ─────────────────────────────────────────────────────────────────────────────
export function renderExecutive(data) {
  const p = data.personal || {}
  const name = [p.firstName, p.lastName].filter(Boolean).join(' ') || 'Your Name'
  const summary = data.aiSummary || p.summary || ''
  const skills = skillList(data.skills, data.aiSkills)
  const exp = (data.experience || []).filter(e => e.company || e.role)
  const edu = (data.education || []).filter(e => e.school || e.degree)

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=Jost:wght@300;400;500&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { width: 210mm; min-height: 297mm; background: #fafaf8; }
  body { font-family: 'Jost', sans-serif; font-size: 9.5pt; color: #2a2218; }

  .header { padding: 40px 44px 24px; text-align: center; border-bottom: 1.5px solid #d4b896; position: relative; }
  .header::after { content:''; display: block; width: 80px; height: 2px; background: #c8a96e; margin: 16px auto 0; }
  .name { font-family: 'Cormorant Garamond', serif; font-size: 36pt; font-weight: 600; letter-spacing: 3px; text-transform: uppercase; color: #1a1208; line-height: 1.1; margin-bottom: 8px; }
  .role { font-size: 9pt; letter-spacing: 4px; text-transform: uppercase; color: #c8a96e; margin-top: 8px; margin-bottom: 14px; font-weight: 300; }
  .contact-row { display: flex; justify-content: center; gap: 28px; margin-top: 14px; flex-wrap: wrap; }
  .contact-row span { font-size: 8.2pt; color: #7a6a50; letter-spacing: 0.8px; }
  .contact-row span::before { content: '— '; color: #c8a96e; }

  .body { display: grid; grid-template-columns: 1fr 76mm; gap: 0; }
  
  .main { padding: 28px 28px 28px 44px; border-right: 1px solid #e8dcc8; }
  .aside { padding: 28px 24px 28px 24px; background: #f5f0e8; }

  .section { margin-bottom: 22px; }
  .section-title { font-family: 'Cormorant Garamond', serif; font-size: 13pt; font-weight: 600; color: #1a1208; letter-spacing: 1px; margin-bottom: 3px; }
  .gold-rule { width: 100%; height: 1px; background: linear-gradient(90deg, #c8a96e, transparent); margin-bottom: 12px; }
  .summary-text { font-size: 9.5pt; line-height: 1.8; color: #3a3028; font-style: italic; font-family: 'Cormorant Garamond', serif; font-size: 11pt; }

  .exp-item { margin-bottom: 16px; }
  .exp-role { font-weight: 600; font-size: 10pt; color: #1a1208; letter-spacing: 0.5px; }
  .exp-meta { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; margin-bottom: 6px; }
  .exp-company { font-size: 9min; color: #c8a96e; font-style: italic; }
  .exp-date { font-size: 8pt; color: #9a8870; font-weight: 400; text-align: right; }
  ul { padding-left: 14px; margin-top: 6px; }
  li { font-size: 9pt; line-height: 1.7; margin-bottom: 3px; color: #3a3028; }
  li::marker { color: #c8a96e; }

  .aside .section-title { font-family: 'Cormorant Garamond', serif; font-size: 11pt; }
  .skill-item { font-size: 8.5pt; color: #3a3028; padding: 4px 0; border-bottom: 1px dotted #d8c8a8; display: flex; align-items: center; gap: 6px; }
  .skill-item::before { content: '◆'; font-size: 6pt; color: #c8a96e; flex-shrink: 0; }
  .edu-item { margin-bottom: 12px; }
  .edu-degree { font-weight: 500; font-size: 9.5pt; color: #1a1208; }
  .edu-school { font-size: 9pt; color: #7a6a50; margin-top: 1px; }
  .edu-year { font-size: 8pt; color: #c8a96e; margin-top: 2px; }

  @media print {
    html, body { width: 210mm; height: 297mm; }
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  }
</style>
</head>
<body>
  <div class="header">
    <div class="name">${esc(name)}</div>
    <div class="role">${esc(data.targetRole || 'Senior Professional')}</div>
    <div class="contact-row">
      ${p.email    ? `<span>${esc(p.email)}</span>` : ''}
      ${p.phone    ? `<span>${esc(p.phone)}</span>` : ''}
      ${p.location ? `<span>${esc(p.location)}</span>` : ''}
      ${p.linkedin ? `<span>${esc(p.linkedin)}</span>` : ''}
    </div>
  </div>

  <div class="body">
    <div class="main">
      ${summary ? `
      <div class="section">
        <div class="section-title">Executive Profile</div>
        <div class="gold-rule"></div>
        <p class="summary-text">${esc(summary)}</p>
      </div>` : ''}

      ${exp.length ? `
      <div class="section">
        <div class="section-title">Career History</div>
        <div class="gold-rule"></div>
        ${exp.map(e => `
          <div class="exp-item">
            <div class="exp-role">${esc(e.role || '')}</div>
            <div class="exp-meta">
              <span class="exp-company">${esc(e.company || '')}</span>
              <span class="exp-date">${dateRange(e)}</span>
            </div>
            <ul>${bullets(e.description, e.bullets)}</ul>
          </div>
        `).join('')}
      </div>` : ''}
    </div>

    <div class="aside">
      ${skills.length ? `
      <div class="section">
        <div class="section-title">Expertise</div>
        <div class="gold-rule"></div>
        ${skills.map(s => `<div class="skill-item">${esc(s)}</div>`).join('')}
      </div>` : ''}

      ${edu.length ? `
      <div class="section" style="margin-top:20px">
        <div class="section-title">Education</div>
        <div class="gold-rule"></div>
        ${edu.map(e => `
          <div class="edu-item">
            <div class="edu-degree">${esc(e.degree || '')}</div>
            <div class="edu-school">${esc(e.school || '')}${e.field ? `, ${esc(e.field)}` : ''}</div>
            ${e.year ? `<div class="edu-year">${esc(e.year)}</div>` : ''}
          </div>
        `).join('')}
      </div>` : ''}
    </div>
  </div>
</body>
</html>`
}

// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATE 5 — SIMPLE MODERN
// Minimal, single-column, easy-to-read layout
// ─────────────────────────────────────────────────────────────────────────────
export function renderSimple(data) {
  const p = data.personal || {}
  const name = [p.firstName, p.lastName].filter(Boolean).join(' ') || 'Your Name'
  const summary = data.aiSummary || p.summary || ''
  const skills = skillList(data.skills, data.aiSkills)
  const exp = (data.experience || []).filter(e => e.company || e.role)
  const edu = (data.education || []).filter(e => e.school || e.degree)

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { width: 210mm; min-height: 297mm; background: #fff; }
  body { font-family: 'Inter', sans-serif; font-size: 9.5pt; color: #202020; line-height: 1.6; padding: 32px 32px; }
  .wrapper { max-width: 176mm; margin: 0 auto; }
  .header { padding-bottom: 14px; margin-bottom: 20px; border-bottom: 1.5px solid #e5e7eb; }
  .name { font-size: 28pt; font-weight: 700; letter-spacing: -0.04em; margin-bottom: 8px; line-height: 1.1; }
  .role { font-size: 10pt; color: #6b7280; text-transform: uppercase; letter-spacing: 1.2px; font-weight: 600; }
  .contact { margin-top: 16px; display: flex; flex-wrap: wrap; gap: 12px; font-size: 8.6pt; color: #4b5563; }
  .section { margin-bottom: 22px; }
  .section-title { font-size: 8.6pt; font-weight: 700; letter-spacing: 1.8px; text-transform: uppercase; color: #111827; margin-bottom: 12px; }
  .summary { font-size: 9.3pt; color: #374151; line-height: 1.7; }
  .exp-item, .edu-item { margin-bottom: 15px; }
  .exp-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; margin-bottom: 4px; }
  .exp-role { font-weight: 700; font-size: 10pt; color: #111827; }
  .exp-company { font-size: 9pt; color: #4b5563; margin-bottom: 4px; }
  .exp-date { font-size: 8pt; color: #6b7280; text-align: right; }
  ul { padding-left: 14px; margin-top: 7px; }
  li { margin-bottom: 4px; color: #374151; font-size: 9pt; line-height: 1.6; }
  .skill-list { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px; }
  .skill-pill { padding: 5px 10px; border: 1px solid #d1d5db; border-radius: 999px; font-size: 8.2pt; color: #374151; }
  .edu-degree { font-weight: 600; color: #111827; }
  .edu-school { font-size: 9pt; color: #4b5563; }
  .edu-year { font-size: 8pt; color: #6b7280; margin-top: 2px; }
  @media print { html, body { width: 210mm; height: 297mm; } body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
</style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <div class="name">${esc(name)}</div>
      <div class="role">${esc(data.targetRole || 'Professional')}</div>
      <div class="contact">
        ${p.email ? `<span>${esc(p.email)}</span>` : ''}
        ${p.phone ? `<span>${esc(p.phone)}</span>` : ''}
        ${p.location ? `<span>${esc(p.location)}</span>` : ''}
        ${p.linkedin ? `<span>${esc(p.linkedin)}</span>` : ''}
      </div>
    </div>

    ${summary ? `
    <div class="section">
      <div class="section-title">Summary</div>
      <div class="summary">${esc(summary)}</div>
    </div>` : ''}

    ${exp.length ? `
    <div class="section">
      <div class="section-title">Experience</div>
      ${exp.map(e => `
        <div class="exp-item">
          <div class="exp-header">
            <div class="exp-role">${esc(e.role || '')}</div>
            <div class="exp-date">${dateRange(e)}</div>
          </div>
          <div class="exp-company">${esc(e.company || '')}</div>
          <ul>${bullets(e.description, e.bullets)}</ul>
        </div>
      `).join('')}
    </div>` : ''}

    ${skills.length ? `
    <div class="section">
      <div class="section-title">Skills</div>
      <div class="skill-list">
        ${skills.map(s => `<span class="skill-pill">${esc(s)}</span>`).join('')}
      </div>
    </div>` : ''}

    ${edu.length ? `
    <div class="section">
      <div class="section-title">Education</div>
      ${edu.map(e => `
        <div class="edu-item">
          <div class="edu-degree">${esc(e.degree || '')}</div>
          <div class="edu-school">${esc(e.school || '')}${e.year ? ` · ${esc(e.year)}` : ''}</div>
        </div>
      `).join('')}
    </div>` : ''}
  </div>
</body>
</html>`
}

// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATE 6 — CLEAN TWO-COLUMN
// Subtle accent bar, split sections, neutral palette
// ─────────────────────────────────────────────────────────────────────────────
export function renderClean(data) {
  const p = data.personal || {}
  const name = [p.firstName, p.lastName].filter(Boolean).join(' ') || 'Your Name'
  const summary = data.aiSummary || p.summary || ''
  const skills = skillList(data.skills, data.aiSkills)
  const exp = (data.experience || []).filter(e => e.company || e.role)
  const edu = (data.education || []).filter(e => e.school || e.degree)

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { width: 210mm; min-height: 297mm; background: #f7f7f7; }
  body { font-family: 'Inter', sans-serif; color: #1f2937; font-size: 9.4pt; padding: 28px; }
  .page { width: 210mm; min-height: 297mm; background: #ffffff; display: grid; grid-template-columns: 1fr 78mm; gap: 28px; padding: 30px; }
  .main { padding-right: 0; }
  .aside { background: #fafafb; padding: 22px; border-radius: 14px; border: 1px solid #e5e7eb; height: fit-content; }
  .header { margin-bottom: 20px; }
  .name { font-size: 26pt; font-weight: 700; letter-spacing: -0.04em; line-height: 1.1; margin-bottom: 6px; }
  .role { margin-top: 6px; font-size: 9.5pt; color: #4b5563; text-transform: uppercase; letter-spacing: 1.2px; font-weight: 600; }
  .section { margin-bottom: 22px; }
  .section-title { font-size: 8.6pt; text-transform: uppercase; letter-spacing: 1.9px; color: #2563eb; margin-bottom: 12px; font-weight: 700; }
  .summary { font-size: 9.3pt; line-height: 1.8; color: #374151; }
  .exp-item { margin-bottom: 16px; }
  .exp-role { font-weight: 700; font-size: 10pt; color: #111827; margin-bottom: 4px; }
  .exp-meta { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; margin-bottom: 5px; }
  .exp-company { font-size: 9pt; color: #2563eb; font-weight: 600; }
  .exp-date { font-size: 8pt; color: #6b7280; text-align: right; }
  ul { padding-left: 14px; margin-top: 7px; }
  li { margin-bottom: 4px; color: #374151; font-size: 9pt; line-height: 1.6; }
  .contact-list { display: grid; gap: 8px; font-size: 8.9pt; color: #4b5563; }
  .contact-label { font-weight: 600; color: #111827; }
  .skill-item, .edu-item { margin-bottom: 12px; }
  .skill-item span { display: inline-block; background: #e0f2fe; color: #0c4a6e; border-radius: 999px; padding: 5px 10px; font-size: 8.4pt; }
  .edu-degree { font-weight: 600; color: #111827; }
  .edu-school { font-size: 9pt; color: #4b5563; }
  .edu-year { font-size: 8pt; color: #6b7280; margin-top: 2px; }
  @media print { html, body { width: 210mm; height: 297mm; } body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
</style>
</head>
<body>
  <div class="page">
    <div class="main">
      <div class="header">
        <div class="name">${esc(name)}</div>
        <div class="role">${esc(data.targetRole || 'Professional')}</div>
      </div>

      ${summary ? `
      <div class="section">
        <div class="section-title">Summary</div>
        <div class="summary">${esc(summary)}</div>
      </div>` : ''}

      ${exp.length ? `
      <div class="section">
        <div class="section-title">Experience</div>
        ${exp.map(e => `
          <div class="exp-item">
            <div class="exp-role">${esc(e.role || '')}</div>
            <div class="exp-meta">
              <div class="exp-company">${esc(e.company || '')}</div>
              <div class="exp-date">${dateRange(e)}</div>
            </div>
            <ul>${bullets(e.description, e.bullets)}</ul>
          </div>
        `).join('')}
      </div>` : ''}
    </div>

    <aside class="aside">
      <div class="section">
        <div class="section-title">Contact</div>
        <div class="contact-list">
          ${p.email ? `<div><span class="contact-label">Email:</span> ${esc(p.email)}</div>` : ''}
          ${p.phone ? `<div><span class="contact-label">Phone:</span> ${esc(p.phone)}</div>` : ''}
          ${p.location ? `<div><span class="contact-label">Location:</span> ${esc(p.location)}</div>` : ''}
          ${p.linkedin ? `<div><span class="contact-label">LinkedIn:</span> ${esc(p.linkedin)}</div>` : ''}
        </div>
      </div>

      ${skills.length ? `
      <div class="section">
        <div class="section-title">Skills</div>
        ${skills.map(s => `<div class="skill-item"><span>${esc(s)}</span></div>`).join('')}
      </div>` : ''}

      ${edu.length ? `
      <div class="section">
        <div class="section-title">Education</div>
        ${edu.map(e => `
          <div class="edu-item">
            <div class="edu-degree">${esc(e.degree || '')}</div>
            <div class="edu-school">${esc(e.school || '')}${e.year ? ` · ${esc(e.year)}` : ''}</div>
          </div>
        `).join('')}
      </div>` : ''}
    </aside>
  </div>
</body>
</html>`
}

// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATE 7 — SWISS CLASSIC
// Clean grid, strong headings, subtle blue accent
// ─────────────────────────────────────────────────────────────────────────────
export function renderSwiss(data) {
  const p = data.personal || {}
  const name = [p.firstName, p.lastName].filter(Boolean).join(' ') || 'Your Name'
  const summary = data.aiSummary || p.summary || ''
  const skills = skillList(data.skills, data.aiSkills)
  const exp = (data.experience || []).filter(e => e.company || e.role)
  const edu = (data.education || []).filter(e => e.school || e.degree)

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { width: 210mm; min-height: 297mm; background: #fff; }
  body { font-family: 'Inter', sans-serif; color: #111827; font-size: 9.4pt; padding: 28px; }
  .page { width: 210mm; min-height: 297mm; display: grid; grid-template-columns: 54mm 1fr; gap: 26px; }
  .sidebar { padding: 24px 20px; border-right: 1.5px solid #e5e7eb; }
  .accent { width: 4px; height: 100%; background: #2563eb; position: absolute; left: 0; top: 0; }
  .name { font-size: 24pt; font-weight: 700; letter-spacing: -0.04em; margin-bottom: 6px; line-height: 1.1; }
  .role { font-size: 9.2pt; color: #2563eb; text-transform: uppercase; letter-spacing: 1.2px; margin-bottom: 22px; font-weight: 700; }
  .contact-item { font-size: 8.6pt; color: #4b5563; margin-bottom: 12px; line-height: 1.6; }
  .section { margin-bottom: 24px; }
  .section-title { font-size: 7.8pt; text-transform: uppercase; letter-spacing: 1.9px; color: #2563eb; margin-bottom: 12px; font-weight: 700; }
  .skill-pill { display: inline-block; margin: 4px 5px 4px 0; padding: 6px 9px; border: 1px solid #dbeafe; border-radius: 999px; font-size: 8.2pt; color: #1e3a8a; font-weight: 500; }
  .main { padding: 0 24px 0 0; }
  .section-heading { font-size: 10.2pt; font-weight: 700; margin-bottom: 12px; letter-spacing: -0.01em; }
  .item { margin-bottom: 17px; }
  .item-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; margin-bottom: 4px; }
  .item-role { font-size: 9.8pt; font-weight: 700; color: #111827; }
  .item-company { font-size: 8.8pt; color: #4b5563; margin-bottom: 2px; }
  .item-date { font-size: 8pt; color: #6b7280; text-align: right; }
  ul { padding-left: 14px; margin-top: 6px; }
  li { margin-bottom: 4px; font-size: 9pt; color: #374151; line-height: 1.6; }
  .summary { font-size: 9.2pt; color: #334155; line-height: 1.7; }
  .edu-degree { font-weight: 600; color: #111827; }
  .edu-school { font-size: 8.8pt; color: #475569; }
  .edu-year { font-size: 8pt; color: #6b7280; margin-top: 2px; }
  @media print { html, body { width: 210mm; height: 297mm; } body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
</style>
</head>
<body>
  <div class="page">
    <div class="sidebar">
      <div class="name">${esc(name)}</div>
      <div class="role">${esc(data.targetRole || 'Professional')}</div>
      ${p.email ? `<div class="contact-item">Email: ${esc(p.email)}</div>` : ''}
      ${p.phone ? `<div class="contact-item">Phone: ${esc(p.phone)}</div>` : ''}
      ${p.location ? `<div class="contact-item">Location: ${esc(p.location)}</div>` : ''}
      ${p.linkedin ? `<div class="contact-item">LinkedIn: ${esc(p.linkedin)}</div>` : ''}

      ${skills.length ? `
      <div class="section">
        <div class="section-title">Skills</div>
        ${skills.map(s => `<span class="skill-pill">${esc(s)}</span>`).join('')}
      </div>` : ''}

      ${edu.length ? `
      <div class="section">
        <div class="section-title">Education</div>
        ${edu.map(e => `
          <div class="item">
            <div class="edu-degree">${esc(e.degree || '')}</div>
            <div class="edu-school">${esc(e.school || '')}${e.year ? ` · ${esc(e.year)}` : ''}</div>
          </div>
        `).join('')}
      </div>` : ''}
    </div>

    <div class="main">
      ${summary ? `
      <div class="section">
        <div class="section-title">Profile</div>
        <div class="summary">${esc(summary)}</div>
      </div>` : ''}

      ${exp.length ? `
      <div class="section">
        <div class="section-title">Experience</div>
        ${exp.map(e => `
          <div class="item">
            <div class="item-header">
              <div class="item-role">${esc(e.role || '')}</div>
              <div class="item-date">${dateRange(e)}</div>
            </div>
            <div class="item-company">${esc(e.company || '')}</div>
            <ul>${bullets(e.description, e.bullets)}</ul>
          </div>
        `).join('')}
      </div>` : ''}
    </div>
  </div>
</body>
</html>`
}

// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATE 8 — TECH STARTUP
// Dark accent header, card sections, bold modern feel
// ─────────────────────────────────────────────────────────────────────────────
export function renderTech(data) {
  const p = data.personal || {}
  const name = [p.firstName, p.lastName].filter(Boolean).join(' ') || 'Your Name'
  const summary = data.aiSummary || p.summary || ''
  const skills = skillList(data.skills, data.aiSkills)
  const exp = (data.experience || []).filter(e => e.company || e.role)
  const edu = (data.education || []).filter(e => e.school || e.degree)

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { width: 210mm; min-height: 297mm; background: #121212; }
  body { font-family: 'Inter', sans-serif; color: #f8fafc; font-size: 9.4pt; padding: 26px; }
  .sheet { width: 210mm; min-height: 297mm; background: #0f172a; border-radius: 4px; padding: 30px; box-shadow: 0 14px 40px rgba(0,0,0,0.25); }
  .header { padding: 22px 26px; background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%); border-radius: 12px; margin-bottom: 24px; }
  .name { font-size: 28pt; font-weight: 700; color: #fff; margin-bottom: 8px; line-height: 1.1; letter-spacing: -0.02em; }
  .role { font-size: 9.2pt; text-transform: uppercase; letter-spacing: 1.9px; color: rgba(255,255,255,0.85); font-weight: 700; margin-bottom: 14px; }
  .contact { display: flex; flex-wrap: wrap; gap: 16px; margin-top: 14px; font-size: 8.6pt; color: rgba(255,255,255,0.8); }
  .columns { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
  .card { background: #111827; border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; padding: 20px; }
  .section-title { font-size: 8.3pt; text-transform: uppercase; letter-spacing: 1.9px; color: #38bdf8; margin-bottom: 12px; font-weight: 700; }
  .summary { color: #e2e8f0; line-height: 1.8; font-size: 9pt; }
  .exp-item { margin-bottom: 16px; }
  .exp-role { font-size: 10.2pt; font-weight: 700; color: #fff; margin-bottom: 4px; }
  .exp-company { font-size: 8.9pt; color: #38bdf8; margin-bottom: 3px; font-weight: 600; }
  .exp-date { font-size: 8.2pt; color: #94a3b8; margin-bottom: 6px; }
  ul { padding-left: 14px; margin-top: 7px; }
  li { margin-bottom: 5px; color: #cbd5e1; font-size: 8.9pt; line-height: 1.6; }
  .skill-pill { display: inline-block; margin: 3px 5px 3px 0; padding: 5px 10px; border: 1px solid rgba(56,189,248,0.4); border-radius: 999px; color: #cbd5e1; font-size: 8pt; }
  .edu-degree { font-weight: 600; color: #fff; }
  .edu-school { font-size: 8.8pt; color: #94a3b8; }
  .edu-year { font-size: 8pt; color: #94a3b8; margin-top: 2px; }
  @media print { html, body { width: 210mm; height: 297mm; } body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
</style>
</head>
<body>
  <div class="sheet">
    <div class="header">
      <div class="name">${esc(name)}</div>
      <div class="role">${esc(data.targetRole || 'Product Designer')}</div>
      <div class="contact">
        ${p.email ? `<span>${esc(p.email)}</span>` : ''}
        ${p.phone ? `<span>${esc(p.phone)}</span>` : ''}
        ${p.location ? `<span>${esc(p.location)}</span>` : ''}
        ${p.linkedin ? `<span>${esc(p.linkedin)}</span>` : ''}
      </div>
    </div>

    <div class="columns">
      <div class="card">
        ${summary ? `
        <div class="section-title">Summary</div>
        <div class="summary">${esc(summary)}</div>` : ''}
      </div>

      <div class="card">
        ${skills.length ? `
        <div class="section-title">Skills</div>
        ${skills.map(s => `<span class="skill-pill">${esc(s)}</span>`).join('')}` : ''}
      </div>
    </div>

    ${exp.length ? `
    <div class="card" style="margin-top:18px;">
      <div class="section-title">Experience</div>
      ${exp.map(e => `
        <div class="exp-item">
          <div class="exp-role">${esc(e.role || '')}</div>
          <div class="exp-company">${esc(e.company || '')}</div>
          <div class="exp-date">${dateRange(e)}</div>
          <ul>${bullets(e.description, e.bullets)}</ul>
        </div>
      `).join('')}
    </div>` : ''}

    ${edu.length ? `
    <div class="card" style="margin-top:18px;">
      <div class="section-title">Education</div>
      ${edu.map(e => `
        <div class="item">
          <div class="edu-degree">${esc(e.degree || '')}</div>
          <div class="edu-school">${esc(e.school || '')}${e.year ? ` · ${esc(e.year)}` : ''}</div>
        </div>
      `).join('')}
    </div>` : ''}
  </div>
</body>
</html>`
}

// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATE 9 — PROFESSIONAL
// Centered header, strong lines, classic work-first layout
// ─────────────────────────────────────────────────────────────────────────────
export function renderProfessional(data) {
  const p = data.personal || {}
  const name = [p.firstName, p.lastName].filter(Boolean).join(' ') || 'Your Name'
  const summary = data.aiSummary || p.summary || ''
  const skills = skillList(data.skills, data.aiSkills)
  const exp = (data.experience || []).filter(e => e.company || e.role)
  const edu = (data.education || []).filter(e => e.school || e.degree)

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { width: 210mm; min-height: 297mm; background: #fff; }
  body { font-family: 'Roboto', sans-serif; color: #111; font-size: 9.8pt; line-height: 1.55; padding: 30px 32px; }
  .page { max-width: 176mm; margin: 0 auto; }
  .header { text-align: center; margin-bottom: 22px; }
  .contact-line { font-size: 8.2pt; color: #4b5563; letter-spacing: 0.16em; text-transform: uppercase; margin-bottom: 8px; font-weight: 600; }
  .name { font-size: 34pt; font-weight: 700; letter-spacing: -0.04em; margin-bottom: 6px; line-height: 1.1; }
  .title { font-size: 9.2pt; text-transform: uppercase; letter-spacing: 0.2em; color: #111827; margin-bottom: 18px; font-weight: 700; }
  .divider { width: 100%; height: 1.5px; background: #111827; opacity: 0.15; margin: 0 auto 24px; }
  .section { margin-bottom: 24px; }
  .section-title { position: relative; display: inline-block; font-size: 8.7pt; letter-spacing: 0.2em; text-transform: uppercase; color: #111827; font-weight: 700; margin-bottom: 16px; }
  .section-title::after { content: ''; position: absolute; bottom: -9px; left: 0; width: 100%; height: 1.2px; background: #111827; opacity: 0.15; }
  .summary { font-size: 9.1pt; color: #374151; line-height: 1.8; }
  .job { margin-bottom: 19px; }.job-header { display: flex; justify-content: space-between; flex-wrap: wrap; gap: 12px; margin-bottom: 3px; }
  .job-title { font-weight: 700; font-size: 10.2pt; letter-spacing: -0.01em; }
  .job-company { margin-top: 3px; font-size: 8.9pt; color: #4b5563; font-weight: 600; }
  .job-dates { font-size: 8pt; color: #6b7280; text-align: right; }
  .job-location { font-size: 8.2pt; color: #6b7280; margin-top: 2px; }
  ul { padding-left: 18px; margin-top: 9px; }
  li { margin-bottom: 7px; font-size: 9pt; color: #292524; line-height: 1.7; }
  .edu-item { margin-bottom: 14px; }
  .edu-degree { font-weight: 700; font-size: 9.2pt; letter-spacing: -0.01em; }
  .edu-meta { font-size: 8.8pt; color: #4b5563; margin-top: 2px; font-weight: 500; }
  .skills-list { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 7px 18px; list-style: none; padding: 0; margin: 0; }
  .skills-list li { padding-left: 10px; font-size: 9pt; color: #292524; position: relative; line-height: 1.7; }
  .skills-list li::before { content: '◆'; position: absolute; left: 0; color: #111827; font-size: 5pt; }
  @media print { html, body { width: 210mm; height: 297mm; } body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
</style>
</head>
<body>
  <div class="page">
    <div class="header">
      <div class="contact-line">
        ${p.location ? esc(p.location) + ' · ' : ''}${p.email ? esc(p.email) + ' · ' : ''}${p.phone ? esc(p.phone) : ''}
      </div>
      <div class="name">${esc(name)}</div>
      <div class="title">${esc(data.targetRole || 'Professional Summary')}</div>
      <div class="divider"></div>
    </div>

    ${summary ? `
    <div class="section">
      <div class="section-title">Professional Summary</div>
      <div class="summary">${esc(summary)}</div>
    </div>` : ''}

    ${exp.length ? `
    <div class="section">
      <div class="section-title">Work Experience</div>
      ${exp.map(e => `
        <div class="job">
          <div class="job-header">
            <div>
              <div class="job-title">${esc(e.role || '')}</div>
              <div class="job-company">${esc(e.company || '')}</div>
            </div>
            <div class="job-dates">${dateRange(e)}</div>
          </div>
          ${e.location ? `<div class="job-location">${esc(e.location)}</div>` : ''}
          <ul>${bullets(e.description, e.bullets)}</ul>
        </div>
      `).join('')}
    </div>` : ''}

    ${edu.length ? `
    <div class="section">
      <div class="section-title">Education</div>
      ${edu.map(e => `
        <div class="edu-item">
          <div class="edu-degree">${esc(e.degree || '')}</div>
          <div class="edu-meta">${esc(e.school || '')}${e.year ? ` · ${esc(e.year)}` : ''}</div>
        </div>
      `).join('')}
    </div>` : ''}

    ${skills.length ? `
    <div class="section">
      <div class="section-title">Skills</div>
      <ul class="skills-list">
        ${skills.map(s => `<li>${esc(s)}</li>`).join('')}
      </ul>
    </div>` : ''}
  </div>
</body>
</html>`
}

// ─────────────────────────────────────────────────────────────────────────────
// Registry
// ─────────────────────────────────────────────────────────────────────────────
export const TEMPLATES = [
  {
    id: 'classic',
    label: 'Classic',
    subtitle: 'Corporate · Serif · Navy',
    render: renderClassic,
    accent: '#1a2744',
    preview: ['#1a2744', '#4a7fcb', '#e8ecf4'],
  },
  {
    id: 'modern',
    label: 'Modern',
    subtitle: 'Minimal · Clean · Teal',
    render: renderModern,
    accent: '#00d4aa',
    preview: ['#0f1923', '#00d4aa', '#0077ff'],
  },
  {
    id: 'creative',
    label: 'Creative',
    subtitle: 'Bold · Editorial · Vivid',
    render: renderCreative,
    accent: '#ff4d6d',
    preview: ['#111', '#ff4d6d', '#ff8800'],
  },
  {
    id: 'executive',
    label: 'Executive',
    subtitle: 'Luxury · Elegant · Gold',
    render: renderExecutive,
    accent: '#c8a96e',
    preview: ['#1a1208', '#c8a96e', '#f5f0e8'],
  },
  {
    id: 'simple',
    label: 'Simple',
    subtitle: 'Minimal · Easy · Readable',
    render: renderSimple,
    accent: '#2b2b2b',
    preview: ['#ffffff', '#2b2b2b', '#d1d5db'],
  },
  {
    id: 'clean',
    label: 'Clean',
    subtitle: 'Split · Neutral · Modern',
    render: renderClean,
    accent: '#2563eb',
    preview: ['#ffffff', '#2563eb', '#eff6ff'],
  },
  {
    id: 'professional',
    label: 'Professional',
    subtitle: 'Classic · Centered · Sharp',
    render: renderProfessional,
    accent: '#111111',
    preview: ['#ffffff', '#111111', '#d1d5db'],
  },
  {
    id: 'swiss',
    label: 'Swiss',
    subtitle: 'Grid · Neutral · Professional',
    render: renderSwiss,
    accent: '#2563eb',
    preview: ['#ffffff', '#2563eb', '#f8fafc'],
  },
  {
    id: 'tech',
    label: 'Tech',
    subtitle: 'Startup · Dark · Bold',
    render: renderTech,
    accent: '#38bdf8',
    preview: ['#0f172a', '#38bdf8', '#0ea5e9'],
  },
]