import { useState, useContext, createContext, useCallback } from "react";

// ─── Context ──────────────────────────────────────────────────────────────────
const ResumeContext = createContext(null);

const EMPTY_JOB = () => ({
  id: Date.now() + Math.random(),
  company: "", role: "", startDate: "", endDate: "", current: false, description: "",
});
const EMPTY_EDU = () => ({
  id: Date.now() + Math.random(),
  school: "", degree: "", field: "", year: "",
});

const initialData = {
  personal: { firstName: "", lastName: "", email: "", phone: "", location: "", website: "", summary: "" },
  experience: [EMPTY_JOB()],
  education: [EMPTY_EDU()],
  skills: { technical: "", soft: "", languages: "", certifications: "" },
};

function ResumeProvider({ children }) {
  const [data, setData] = useState(initialData);
  const update = useCallback((section, payload) =>
    setData(d => ({ ...d, [section]: typeof payload === "function" ? payload(d[section]) : payload }))
  , []);
  return <ResumeContext.Provider value={{ data, update }}>{children}</ResumeContext.Provider>;
}
const useResume = () => useContext(ResumeContext);

// ─── Validation ───────────────────────────────────────────────────────────────
function validateStep(step, data) {
  const errs = {};
  if (step === 0) {
    const p = data.personal;
    if (!p.firstName.trim()) errs.firstName = "Required";
    if (!p.lastName.trim()) errs.lastName = "Required";
    if (!p.email.trim()) errs.email = "Required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.email)) errs.email = "Invalid email";
    if (!p.phone.trim()) errs.phone = "Required";
    if (!p.summary.trim()) errs.summary = "Required";
  }
  if (step === 1) {
    data.experience.forEach((job, i) => {
      if (!job.company.trim()) errs[`exp_${i}_company`] = "Required";
      if (!job.role.trim()) errs[`exp_${i}_role`] = "Required";
      if (!job.startDate) errs[`exp_${i}_startDate`] = "Required";
    });
  }
  if (step === 2) {
    data.education.forEach((edu, i) => {
      if (!edu.school.trim()) errs[`edu_${i}_school`] = "Required";
      if (!edu.degree.trim()) errs[`edu_${i}_degree`] = "Required";
      if (!edu.year) errs[`edu_${i}_year`] = "Required";
    });
  }
  if (step === 3) {
    if (!data.skills.technical.trim()) errs.technical = "Add at least one skill";
  }
  return errs;
}

// ─── Design tokens ────────────────────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;1,400&family=DM+Sans:wght@300;400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --sand-50: #faf9f6;
    --sand-100: #f3f0e8;
    --sand-200: #e4dfd0;
    --sand-300: #cec7b0;
    --sand-500: #9d9178;
    --sand-700: #6b6151;
    --sand-900: #2d2820;
    --gold: #c9973d;
    --gold-light: #f5e8cf;
    --gold-dark: #a87a26;
    --teal: #2a7d6b;
    --teal-light: #e0f2ed;
    --danger: #c0392b;
    --danger-light: #fdecea;
    --radius: 12px;
    --radius-sm: 8px;
    --shadow: 0 2px 12px rgba(45,40,32,0.09);
    --shadow-lg: 0 8px 32px rgba(45,40,32,0.13);
    --transition: 0.22s cubic-bezier(0.4, 0, 0.2, 1);
  }

  body { background: var(--sand-50); font-family: 'DM Sans', sans-serif; color: var(--sand-900); }

  .rf-root { max-width: 780px; margin: 0 auto; padding: 2rem 1rem 4rem; }

  /* Header */
  .rf-header { text-align: center; margin-bottom: 2.5rem; }
  .rf-logo { display: inline-flex; align-items: center; gap: 10px; margin-bottom: 0.5rem; }
  .rf-logo-icon { width: 36px; height: 36px; background: var(--gold); border-radius: 10px;
    display: flex; align-items: center; justify-content: center; }
  .rf-logo-icon svg { width: 18px; height: 18px; fill: #fff; }
  .rf-title { font-family: 'Lora', serif; font-size: 26px; font-weight: 600; color: var(--sand-900); letter-spacing: -0.3px; }
  .rf-subtitle { font-size: 14px; color: var(--sand-500); margin-top: 4px; }

  /* Progress */
  .rf-progress-wrap { background: var(--sand-100); border-radius: 100px; height: 5px; overflow: hidden; margin-bottom: 2.5rem; }
  .rf-progress-bar { height: 100%; background: var(--gold); border-radius: 100px;
    transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1); }

  /* Step indicators */
  .rf-steps { display: flex; justify-content: space-between; margin-bottom: 2rem; gap: 4px; }
  .rf-step-item { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 6px; cursor: default; }
  .rf-step-bubble { width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center;
    justify-content: center; font-size: 12px; font-weight: 500; transition: var(--transition);
    border: 1.5px solid var(--sand-200); background: #fff; color: var(--sand-500); }
  .rf-step-bubble.done { background: var(--teal); border-color: var(--teal); color: #fff; }
  .rf-step-bubble.active { background: var(--gold); border-color: var(--gold); color: #fff;
    box-shadow: 0 0 0 4px var(--gold-light); }
  .rf-step-label { font-size: 11px; color: var(--sand-500); text-align: center; line-height: 1.3; }
  .rf-step-label.active { color: var(--gold-dark); font-weight: 500; }
  .rf-step-label.done { color: var(--teal); }

  /* Card */
  .rf-card { background: #fff; border-radius: var(--radius); border: 1px solid var(--sand-200);
    box-shadow: var(--shadow); overflow: hidden; }
  .rf-card-header { padding: 1.5rem 1.75rem 1.25rem; border-bottom: 1px solid var(--sand-100); }
  .rf-card-title { font-family: 'Lora', serif; font-size: 19px; font-weight: 600; color: var(--sand-900); }
  .rf-card-desc { font-size: 13px; color: var(--sand-500); margin-top: 3px; }
  .rf-card-body { padding: 1.75rem; }

  /* Form */
  .rf-grid { display: grid; gap: 1rem; min-width: 0; }
  .rf-grid-2 { grid-template-columns: 1fr 1fr; }
  .rf-grid-3 { grid-template-columns: 1fr 1fr 1fr; }
  @media (max-width: 540px) { .rf-grid-2, .rf-grid-3 { grid-template-columns: 1fr; } }

  .rf-field { display: flex; flex-direction: column; gap: 5px; min-width: 0; }
  .rf-input, .rf-textarea { min-width: 0; word-wrap: break-word; }
  .rf-preview-summary, .rf-preview-desc { word-wrap: break-word; }
  .rf-entry { min-width: 0; }
  .rf-label { font-size: 12px; font-weight: 500; color: var(--sand-700); letter-spacing: 0.2px; }
  .rf-label span { color: var(--gold); margin-left: 2px; }

  .rf-input, .rf-textarea, .rf-select {
    width: 100%; padding: 9px 12px; border-radius: var(--radius-sm);
    border: 1.5px solid var(--sand-200); background: var(--sand-50);
    font-family: 'DM Sans', sans-serif; font-size: 14px; color: var(--sand-900);
    outline: none; transition: border-color var(--transition), box-shadow var(--transition);
    appearance: none; -webkit-appearance: none;
  }
  .rf-input:focus, .rf-textarea:focus, .rf-select:focus {
    border-color: var(--gold); box-shadow: 0 0 0 3px var(--gold-light);
    background: #fff;
  }
  .rf-input.err, .rf-textarea.err { border-color: var(--danger); }
  .rf-input.err:focus, .rf-textarea.err:focus { box-shadow: 0 0 0 3px var(--danger-light); }
  .rf-textarea { resize: vertical; min-height: 80px; line-height: 1.6; }
  .rf-error { font-size: 11.5px; color: var(--danger); display: flex; align-items: center; gap: 4px; }
  .rf-hint { font-size: 11.5px; color: var(--sand-500); }

  /* Checkbox */
  .rf-check-row { display: flex; align-items: center; gap: 8px; cursor: pointer; }
  .rf-check-box { width: 16px; height: 16px; border-radius: 4px; border: 1.5px solid var(--sand-300);
    background: var(--sand-50); display: flex; align-items: center; justify-content: center;
    flex-shrink: 0; transition: var(--transition); }
  .rf-check-box.checked { background: var(--gold); border-color: var(--gold); }
  .rf-check-label { font-size: 13px; color: var(--sand-700); }

  /* Repeatable entries */
  .rf-entry { background: var(--sand-50); border: 1.5px solid var(--sand-200); border-radius: var(--radius-sm);
    padding: 1.25rem; position: relative; }
  .rf-entry-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem; }
  .rf-entry-num { font-size: 11px; font-weight: 500; color: var(--gold-dark); letter-spacing: 0.5px; text-transform: uppercase; }
  .rf-remove-btn { width: 26px; height: 26px; border-radius: 6px; border: 1px solid var(--sand-200);
    background: #fff; color: var(--sand-500); cursor: pointer; font-size: 16px; line-height: 1;
    display: flex; align-items: center; justify-content: center; transition: var(--transition); }
  .rf-remove-btn:hover { background: var(--danger-light); border-color: var(--danger); color: var(--danger); }

  .rf-add-btn { display: flex; align-items: center; gap: 8px; padding: 10px 16px;
    border-radius: var(--radius-sm); border: 1.5px dashed var(--sand-300); background: transparent;
    color: var(--sand-700); font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 500;
    cursor: pointer; width: 100%; justify-content: center; transition: var(--transition); margin-top: 0.75rem; }
  .rf-add-btn:hover { border-color: var(--gold); color: var(--gold-dark); background: var(--gold-light); }

  /* Skill tags */
  .rf-skill-tag-row { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 6px; }
  .rf-tag { padding: 4px 10px; border-radius: 100px; background: var(--sand-100);
    border: 1px solid var(--sand-200); font-size: 12px; color: var(--sand-700); }
  .rf-tag.tech { background: var(--teal-light); border-color: #b3ddd5; color: var(--teal); }
  .rf-tag.soft { background: var(--gold-light); border-color: #f0d4a0; color: var(--gold-dark); }

  /* Navigation */
  .rf-nav { display: flex; align-items: center; justify-content: space-between; margin-top: 1.5rem; gap: 12px; }
  .rf-btn { padding: 10px 22px; border-radius: var(--radius-sm); font-family: 'DM Sans', sans-serif;
    font-size: 14px; font-weight: 500; cursor: pointer; transition: var(--transition); border: none; }
  .rf-btn-ghost { background: transparent; border: 1.5px solid var(--sand-200); color: var(--sand-700); }
  .rf-btn-ghost:hover { border-color: var(--sand-300); background: var(--sand-50); }
  .rf-btn-primary { background: var(--gold); color: #fff; display: flex; align-items: center; gap: 6px; }
  .rf-btn-primary:hover { background: var(--gold-dark); }
  .rf-btn-success { background: var(--teal); color: #fff; display: flex; align-items: center; gap: 6px; }
  .rf-btn-success:hover { background: #1e6456; }
  .rf-btn:disabled { opacity: 0.5; cursor: not-allowed; }

  /* Step animation */
  @keyframes slideIn { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: none; } }
  @keyframes slideBack { from { opacity: 0; transform: translateX(-20px); } to { opacity: 1; transform: none; } }
  .slide-in { animation: slideIn 0.28s cubic-bezier(0.4,0,0.2,1) both; }
  .slide-back { animation: slideBack 0.28s cubic-bezier(0.4,0,0.2,1) both; }

  /* Preview */
  .rf-preview { font-family: 'DM Sans', sans-serif; }
  .rf-preview-name { font-family: 'Lora', serif; font-size: 26px; font-weight: 600; color: var(--sand-900); }
  .rf-preview-contact { display: flex; flex-wrap: wrap; gap: 12px; font-size: 12px; color: var(--sand-500); margin-top: 4px; margin-bottom: 1.25rem; }
  .rf-preview-contact span { display: flex; align-items: center; gap: 4px; }
  .rf-preview-section { margin-bottom: 1.25rem; }
  .rf-preview-section-title { font-size: 10px; font-weight: 500; letter-spacing: 1.5px; color: var(--gold-dark);
    text-transform: uppercase; border-bottom: 1.5px solid var(--gold-light); padding-bottom: 4px; margin-bottom: 0.75rem; }
  .rf-preview-summary { font-size: 13.5px; line-height: 1.7; color: var(--sand-700); }
  .rf-preview-job { margin-bottom: 0.75rem; }
  .rf-preview-job-header { display: flex; justify-content: space-between; align-items: baseline; gap: 8px; }
  .rf-preview-role { font-size: 14px; font-weight: 500; color: var(--sand-900); }
  .rf-preview-company { font-size: 13px; color: var(--teal); }
  .rf-preview-dates { font-size: 12px; color: var(--sand-500); white-space: nowrap; }
  .rf-preview-desc { font-size: 13px; color: var(--sand-700); line-height: 1.65; margin-top: 3px; }
  .rf-preview-edu-row { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 0.4rem; }
  .rf-preview-degree { font-size: 13.5px; font-weight: 500; color: var(--sand-900); }
  .rf-preview-school { font-size: 13px; color: var(--sand-500); }
  .rf-preview-year { font-size: 12px; color: var(--sand-500); }
  .rf-preview-skills-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
  .rf-preview-skill-group label { font-size: 11px; font-weight: 500; color: var(--sand-500); display: block; margin-bottom: 4px; }
  .rf-preview-skill-pills { display: flex; flex-wrap: wrap; gap: 4px; }
  .rf-preview-skill-pill { padding: 2px 8px; border-radius: 100px; font-size: 11.5px; background: var(--sand-100);
    border: 1px solid var(--sand-200); color: var(--sand-700); }
  .empty-state { text-align: center; padding: 2rem; color: var(--sand-500); font-size: 13px; }
`;

// ─── Helpers ──────────────────────────────────────────────────────────────────
function Field({ label, required, error, hint, children }) {
  return (
    <div className="rf-field">
      {label && <label className="rf-label">{label}{required && <span>*</span>}</label>}
      {children}
      {error && <span className="rf-error">⚠ {error}</span>}
      {hint && !error && <span className="rf-hint">{hint}</span>}
    </div>
  );
}

function Checkbox({ checked, onChange, label }) {
  return (
    <div className="rf-check-row" onClick={() => onChange(!checked)}>
      <div className={`rf-check-box${checked ? " checked" : ""}`}>
        {checked && <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
          <path d="M1 4l3 3 5-6" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>}
      </div>
      <span className="rf-check-label">{label}</span>
    </div>
  );
}

function SkillTags({ value, type }) {
  const tags = value.split(",").map(s => s.trim()).filter(Boolean);
  if (!tags.length) return null;
  return (
    <div className="rf-skill-tag-row">
      {tags.map((t, i) => <span key={i} className={`rf-tag ${type}`}>{t}</span>)}
    </div>
  );
}

// ─── Steps ────────────────────────────────────────────────────────────────────
function StepPersonal({ errors }) {
  const { data, update } = useResume();
  const p = data.personal;
  const set = k => e => update("personal", { ...p, [k]: e.target.value });

  return (
    <div className="rf-grid">
      <div className="rf-grid rf-grid-2">
        <Field label="First Name" required error={errors.firstName}>
          <input className={`rf-input${errors.firstName ? " err" : ""}`} value={p.firstName} onChange={set("firstName")} placeholder="Jane" />
        </Field>
        <Field label="Last Name" required error={errors.lastName}>
          <input className={`rf-input${errors.lastName ? " err" : ""}`} value={p.lastName} onChange={set("lastName")} placeholder="Smith" />
        </Field>
      </div>
      <div className="rf-grid rf-grid-2">
        <Field label="Email" required error={errors.email}>
          <input type="email" className={`rf-input${errors.email ? " err" : ""}`} value={p.email} onChange={set("email")} placeholder="jane@example.com" />
        </Field>
        <Field label="Phone" required error={errors.phone}>
          <input className={`rf-input${errors.phone ? " err" : ""}`} value={p.phone} onChange={set("phone")} placeholder="+1 234 567 8901" />
        </Field>
      </div>
      <div className="rf-grid rf-grid-2">
        <Field label="Location">
          <input className="rf-input" value={p.location} onChange={set("location")} placeholder="New York, NY" />
        </Field>
        <Field label="Website / LinkedIn">
          <input className="rf-input" value={p.website} onChange={set("website")} placeholder="linkedin.com/in/..." />
        </Field>
      </div>
      <Field label="Professional Summary" required error={errors.summary} hint="2–4 sentences about your experience and career goals.">
        <textarea className={`rf-textarea${errors.summary ? " err" : ""}`} value={p.summary} onChange={set("summary")} placeholder="Results-driven software engineer with 6+ years building scalable web applications..." rows={4} />
      </Field>
    </div>
  );
}

function StepExperience({ errors }) {
  const { data, update } = useResume();
  const jobs = data.experience;

  const setJob = (i, k, v) => update("experience", prev => {
    const next = [...prev];
    next[i] = { ...next[i], [k]: v };
    return next;
  });

  const addJob = () => update("experience", prev => [...prev, EMPTY_JOB()]);
  const removeJob = i => update("experience", prev => prev.filter((_, idx) => idx !== i));

  return (
    <div>
      {jobs.map((job, i) => (
        <div key={job.id} className="rf-entry" style={{ marginBottom: "1rem" }}>
          <div className="rf-entry-header">
            <span className="rf-entry-num">Position {i + 1}</span>
            {jobs.length > 1 && (
              <button className="rf-remove-btn" onClick={() => removeJob(i)} title="Remove">×</button>
            )}
          </div>
          <div className="rf-grid">
            <div className="rf-grid rf-grid-2">
              <Field label="Company" required error={errors[`exp_${i}_company`]}>
                <input className={`rf-input${errors[`exp_${i}_company`] ? " err" : ""}`} value={job.company} onChange={e => setJob(i, "company", e.target.value)} placeholder="Acme Corp" />
              </Field>
              <Field label="Job Title" required error={errors[`exp_${i}_role`]}>
                <input className={`rf-input${errors[`exp_${i}_role`] ? " err" : ""}`} value={job.role} onChange={e => setJob(i, "role", e.target.value)} placeholder="Senior Engineer" />
              </Field>
            </div>
            <div className="rf-grid rf-grid-3">
              <Field label="Start Date" required error={errors[`exp_${i}_startDate`]}>
                <input type="month" className={`rf-input${errors[`exp_${i}_startDate`] ? " err" : ""}`} value={job.startDate} onChange={e => setJob(i, "startDate", e.target.value)} />
              </Field>
              <Field label="End Date">
                <input type="month" className="rf-input" value={job.endDate} onChange={e => setJob(i, "endDate", e.target.value)} disabled={job.current} />
              </Field>
              <Field label=" ">
                <div style={{ paddingTop: "6px" }}>
                  <Checkbox checked={job.current} onChange={v => setJob(i, "current", v)} label="Currently here" />
                </div>
              </Field>
            </div>
            <Field label="Key Responsibilities / Achievements" hint="Use bullet points or separate sentences. Focus on impact.">
              <textarea className="rf-textarea" value={job.description} onChange={e => setJob(i, "description", e.target.value)} placeholder="Led migration to microservices reducing latency by 40%. Mentored team of 4 engineers..." rows={3} />
            </Field>
          </div>
        </div>
      ))}
      <button className="rf-add-btn" onClick={addJob}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
        </svg>
        Add Another Position
      </button>
    </div>
  );
}

function StepEducation({ errors }) {
  const { data, update } = useResume();
  const edus = data.education;

  const setEdu = (i, k, v) => update("education", prev => {
    const next = [...prev];
    next[i] = { ...next[i], [k]: v };
    return next;
  });
  const addEdu = () => update("education", prev => [...prev, EMPTY_EDU()]);
  const removeEdu = i => update("education", prev => prev.filter((_, idx) => idx !== i));

  return (
    <div>
      {edus.map((edu, i) => (
        <div key={edu.id} className="rf-entry" style={{ marginBottom: "1rem" }}>
          <div className="rf-entry-header">
            <span className="rf-entry-num">Education {i + 1}</span>
            {edus.length > 1 && (
              <button className="rf-remove-btn" onClick={() => removeEdu(i)} title="Remove">×</button>
            )}
          </div>
          <div className="rf-grid">
            <Field label="School / University" required error={errors[`edu_${i}_school`]}>
              <input className={`rf-input${errors[`edu_${i}_school`] ? " err" : ""}`} value={edu.school} onChange={e => setEdu(i, "school", e.target.value)} placeholder="MIT" />
            </Field>
            <div className="rf-grid rf-grid-2">
              <Field label="Degree" required error={errors[`edu_${i}_degree`]}>
                <input className={`rf-input${errors[`edu_${i}_degree`] ? " err" : ""}`} value={edu.degree} onChange={e => setEdu(i, "degree", e.target.value)} placeholder="B.S. Computer Science" />
              </Field>
              <Field label="Field of Study">
                <input className="rf-input" value={edu.field} onChange={e => setEdu(i, "field", e.target.value)} placeholder="Computer Science" />
              </Field>
            </div>
            <Field label="Graduation Year" required error={errors[`edu_${i}_year`]}>
              <input type="number" className={`rf-input${errors[`edu_${i}_year`] ? " err" : ""}`} value={edu.year} onChange={e => setEdu(i, "year", e.target.value)} placeholder="2023" min="1950" max="2030" style={{ maxWidth: "140px" }} />
            </Field>
          </div>
        </div>
      ))}
      <button className="rf-add-btn" onClick={addEdu}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
        </svg>
        Add Another Degree
      </button>
    </div>
  );
}

function StepSkills({ errors }) {
  const { data, update } = useResume();
  const sk = data.skills;
  const set = k => e => update("skills", { ...sk, [k]: e.target.value });

  return (
    <div className="rf-grid">
      <Field label="Technical Skills" required error={errors.technical} hint="Comma-separated — e.g. React, Node.js, PostgreSQL, Docker">
        <input className={`rf-input${errors.technical ? " err" : ""}`} value={sk.technical} onChange={set("technical")} placeholder="React, TypeScript, Node.js, AWS, PostgreSQL..." />
        <SkillTags value={sk.technical} type="tech" />
      </Field>
      <Field label="Soft Skills" hint="Comma-separated — e.g. Leadership, Communication, Problem Solving">
        <input className="rf-input" value={sk.soft} onChange={set("soft")} placeholder="Leadership, Communication, Team Collaboration..." />
        <SkillTags value={sk.soft} type="soft" />
      </Field>
      <div className="rf-grid rf-grid-2">
        <Field label="Languages" hint="Comma-separated">
          <input className="rf-input" value={sk.languages} onChange={set("languages")} placeholder="English (Native), Spanish (Fluent)..." />
        </Field>
        <Field label="Certifications" hint="Comma-separated">
          <input className="rf-input" value={sk.certifications} onChange={set("certifications")} placeholder="AWS Solutions Architect, PMP..." />
        </Field>
      </div>
    </div>
  );
}

function StepPreview() {
  const { data } = useResume();
  const { personal: p, experience: exp, education: edu, skills: sk } = data;
  const fullName = [p.firstName, p.lastName].filter(Boolean).join(" ");

  const formatMonth = str => {
    if (!str) return "";
    const [y, m] = str.split("-");
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    return `${months[parseInt(m) - 1]} ${y}`;
  };

  if (!fullName) return (
    <div className="empty-state">
      <p>No data yet. Go back and fill in your information.</p>
    </div>
  );

  return (
    <div className="rf-preview">
      <div className="rf-preview-name">{fullName}</div>
      <div className="rf-preview-contact">
        {p.email && <span>📧 {p.email}</span>}
        {p.phone && <span>📞 {p.phone}</span>}
        {p.location && <span>📍 {p.location}</span>}
        {p.website && <span>🔗 {p.website}</span>}
      </div>

      {p.summary && (
        <div className="rf-preview-section">
          <div className="rf-preview-section-title">Summary</div>
          <div className="rf-preview-summary">{p.summary}</div>
        </div>
      )}

      {exp.some(j => j.company || j.role) && (
        <div className="rf-preview-section">
          <div className="rf-preview-section-title">Experience</div>
          {exp.filter(j => j.company || j.role).map(job => (
            <div key={job.id} className="rf-preview-job">
              <div className="rf-preview-job-header">
                <div>
                  <span className="rf-preview-role">{job.role}</span>
                  {job.company && <span style={{ color: "var(--sand-500)", fontSize: 13 }}> · </span>}
                  <span className="rf-preview-company">{job.company}</span>
                </div>
                <span className="rf-preview-dates">
                  {formatMonth(job.startDate)}{job.startDate && " – "}{job.current ? "Present" : formatMonth(job.endDate)}
                </span>
              </div>
              {job.description && <div className="rf-preview-desc">{job.description}</div>}
            </div>
          ))}
        </div>
      )}

      {edu.some(e => e.school || e.degree) && (
        <div className="rf-preview-section">
          <div className="rf-preview-section-title">Education</div>
          {edu.filter(e => e.school || e.degree).map(e => (
            <div key={e.id} className="rf-preview-edu-row">
              <div>
                <div className="rf-preview-degree">{e.degree}</div>
                <div className="rf-preview-school">{e.school}{e.field ? ` · ${e.field}` : ""}</div>
              </div>
              {e.year && <span className="rf-preview-year">{e.year}</span>}
            </div>
          ))}
        </div>
      )}

      {(sk.technical || sk.soft || sk.languages || sk.certifications) && (
        <div className="rf-preview-section">
          <div className="rf-preview-section-title">Skills</div>
          <div className="rf-preview-skills-grid">
            {sk.technical && (
              <div className="rf-preview-skill-group">
                <label>Technical</label>
                <div className="rf-preview-skill-pills">
                  {sk.technical.split(",").map(s => s.trim()).filter(Boolean).map((t, i) => (
                    <span key={i} className="rf-preview-skill-pill" style={{ background: "var(--teal-light)", borderColor: "#b3ddd5", color: "var(--teal)" }}>{t}</span>
                  ))}
                </div>
              </div>
            )}
            {sk.soft && (
              <div className="rf-preview-skill-group">
                <label>Soft Skills</label>
                <div className="rf-preview-skill-pills">
                  {sk.soft.split(",").map(s => s.trim()).filter(Boolean).map((t, i) => (
                    <span key={i} className="rf-preview-skill-pill" style={{ background: "var(--gold-light)", borderColor: "#f0d4a0", color: "var(--gold-dark)" }}>{t}</span>
                  ))}
                </div>
              </div>
            )}
            {sk.languages && (
              <div className="rf-preview-skill-group">
                <label>Languages</label>
                <div className="rf-preview-skill-pills">
                  {sk.languages.split(",").map(s => s.trim()).filter(Boolean).map((t, i) => (
                    <span key={i} className="rf-preview-skill-pill">{t}</span>
                  ))}
                </div>
              </div>
            )}
            {sk.certifications && (
              <div className="rf-preview-skill-group">
                <label>Certifications</label>
                <div className="rf-preview-skill-pills">
                  {sk.certifications.split(",").map(s => s.trim()).filter(Boolean).map((t, i) => (
                    <span key={i} className="rf-preview-skill-pill">{t}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Wizard ──────────────────────────────────────────────────────────────
const STEPS = [
  { label: "Personal\nInfo", key: "personal", icon: "👤" },
  { label: "Work\nExperience", key: "experience", icon: "💼" },
  { label: "Education", key: "education", icon: "🎓" },
  { label: "Skills", key: "skills", icon: "⚡" },
  { label: "Preview", key: "preview", icon: "👁" },
];

const STEP_TITLES = [
  { title: "Personal Information", desc: "Let's start with the basics — your contact details and summary." },
  { title: "Work Experience", desc: "Add your positions, most recent first. You can add as many as you like." },
  { title: "Education", desc: "List your degrees and academic achievements." },
  { title: "Skills & Certifications", desc: "Separate entries with commas — they'll appear as tags in the preview." },
  { title: "Resume Preview", desc: "Here's how your resume looks. Go back to edit any section." },
];

function Wizard({ onSubmit }) {
  const { data } = useResume();
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState({});
  const [dir, setDir] = useState("forward");
  const [submitted, setSubmitted] = useState(false);

  const progress = ((step + 1) / STEPS.length) * 100;

  const goNext = () => {
    if (step < STEPS.length - 1) {
      const errs = validateStep(step, data);
      if (Object.keys(errs).length) { setErrors(errs); return; }
      setErrors({});
      setDir("forward");
      setStep(s => s + 1);
    } else {
      if (onSubmit) onSubmit(data);
      setSubmitted(true);
    }
  };

  const goBack = () => {
    setErrors({});
    setDir("back");
    setStep(s => s - 1);
  };

  if (submitted) {
    return (
      <div style={{ textAlign: "center", padding: "3rem 2rem" }}>
        <div style={{ fontSize: 48, marginBottom: "1rem" }}>🎉</div>
        <h2 style={{ fontFamily: "Lora, serif", fontSize: 24, color: "var(--sand-900)", marginBottom: "0.5rem" }}>Resume Submitted!</h2>
        <p style={{ color: "var(--sand-500)", fontSize: 14, marginBottom: "2rem" }}>Your resume data is ready to be used or exported.</p>
        <button className="rf-btn rf-btn-ghost" onClick={() => { setSubmitted(false); setStep(0); }}>Start Over</button>
      </div>
    );
  }

  const animClass = dir === "forward" ? "slide-in" : "slide-back";

  return (
    <div className="rf-root">
      {/* Header */}
      <div className="rf-header">
        <div className="rf-logo">
          <div className="rf-logo-icon">
            <svg viewBox="0 0 18 18"><path d="M3 2h12a1 1 0 011 1v12a1 1 0 01-1 1H3a1 1 0 01-1-1V3a1 1 0 011-1zm2 3v2h8V5H5zm0 4v2h8V9H5zm0 4v2h5v-2H5z"/></svg>
          </div>
          <span className="rf-title">ResumeForge</span>
        </div>
        <p className="rf-subtitle">Build your professional resume in 5 easy steps</p>
      </div>

      {/* Progress bar */}
      <div className="rf-progress-wrap">
        <div className="rf-progress-bar" style={{ width: `${progress}%` }} />
      </div>

      {/* Step indicators */}
      <div className="rf-steps">
        {STEPS.map((s, i) => (
          <div key={i} className="rf-step-item">
            <div className={`rf-step-bubble${i < step ? " done" : ""}${i === step ? " active" : ""}`}>
              {i < step
                ? <svg width="12" height="10" viewBox="0 0 12 10" fill="none"><path d="M1 5l4 4L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                : <span>{i + 1}</span>
              }
            </div>
            <span className={`rf-step-label${i === step ? " active" : ""}${i < step ? " done" : ""}`}>
              {s.label}
            </span>
          </div>
        ))}
      </div>

      {/* Card */}
      <div className="rf-card">
        <div className="rf-card-header">
          <div className="rf-card-title">{STEP_TITLES[step].title}</div>
          <div className="rf-card-desc">{STEP_TITLES[step].desc}</div>
        </div>
        <div className="rf-card-body">
          <div key={step} className={animClass}>
            {step === 0 && <StepPersonal errors={errors} />}
            {step === 1 && <StepExperience errors={errors} />}
            {step === 2 && <StepEducation errors={errors} />}
            {step === 3 && <StepSkills errors={errors} />}
            {step === 4 && <StepPreview />}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="rf-nav">
        <button className="rf-btn rf-btn-ghost" onClick={goBack} disabled={step === 0}>
          ← Back
        </button>
        <span style={{ fontSize: 12, color: "var(--sand-500)" }}>
          Step {step + 1} of {STEPS.length}
        </span>
        {step < STEPS.length - 1 ? (
          <button className="rf-btn rf-btn-primary" onClick={goNext}>
            Continue →
          </button>
        ) : (
          <button className="rf-btn rf-btn-success" onClick={goNext}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 7l4 4L12 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Submit Resume
          </button>
        )}
      </div>
    </div>
  );
}

// ─── App / ResumeForm root ─────────────────────────────────────────────────────
export default function ResumeForm({ onSubmit }) {
  return (
    <ResumeProvider>
      <style>{css}</style>
      <Wizard onSubmit={onSubmit} />
    </ResumeProvider>
  );
}