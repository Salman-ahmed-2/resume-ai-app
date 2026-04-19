// resumeData shape:
// {
//   personal: { firstName, lastName, email, phone, location, linkedin, summary },
//   experience: [{ company, role, startDate, endDate, current, description, bullets[] }],
//   education:  [{ school, degree, field, year, gpa }],
//   skills:     { technical, soft, languages, certifications },
//   targetRole: string,
//   aiSummary:  string,
//   aiSkills:   string[],
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
  .sidebar { width: 68mm; background: #1a2744; color: #e8ecf4; padding: 32px 20px; flex-shrink: 0; }
  .sidebar h1 { font-family: 'EB Garamond', serif; font-size: 22pt; font-weight: 600; line-height: 1.1; color: #fff; margin-bottom: 4px; }
  .sidebar .role { font-size: 8.5pt; color: #8fa3c8; letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 24px; font-weight: 300; }
  .sidebar .divider { width: 30px; height: 2px; background: #4a7fcb; margin-bottom: 20px; }
  .sidebar-section { margin-bottom: 24px; }
  .sidebar-section h3 { font-size: 7pt; letter-spacing: 2px; text-transform: uppercase; color: #8fa3c8; margin-bottom: 10px; font-weight: 600; }
  .contact-item { font-size: 8pt; color: #c8d4e8; margin-bottom: 6px; line-height: 1.4; word-break: break-all; }
  .contact-label { font-size: 7pt; color: #8fa3c8; display: block; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 1px; }
  .skill-tag { display: inline-block; background: rgba(74,127,203,0.2); border: 1px solid rgba(74,127,203,0.4); color: #9db8e0; font-size: 7.5pt; padding: 2px 8px; border-radius: 2px; margin: 2px 2px 2px 0; }
  .main { flex: 1; padding: 32px 28px; }
  .section { margin-bottom: 22px; }
  .section-title { font-family: 'EB Garamond', serif; font-size: 13pt; color: #1a2744; font-weight: 600; border-bottom: 1.5px solid #1a2744; padding-bottom: 4px; margin-bottom: 12px; }
  .summary-text { font-size: 9.5pt; line-height: 1.6; color: #3a3a3a; }
  .exp-item { margin-bottom: 14px; }
  .exp-header { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 2px; }
  .exp-role { font-weight: 600; font-size: 10pt; color: #1a2744; }
  .exp-date { font-size: 8pt; color: #7a8aaa; font-style: italic; white-space: nowrap; margin-left: 8px; }
  .exp-company { font-size: 9pt; color: #4a7fcb; margin-bottom: 5px; }
  ul { padding-left: 14px; }
  li { font-size: 9pt; line-height: 1.5; margin-bottom: 2px; color: #3a3a3a; }
  .edu-item { display: flex; justify-content: space-between; margin-bottom: 8px; }
  .edu-degree { font-weight: 600; font-size: 9.5pt; color: #1a2744; }
  .edu-school { font-size: 9pt; color: #555; }
  .edu-year { font-size: 8.5pt; color: #7a8aaa; }
  @media print { html, body { width: 210mm; height: 297mm; } body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
</style>
</head>
<body>
  <div class="sidebar">
    <h1>${esc(name)}</h1>
    <div class="role">${esc(data.targetRole || 'Professional')}</div>
    <div class="divider"></div>
    <div class="sidebar-section">
      <h3>Contact</h3>
      ${p.email    ? `<div class="contact-item"><span class="contact-label">Email</span>${esc(p.email)}</div>` : ''}
      ${p.phone    ? `<div class="contact-item"><span class="contact-label">Phone</span>${esc(p.phone)}</div>` : ''}
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
  .header { background: #0f1923; color: white; padding: 36px 40px 28px; position: relative; overflow: hidden; }
  .header::after { content:''; position:absolute; bottom:0; left:0; right:0; height:3px; background: linear-gradient(90deg, #00d4aa, #0077ff); }
  .header-name { font-family: 'DM Serif Display', serif; font-size: 28pt; letter-spacing: -0.5px; color: #fff; line-height: 1; }
  .header-role { font-size: 10pt; color: #00d4aa; font-weight: 500; letter-spacing: 0.5px; margin-top: 4px; margin-bottom: 18px; }
  .header-contact { display: flex; gap: 20px; flex-wrap: wrap; }
  .header-contact span { font-size: 8pt; color: #8899aa; }
  .header-contact span strong { color: #ccd6e0; font-weight: 500; margin-right: 3px; }
  .body { padding: 28px 40px; }
  .two-col { display: grid; grid-template-columns: 1fr 68mm; gap: 32px; }
  .section { margin-bottom: 22px; }
  .section-title { font-size: 7pt; font-weight: 700; letter-spacing: 2.5px; text-transform: uppercase; color: #00d4aa; margin-bottom: 12px; display: flex; align-items: center; gap: 8px; }
  .section-title::after { content:''; flex:1; height:1px; background:#e8ecf0; }
  .summary-text { font-size: 9.5pt; line-height: 1.7; color: #333; font-weight: 300; }
  .exp-item { margin-bottom: 16px; padding-left: 12px; border-left: 2px solid #e0e7ef; }
  .exp-role { font-weight: 700; font-size: 10pt; color: #0f1923; }
  .exp-meta { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
  .exp-company { font-size: 9pt; color: #0077ff; font-weight: 500; }
  .exp-date { font-size: 8pt; color: #aab; }
  ul { padding-left: 12px; margin-top: 5px; }
  li { font-size: 8.5pt; line-height: 1.5; margin-bottom: 2px; color: #444; }
  .skill-pill { display: inline-block; background: #f0f7ff; color: #0055cc; border: 1px solid #c0d8f8; font-size: 7.5pt; padding: 3px 9px; border-radius: 20px; margin: 2px; font-weight: 500; }
  .edu-item { margin-bottom: 12px; }
  .edu-degree { font-weight: 600; font-size: 9.5pt; }
  .edu-school { font-size: 9pt; color: #667; margin-top: 1px; }
  .edu-year { font-size: 8pt; color: #00d4aa; font-weight: 500; margin-top: 2px; }
  @media print { html, body { width: 210mm; height: 297mm; } body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
</style>
</head>
<body>
  <div class="header">
    <div class="header-name">${esc(name)}</div>
    <div class="header-role">${esc(data.targetRole || 'Professional')}</div>
    <div class="header-contact">
      ${p.email    ? `<span><strong>✉</strong>${esc(p.email)}</span>` : ''}
      ${p.phone    ? `<span><strong>☎</strong>${esc(p.phone)}</span>` : ''}
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
  .sidebar { width: 60mm; background: #111; color: #fff; padding: 36px 20px; flex-shrink: 0; }
  .name-first { font-family: 'Syne', sans-serif; font-size: 20pt; font-weight: 800; color: #fff; line-height: 1; }
  .name-last  { font-family: 'Syne', sans-serif; font-size: 20pt; font-weight: 400; color: #ff4d6d; line-height: 1; margin-bottom: 4px; }
  .role-tag { font-size: 7.5pt; background: rgba(255,77,109,0.15); color: #ff8099; border: 1px solid rgba(255,77,109,0.3); display: inline-block; padding: 3px 10px; border-radius: 20px; margin-bottom: 24px; letter-spacing: 0.5px; }
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
  .exp-role { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 10pt; color: #111; }
  .exp-sub { display: flex; justify-content: space-between; margin-bottom: 5px; }
  .exp-company { font-size: 9pt; color: #ff4d6d; font-weight: 500; }
  .exp-date { font-size: 8pt; color: #999; font-style: italic; }
  ul { padding-left: 12px; }
  li { font-size: 8.5pt; line-height: 1.5; margin-bottom: 3px; color: #444; }
  li::marker { color: #ff4d6d; }
  .edu-item { margin-bottom: 10px; }
  .edu-degree { font-family: 'Syne', sans-serif; font-weight: 600; font-size: 9.5pt; }
  .edu-school { font-size: 9pt; color: #666; }
  @media print { html, body { width: 210mm; height: 297mm; } body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
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
  .header { padding: 40px 44px 20px; text-align: center; border-bottom: 1px solid #c8a96e; position: relative; }
  .header::after { content:''; display: block; width: 60px; height: 2px; background: #c8a96e; margin: 16px auto 0; }
  .name { font-family: 'Cormorant Garamond', serif; font-size: 34pt; font-weight: 600; letter-spacing: 3px; text-transform: uppercase; color: #1a1208; line-height: 1; }
  .role { font-size: 8.5pt; letter-spacing: 4px; text-transform: uppercase; color: #c8a96e; margin-top: 6px; font-weight: 300; }
  .contact-row { display: flex; justify-content: center; gap: 24px; margin-top: 14px; flex-wrap: wrap; }
  .contact-row span { font-size: 8pt; color: #7a6a50; letter-spacing: 0.5px; }
  .contact-row span::before { content: '— '; color: #c8a96e; }
  .body { display: grid; grid-template-columns: 1fr 72mm; gap: 0; }
  .main { padding: 28px 28px 28px 44px; border-right: 1px solid #e8dcc8; }
  .aside { padding: 28px 24px 28px 24px; background: #f5f0e8; }
  .section { margin-bottom: 22px; }
  .section-title { font-family: 'Cormorant Garamond', serif; font-size: 13pt; font-weight: 600; color: #1a1208; letter-spacing: 1px; margin-bottom: 3px; }
  .gold-rule { width: 100%; height: 1px; background: linear-gradient(90deg, #c8a96e, transparent); margin-bottom: 12px; }
  .summary-text { font-size: 9.5pt; line-height: 1.8; color: #3a3028; font-style: italic; font-family: 'Cormorant Garamond', serif; font-size: 11pt; }
  .exp-item { margin-bottom: 16px; }
  .exp-role { font-weight: 500; font-size: 10pt; color: #1a1208; letter-spacing: 0.3px; }
  .exp-meta { display: flex; justify-content: space-between; margin-bottom: 6px; }
  .exp-company { font-size: 9pt; color: #c8a96e; font-style: italic; }
  .exp-date { font-size: 8pt; color: #9a8870; font-weight: 300; }
  ul { padding-left: 14px; }
  li { font-size: 9pt; line-height: 1.6; margin-bottom: 2px; color: #3a3028; }
  li::marker { color: #c8a96e; }
  .aside .section-title { font-family: 'Cormorant Garamond', serif; font-size: 11pt; }
  .skill-item { font-size: 8.5pt; color: #3a3028; padding: 4px 0; border-bottom: 1px dotted #d8c8a8; display: flex; align-items: center; gap: 6px; }
  .skill-item::before { content: '◆'; font-size: 6pt; color: #c8a96e; flex-shrink: 0; }
  .edu-item { margin-bottom: 12px; }
  .edu-degree { font-weight: 500; font-size: 9.5pt; color: #1a1208; }
  .edu-school { font-size: 9pt; color: #7a6a50; margin-top: 1px; }
  .edu-year { font-size: 8pt; color: #c8a96e; margin-top: 2px; }
  @media print { html, body { width: 210mm; height: 297mm; } body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
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
// TEMPLATE 5 — TERMINAL / DEVELOPER
// Dark terminal aesthetic, monospace, matrix-green on near-black
// ─────────────────────────────────────────────────────────────────────────────
export function renderTerminal(data) {
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
  @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;700&family=Space+Grotesk:wght@400;600&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { width: 210mm; min-height: 297mm; background: #0d1117; }
  body { font-family: 'JetBrains Mono', monospace; font-size: 8.5pt; color: #c9d1d9; }
  .topbar { background: #161b22; border-bottom: 1px solid #30363d; padding: 10px 32px; display: flex; align-items: center; gap: 8px; }
  .dot { width: 11px; height: 11px; border-radius: 50%; }
  .dot-red { background: #ff5f56; } .dot-yellow { background: #ffbd2e; } .dot-green { background: #27c93f; }
  .topbar-title { font-size: 8pt; color: #58a6ff; margin-left: 12px; opacity: 0.7; }
  .header { padding: 28px 32px 20px; border-bottom: 1px solid #21262d; }
  .prompt { font-size: 8pt; color: #56d364; margin-bottom: 6px; }
  .prompt span { color: #79c0ff; }
  .name { font-family: 'JetBrains Mono', monospace; font-size: 22pt; font-weight: 700; color: #e6edf3; line-height: 1; margin-bottom: 4px; }
  .role-line { font-size: 9pt; color: #56d364; margin-bottom: 16px; }
  .role-line .comment { color: #8b949e; }
  .contact-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 4px 24px; }
  .contact-item { font-size: 7.5pt; color: #8b949e; }
  .contact-item .key { color: #79c0ff; } .contact-item .eq { color: #ff7b72; } .contact-item .val { color: #a5d6ff; }
  .body { display: grid; grid-template-columns: 1fr 72mm; }
  .main { padding: 24px 20px 24px 32px; border-right: 1px solid #21262d; }
  .aside { padding: 24px 20px; background: #0d1117; }
  .section { margin-bottom: 22px; }
  .section-header { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; }
  .section-hash { color: #ff7b72; font-weight: 700; font-size: 11pt; }
  .section-title { font-size: 9pt; font-weight: 700; color: #f0f6fc; letter-spacing: 0.5px; }
  .section-line { flex: 1; height: 1px; background: #21262d; }
  .summary-text { font-size: 8.5pt; line-height: 1.8; color: #8b949e; font-family: 'Space Grotesk', sans-serif; border-left: 2px solid #56d364; padding-left: 12px; }
  .exp-item { margin-bottom: 16px; padding: 10px 12px; background: #161b22; border: 1px solid #21262d; border-radius: 4px; border-left: 3px solid #56d364; }
  .exp-fn { color: #d2a8ff; font-size: 8pt; margin-bottom: 3px; font-weight: 500; }
  .exp-fn .fn-name { color: #79c0ff; } .exp-fn .fn-args { color: #ffa657; }
  .exp-role { font-weight: 700; font-size: 9.5pt; color: #e6edf3; }
  .exp-meta { display: flex; justify-content: space-between; margin-bottom: 6px; }
  .exp-company { font-size: 8pt; color: #56d364; }
  .exp-date { font-size: 7.5pt; color: #8b949e; }
  ul { padding-left: 0; list-style: none; margin-top: 6px; }
  li { font-size: 8pt; line-height: 1.6; margin-bottom: 3px; color: #c9d1d9; font-family: 'Space Grotesk', sans-serif; padding-left: 14px; position: relative; }
  li::before { content: '>'; color: #56d364; position: absolute; left: 0; font-family: 'JetBrains Mono', monospace; }
  .skill-tag { display: inline-block; background: rgba(86,211,100,0.08); border: 1px solid rgba(86,211,100,0.2); color: #56d364; font-size: 7pt; padding: 2px 7px; border-radius: 3px; margin: 2px 2px 2px 0; }
  .edu-item { margin-bottom: 12px; padding: 8px 10px; background: #161b22; border: 1px solid #21262d; border-radius: 4px; }
  .edu-degree { font-size: 8.5pt; font-weight: 700; color: #e6edf3; }
  .edu-school { font-size: 8pt; color: #79c0ff; margin-top: 2px; }
  .edu-year { font-size: 7.5pt; color: #8b949e; margin-top: 2px; }
  @media print { html, body { width: 210mm; height: 297mm; background: #0d1117; } body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
</style>
</head>
<body>
  <div class="topbar">
    <div class="dot dot-red"></div><div class="dot dot-yellow"></div><div class="dot dot-green"></div>
    <div class="topbar-title">resume.sh — ${esc(name)}</div>
  </div>
  <div class="header">
    <div class="prompt"><span>~/resume</span> $ cat profile.json</div>
    <div class="name">${esc(name)}</div>
    <div class="role-line"><span class="comment">// </span>${esc(data.targetRole || 'Software Engineer')}</div>
    <div class="contact-grid">
      ${p.email    ? `<div class="contact-item"><span class="key">email</span><span class="eq">: </span><span class="val">"${esc(p.email)}"</span></div>` : ''}
      ${p.phone    ? `<div class="contact-item"><span class="key">phone</span><span class="eq">: </span><span class="val">"${esc(p.phone)}"</span></div>` : ''}
      ${p.location ? `<div class="contact-item"><span class="key">location</span><span class="eq">: </span><span class="val">"${esc(p.location)}"</span></div>` : ''}
      ${p.linkedin ? `<div class="contact-item"><span class="key">linkedin</span><span class="eq">: </span><span class="val">"${esc(p.linkedin)}"</span></div>` : ''}
    </div>
  </div>
  <div class="body">
    <div class="main">
      ${summary ? `
      <div class="section">
        <div class="section-header"><span class="section-hash">##</span><span class="section-title">SUMMARY</span><div class="section-line"></div></div>
        <p class="summary-text">${esc(summary)}</p>
      </div>` : ''}
      ${exp.length ? `
      <div class="section">
        <div class="section-header"><span class="section-hash">##</span><span class="section-title">EXPERIENCE</span><div class="section-line"></div></div>
        ${exp.map(e => `
          <div class="exp-item">
            <div class="exp-fn"><span class="fn-name">${esc(e.role || 'role')}</span>(<span class="fn-args">${esc(e.company || '')}</span>)</div>
            <div class="exp-meta"><span class="exp-company">${esc(e.company || '')}</span><span class="exp-date">${dateRange(e)}</span></div>
            <ul>${bullets(e.description, e.bullets)}</ul>
          </div>
        `).join('')}
      </div>` : ''}
    </div>
    <div class="aside">
      ${skills.length ? `
      <div class="section">
        <div class="section-header"><span class="section-hash">#</span><span class="section-title">STACK</span><div class="section-line"></div></div>
        ${skills.map(s => `<span class="skill-tag">${esc(s)}</span>`).join('')}
      </div>` : ''}
      ${edu.length ? `
      <div class="section" style="margin-top:20px">
        <div class="section-header"><span class="section-hash">#</span><span class="section-title">EDUCATION</span><div class="section-line"></div></div>
        ${edu.map(e => `
          <div class="edu-item">
            <div class="edu-degree">${esc(e.degree || '')}</div>
            ${e.field ? `<div style="font-size:7.5pt;color:#8b949e">${esc(e.field)}</div>` : ''}
            <div class="edu-school">${esc(e.school || '')}</div>
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
// TEMPLATE 6 — ACADEMIC / SCHOLAR
// Traditional CV layout, deep slate, clean columns, suited for academia
// ─────────────────────────────────────────────────────────────────────────────
export function renderAcademic(data) {
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
  @import url('https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Source+Serif+4:wght@300;400;600&family=Fira+Sans:wght@300;400;500&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { width: 210mm; min-height: 297mm; background: #f8f7f4; }
  body { font-family: 'Fira Sans', sans-serif; font-size: 9.5pt; color: #2d2d2d; }
  .header { padding: 36px 44px 24px; background: #fff; border-bottom: 3px double #34495e; }
  .name { font-family: 'Libre Baskerville', serif; font-size: 26pt; font-weight: 700; color: #1a1a2e; letter-spacing: 0.5px; line-height: 1; }
  .role { font-size: 10pt; color: #34495e; font-style: italic; margin-top: 4px; margin-bottom: 16px; font-family: 'Libre Baskerville', serif; }
  .header-bottom { display: flex; justify-content: space-between; align-items: flex-end; }
  .contact-block { display: flex; gap: 20px; flex-wrap: wrap; }
  .contact-item { font-size: 8pt; color: #555; display: flex; align-items: center; gap: 4px; }
  .contact-icon { width: 14px; height: 14px; background: #34495e; border-radius: 2px; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 6pt; font-weight: 700; flex-shrink: 0; }
  .header-rule { width: 60px; height: 3px; background: #34495e; }
  .body { display: flex; }
  .main { flex: 1; padding: 28px 24px 28px 44px; }
  .aside { width: 68mm; padding: 28px 24px; background: #eef0f5; border-left: 1px solid #d8dce8; }
  .section { margin-bottom: 24px; }
  .section-title { font-family: 'Libre Baskerville', serif; font-size: 11pt; font-weight: 700; color: #1a1a2e; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px; }
  .section-rule { height: 1px; background: #34495e; margin-bottom: 12px; }
  .summary-text { font-family: 'Source Serif 4', serif; font-size: 10pt; line-height: 1.8; color: #333; font-weight: 300; }
  .exp-item { margin-bottom: 16px; }
  .exp-role { font-weight: 600; font-size: 10pt; color: #1a1a2e; }
  .exp-meta { display: flex; justify-content: space-between; align-items: baseline; margin: 2px 0 6px; }
  .exp-company { font-family: 'Libre Baskerville', serif; font-style: italic; font-size: 9.5pt; color: #34495e; }
  .exp-date { font-size: 8pt; color: #777; }
  ul { padding-left: 16px; }
  li { font-size: 9pt; line-height: 1.6; margin-bottom: 3px; color: #3a3a3a; }
  li::marker { color: #34495e; }
  .aside .section-title { font-size: 9.5pt; }
  .skill-item { font-size: 8.5pt; color: #2d2d2d; padding: 3px 0; border-bottom: 1px solid #d0d4e0; display: flex; align-items: center; gap: 6px; line-height: 1.5; }
  .skill-bullet { width: 5px; height: 5px; border: 1.5px solid #34495e; border-radius: 50%; flex-shrink: 0; }
  .edu-item { margin-bottom: 14px; }
  .edu-degree { font-weight: 600; font-size: 9.5pt; color: #1a1a2e; }
  .edu-field { font-style: italic; font-size: 8.5pt; color: #555; margin-top: 1px; }
  .edu-school { font-size: 9pt; color: #34495e; margin-top: 2px; }
  .edu-year { font-size: 8pt; color: #777; margin-top: 2px; }
  .gpa-badge { display: inline-block; font-size: 7pt; background: #34495e; color: #fff; padding: 1px 6px; border-radius: 2px; margin-top: 3px; }
  @media print { html, body { width: 210mm; height: 297mm; } body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
</style>
</head>
<body>
  <div class="header">
    <div class="name">${esc(name)}</div>
    <div class="role">${esc(data.targetRole || 'Researcher & Scholar')}</div>
    <div class="header-bottom">
      <div class="contact-block">
        ${p.email    ? `<div class="contact-item"><div class="contact-icon">@</div>${esc(p.email)}</div>` : ''}
        ${p.phone    ? `<div class="contact-item"><div class="contact-icon">☎</div>${esc(p.phone)}</div>` : ''}
        ${p.location ? `<div class="contact-item"><div class="contact-icon">◎</div>${esc(p.location)}</div>` : ''}
        ${p.linkedin ? `<div class="contact-item"><div class="contact-icon">in</div>${esc(p.linkedin)}</div>` : ''}
      </div>
      <div class="header-rule"></div>
    </div>
  </div>
  <div class="body">
    <div class="main">
      ${summary ? `
      <div class="section">
        <div class="section-title">Research Profile</div>
        <div class="section-rule"></div>
        <p class="summary-text">${esc(summary)}</p>
      </div>` : ''}
      ${exp.length ? `
      <div class="section">
        <div class="section-title">Professional Experience</div>
        <div class="section-rule"></div>
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
      ${edu.length ? `
      <div class="section">
        <div class="section-title">Education</div>
        <div class="section-rule"></div>
        ${edu.map(e => `
          <div class="edu-item">
            <div class="edu-degree">${esc(e.degree || '')}</div>
            ${e.field ? `<div class="edu-field">${esc(e.field)}</div>` : ''}
            <div class="edu-school">${esc(e.school || '')}</div>
            ${e.year ? `<div class="edu-year">${esc(e.year)}</div>` : ''}
            ${e.gpa ? `<div class="gpa-badge">GPA: ${esc(e.gpa)}</div>` : ''}
          </div>
        `).join('')}
      </div>` : ''}
      ${skills.length ? `
      <div class="section">
        <div class="section-title">Competencies</div>
        <div class="section-rule"></div>
        ${skills.map(s => `<div class="skill-item"><div class="skill-bullet"></div>${esc(s)}</div>`).join('')}
      </div>` : ''}
    </div>
  </div>
</body>
</html>`
}

// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATE 7 — BRUTALIST
// Raw editorial, oversized type, stark contrast, bold grid lines
// ─────────────────────────────────────────────────────────────────────────────
export function renderBrutalist(data) {
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
  @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Barlow+Condensed:wght@300;400;600;700;900&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { width: 210mm; min-height: 297mm; background: #f2f0eb; }
  body { font-family: 'Barlow Condensed', sans-serif; font-size: 10pt; color: #0a0a0a; }
  .top-stripe { height: 8px; background: #0a0a0a; }
  .accent-stripe { height: 4px; background: #e63946; }
  .header { padding: 24px 36px; border-bottom: 3px solid #0a0a0a; display: grid; grid-template-columns: 1fr auto; align-items: end; gap: 20px; }
  .name-block .first { font-family: 'Barlow Condensed', sans-serif; font-size: 52pt; font-weight: 900; line-height: 0.85; color: #0a0a0a; text-transform: uppercase; letter-spacing: -1px; display: block; }
  .name-block .last  { font-family: 'Barlow Condensed', sans-serif; font-size: 52pt; font-weight: 300; line-height: 0.85; color: #0a0a0a; text-transform: uppercase; display: block; }
  .role-badge { display: inline-block; background: #e63946; color: #fff; font-family: 'Space Mono', monospace; font-size: 7pt; padding: 4px 12px; letter-spacing: 1px; text-transform: uppercase; margin-top: 10px; }
  .contact-stack { text-align: right; }
  .contact-stack .contact-row { font-family: 'Space Mono', monospace; font-size: 7.5pt; color: #333; margin-bottom: 3px; }
  .contact-stack .contact-row strong { color: #e63946; }
  .body { display: grid; grid-template-columns: 1fr 64mm; }
  .main { padding: 24px 20px 24px 36px; border-right: 3px solid #0a0a0a; }
  .aside { padding: 24px 20px; }
  .section { margin-bottom: 22px; }
  .section-title { font-family: 'Barlow Condensed', sans-serif; font-size: 7pt; font-weight: 700; letter-spacing: 3px; text-transform: uppercase; background: #0a0a0a; color: #f2f0eb; display: inline-block; padding: 2px 8px; margin-bottom: 12px; }
  .summary-text { font-family: 'Space Mono', monospace; font-size: 8pt; line-height: 1.8; color: #333; }
  .exp-item { border-top: 2px solid #0a0a0a; padding: 10px 0; }
  .exp-item:last-child { border-bottom: 2px solid #0a0a0a; }
  .exp-role { font-family: 'Barlow Condensed', sans-serif; font-size: 14pt; font-weight: 700; color: #0a0a0a; text-transform: uppercase; letter-spacing: 0.5px; line-height: 1; }
  .exp-meta { display: flex; justify-content: space-between; align-items: baseline; margin: 3px 0 6px; }
  .exp-company { font-family: 'Barlow Condensed', sans-serif; font-size: 10pt; color: #e63946; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; }
  .exp-date { font-family: 'Space Mono', monospace; font-size: 7pt; color: #777; }
  ul { padding-left: 0; list-style: none; }
  li { font-size: 10pt; line-height: 1.6; margin-bottom: 2px; color: #222; padding-left: 16px; position: relative; font-family: 'Barlow Condensed', sans-serif; }
  li::before { content: '—'; position: absolute; left: 0; color: #e63946; }
  .skill-name { font-family: 'Barlow Condensed', sans-serif; font-size: 11pt; font-weight: 600; color: #0a0a0a; text-transform: uppercase; border-bottom: 1px solid #0a0a0a; padding-bottom: 2px; line-height: 1.4; margin-bottom: 5px; }
  .edu-item { margin-bottom: 14px; padding-top: 8px; border-top: 2px solid #0a0a0a; }
  .edu-degree { font-family: 'Barlow Condensed', sans-serif; font-size: 12pt; font-weight: 700; color: #0a0a0a; text-transform: uppercase; }
  .edu-school { font-family: 'Space Mono', monospace; font-size: 7.5pt; color: #555; margin-top: 2px; }
  .edu-year { font-family: 'Barlow Condensed', sans-serif; font-size: 11pt; font-weight: 900; color: #e63946; margin-top: 3px; }
  @media print { html, body { width: 210mm; height: 297mm; } body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
</style>
</head>
<body>
  <div class="top-stripe"></div>
  <div class="accent-stripe"></div>
  <div class="header">
    <div>
      <div class="name-block">
        <span class="first">${esc(firstName)}</span>
        <span class="last">${esc(lastName)}</span>
      </div>
      <div class="role-badge">${esc(data.targetRole || 'Professional')}</div>
    </div>
    <div class="contact-stack">
      ${p.email    ? `<div class="contact-row"><strong>@</strong> ${esc(p.email)}</div>` : ''}
      ${p.phone    ? `<div class="contact-row"><strong>T</strong> ${esc(p.phone)}</div>` : ''}
      ${p.location ? `<div class="contact-row"><strong>L</strong> ${esc(p.location)}</div>` : ''}
      ${p.linkedin ? `<div class="contact-row"><strong>in</strong> ${esc(p.linkedin)}</div>` : ''}
    </div>
  </div>
  <div class="body">
    <div class="main">
      ${summary ? `
      <div class="section">
        <div class="section-title">Statement</div>
        <p class="summary-text">${esc(summary)}</p>
      </div>` : ''}
      ${exp.length ? `
      <div class="section">
        <div class="section-title">Work</div>
        ${exp.map(e => `
          <div class="exp-item">
            <div class="exp-role">${esc(e.role || '')}</div>
            <div class="exp-meta"><span class="exp-company">${esc(e.company || '')}</span><span class="exp-date">${dateRange(e)}</span></div>
            <ul>${bullets(e.description, e.bullets)}</ul>
          </div>
        `).join('')}
      </div>` : ''}
    </div>
    <div class="aside">
      ${skills.length ? `
      <div class="section">
        <div class="section-title">Skills</div>
        ${skills.map(s => `<div class="skill-name">${esc(s)}</div>`).join('')}
      </div>` : ''}
      ${edu.length ? `
      <div class="section" style="margin-top:16px">
        <div class="section-title">Education</div>
        ${edu.map(e => `
          <div class="edu-item">
            <div class="edu-degree">${esc(e.degree || '')}</div>
            <div class="edu-school">${esc(e.school || '')}${e.field ? ` / ${esc(e.field)}` : ''}</div>
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
// TEMPLATE 8 — SOFT PASTEL
// Organic warmth, rounded corners, blush tones, gentle typography
// ─────────────────────────────────────────────────────────────────────────────
export function renderSoft(data) {
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
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Nunito:wght@300;400;500;600&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { width: 210mm; min-height: 297mm; background: #fff9f5; }
  body { font-family: 'Nunito', sans-serif; font-size: 9.5pt; color: #3a2c28; }
  .top-deco { height: 6px; background: linear-gradient(90deg, #e8b4b8, #f2c98a, #a8d8c0, #9ab8e4); }
  .header { padding: 32px 40px 24px; text-align: center; }
  .avatar-circle { width: 64px; height: 64px; border-radius: 50%; background: linear-gradient(135deg, #e8b4b8, #f2c98a); margin: 0 auto 14px; display: flex; align-items: center; justify-content: center; font-family: 'Playfair Display', serif; font-size: 20pt; font-weight: 700; color: #fff; }
  .name { font-family: 'Playfair Display', serif; font-size: 24pt; font-weight: 700; color: #2d1f1c; line-height: 1; }
  .role { font-size: 9pt; color: #c4836a; font-weight: 500; letter-spacing: 1.5px; text-transform: uppercase; margin-top: 5px; margin-bottom: 16px; }
  .contact-pills { display: flex; justify-content: center; gap: 10px; flex-wrap: wrap; }
  .contact-pill { font-size: 7.5pt; background: #fff; border: 1px solid #e8d4cc; color: #7a5a52; padding: 3px 12px; border-radius: 20px; font-weight: 500; }
  .wave-divider { text-align: center; font-size: 14pt; color: #e8b4b8; letter-spacing: 4px; margin: 4px 0; }
  .body { display: grid; grid-template-columns: 1fr 70mm; padding: 0 40px 32px; gap: 28px; }
  .section { margin-bottom: 22px; }
  .section-title { font-family: 'Playfair Display', serif; font-size: 12pt; font-weight: 700; color: #2d1f1c; margin-bottom: 4px; display: flex; align-items: center; gap: 8px; }
  .title-dot { width: 8px; height: 8px; border-radius: 50%; background: linear-gradient(135deg, #e8b4b8, #f2c98a); flex-shrink: 0; }
  .title-rule { flex: 1; height: 1px; background: linear-gradient(90deg, #e8d4cc, transparent); }
  .summary-text { font-size: 9.5pt; line-height: 1.8; color: #5a4540; font-weight: 300; }
  .exp-item { margin-bottom: 14px; background: #fff; border-radius: 8px; padding: 12px 14px; border: 1px solid #f0e0d8; border-left: 3px solid #e8b4b8; }
  .exp-role { font-weight: 600; font-size: 10pt; color: #2d1f1c; }
  .exp-meta { display: flex; justify-content: space-between; align-items: center; margin: 2px 0 6px; }
  .exp-company { font-size: 9pt; color: #c4836a; font-style: italic; }
  .exp-date { font-size: 7.5pt; color: #a09090; background: #fff9f5; padding: 1px 7px; border-radius: 10px; border: 1px solid #e8d4cc; }
  ul { padding-left: 14px; }
  li { font-size: 8.5pt; line-height: 1.6; margin-bottom: 2px; color: #5a4540; font-weight: 300; }
  li::marker { color: #e8b4b8; }
  .skill-tag { display: inline-block; background: linear-gradient(135deg, rgba(232,180,184,0.15), rgba(242,201,138,0.15)); border: 1px solid #e8d4cc; color: #7a5a52; font-size: 7.5pt; padding: 3px 10px; border-radius: 20px; margin: 3px 2px; font-weight: 500; }
  .edu-item { margin-bottom: 14px; background: #fff; border-radius: 8px; padding: 10px 12px; border: 1px solid #f0e0d8; }
  .edu-degree { font-weight: 600; font-size: 9.5pt; color: #2d1f1c; }
  .edu-school { font-size: 9pt; color: #c4836a; margin-top: 2px; font-style: italic; }
  .edu-year { font-size: 8pt; color: #a09090; margin-top: 2px; }
  @media print { html, body { width: 210mm; height: 297mm; background: #fff9f5; } body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
</style>
</head>
<body>
  <div class="top-deco"></div>
  <div class="header">
    <div class="avatar-circle">${esc((p.firstName || 'Y')[0])}${esc((p.lastName || 'N')[0])}</div>
    <div class="name">${esc(name)}</div>
    <div class="role">${esc(data.targetRole || 'Professional')}</div>
    <div class="contact-pills">
      ${p.email    ? `<span class="contact-pill">✉ ${esc(p.email)}</span>` : ''}
      ${p.phone    ? `<span class="contact-pill">☎ ${esc(p.phone)}</span>` : ''}
      ${p.location ? `<span class="contact-pill">◎ ${esc(p.location)}</span>` : ''}
      ${p.linkedin ? `<span class="contact-pill">in ${esc(p.linkedin)}</span>` : ''}
    </div>
  </div>
  <div class="wave-divider">· · ·</div>
  <div class="body">
    <div>
      ${summary ? `
      <div class="section">
        <div class="section-title"><div class="title-dot"></div>About Me<div class="title-rule"></div></div>
        <p class="summary-text">${esc(summary)}</p>
      </div>` : ''}
      ${exp.length ? `
      <div class="section">
        <div class="section-title"><div class="title-dot"></div>Experience<div class="title-rule"></div></div>
        ${exp.map(e => `
          <div class="exp-item">
            <div class="exp-role">${esc(e.role || '')}</div>
            <div class="exp-meta"><span class="exp-company">${esc(e.company || '')}</span><span class="exp-date">${dateRange(e)}</span></div>
            <ul>${bullets(e.description, e.bullets)}</ul>
          </div>
        `).join('')}
      </div>` : ''}
    </div>
    <div>
      ${skills.length ? `
      <div class="section">
        <div class="section-title"><div class="title-dot"></div>Skills<div class="title-rule"></div></div>
        <div style="margin-top:4px">${skills.map(s => `<span class="skill-tag">${esc(s)}</span>`).join('')}</div>
      </div>` : ''}
      ${edu.length ? `
      <div class="section">
        <div class="section-title"><div class="title-dot"></div>Education<div class="title-rule"></div></div>
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
</body>
</html>`
}

// ─────────────────────────────────────────────────────────────────────────────
// Full Registry — all 8 templates
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
    id: 'terminal',
    label: 'Terminal',
    subtitle: 'Dev · Dark · Mono',
    render: renderTerminal,
    accent: '#56d364',
    preview: ['#0d1117', '#56d364', '#79c0ff'],
  },
  {
    id: 'academic',
    label: 'Academic',
    subtitle: 'Scholar · Serif · Slate',
    render: renderAcademic,
    accent: '#34495e',
    preview: ['#1a1a2e', '#34495e', '#eef0f5'],
  },
  {
    id: 'brutalist',
    label: 'Brutalist',
    subtitle: 'Bold · Raw · Red',
    render: renderBrutalist,
    accent: '#e63946',
    preview: ['#0a0a0a', '#e63946', '#f2f0eb'],
  },
  {
    id: 'soft',
    label: 'Soft',
    subtitle: 'Pastel · Warm · Rounded',
    render: renderSoft,
    accent: '#e8b4b8',
    preview: ['#2d1f1c', '#e8b4b8', '#f2c98a'],
  },
]