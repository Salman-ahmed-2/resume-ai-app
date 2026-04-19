# AI Resume Builder & Interview Coach

> Build an ATS-optimized resume in minutes and practice mock interviews with real-time AI scoring — powered by **Gemini 2.0 Flash** and **Claude**.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/ai-resume-builder&env=VITE_ANTHROPIC_API_KEY,VITE_GEMINI_API_KEY&envDescription=API+keys+for+Claude+and+Gemini&envLink=https://github.com/YOUR_USERNAME/ai-resume-builder%23environment-variables)

---

## Features

| Feature | Powered by |
|---|---|
| AI resume enhancement — bullets, summary, skills | Gemini 2.0 Flash |
| 4 decorative resume templates (Classic, Modern, Creative, Executive) | In-browser HTML renderer |
| ATS score analyzer with keyword matching | Claude (Sonnet) |
| Mock interview engine — 5 questions, per-answer scoring + feedback | Claude (Sonnet) |
| Live resume preview + PDF export via browser print | Native browser |
| Dark / light theme | CSS variables |

---

## Quick start

### 1 — Clone and install

```bash
git clone https://github.com/YOUR_USERNAME/ai-resume-builder.git
cd ai-resume-builder
npm install
```

### 2 — Set up environment variables

```bash
cp .env.example .env.local
```

Open `.env.local` and fill in both keys (see [Environment Variables](#environment-variables) below).

### 3 — Run locally

```bash
npm run dev
# → http://localhost:5173
```

### 4 — Build for production

```bash
npm run build      # outputs to /dist
npm run preview    # serves /dist locally on :4173
```

---

## Environment Variables

The app needs two API keys. **Neither key is ever bundled into git** — they live only in `.env.local` locally and in Vercel's dashboard in production.

| Variable | Required | Where to get it |
|---|---|---|
| `VITE_ANTHROPIC_API_KEY` | ✅ Yes | [console.anthropic.com/settings/keys](https://console.anthropic.com/settings/keys) |
| `VITE_GEMINI_API_KEY`    | ✅ Yes | [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey) |
| `VITE_APP_URL`           | Optional | Your deployed URL, e.g. `https://yourapp.vercel.app` |

> **Security note:** Both keys are used directly from the browser (`VITE_` prefix makes them public to the bundle). This is intentional for a client-side-only app — apply **API key restrictions** (allowed HTTP referrers) in each provider's console to prevent abuse.
>
> - Anthropic: restrict to your domain at [console.anthropic.com](https://console.anthropic.com)
> - Google AI Studio: add HTTP referrer restrictions in [Google Cloud Console](https://console.cloud.google.com)

---

## Deploying to Vercel

### Option A — One-click deploy

Click the **Deploy with Vercel** button at the top of this README. Vercel will prompt you for both API keys during setup.

### Option B — Vercel CLI

```bash
npm i -g vercel
vercel login
vercel --prod
```

Vercel auto-detects the `vercel.json` in the repo root and applies:
- SPA redirect rules (all routes → `index.html`)
- Immutable cache headers on `/assets/*`
- Security headers on all responses

### Option C — Vercel Dashboard (GitHub integration)

1. Push this repo to GitHub.
2. Go to [vercel.com/new](https://vercel.com/new) and import the repo.
3. Under **Environment Variables**, add:
   - `VITE_ANTHROPIC_API_KEY` → your Anthropic key
   - `VITE_GEMINI_API_KEY` → your Gemini key
4. Click **Deploy**.

Vercel reads `vercel.json` automatically — no further configuration needed.

---

## Custom Domain

### Via Vercel Dashboard

1. Open your project in the [Vercel Dashboard](https://vercel.com/dashboard).
2. Go to **Settings → Domains**.
3. Click **Add Domain** and enter your domain (e.g. `resumeai.yourdomain.com`).
4. Vercel provides two DNS records — add them at your registrar:

| Type | Name | Value |
|---|---|---|
| `A`     | `@`             | `76.76.21.21` |
| `CNAME` | `www` (or subdomain) | `cname.vercel-dns.com` |

5. SSL is provisioned automatically — typically ready within 60 seconds.

### Update canonical URLs after adding a domain

Once your domain is live, update these two places:

**`index.html`** — change `https://ai-resume-builder.vercel.app/` to your domain in:
- `<link rel="canonical">`
- All `og:url`, `og:image`, `twitter:url`, `twitter:image` meta tags
- The JSON-LD `url` field

**`robots.txt`** — update the `Sitemap:` line.

---

## Project Structure

```
ai-resume-builder/
├── public/
│   ├── og-image.png          # 1200×630 Open Graph image
│   ├── favicon.svg
│   ├── favicon-32x32.png
│   ├── apple-touch-icon.png
│   ├── android-chrome-192x192.png
│   ├── android-chrome-512x512.png
│   ├── robots.txt
│   └── site.webmanifest
├── src/
│   ├── hooks/
│   │   ├── useClaudeAPI.js     # Streaming wrapper for Anthropic API
│   │   └── useGeminiAPI.js     # JSON wrapper for Gemini API
│   ├── components/
│   │   ├── ResumeForm.jsx      # Multi-step form (personal, experience, education, skills)
│   │   ├── AIOutput.jsx        # Markdown renderer for Claude output
│   │   ├── AISuggestionsPanel.jsx
│   │   ├── LoadingSkeleton.jsx
│   │   ├── ATSScorer.jsx       # ATS keyword analysis with score ring
│   │   ├── ResumePreview.jsx   # Live A4 iframe preview + export
│   │   ├── TemplateChooser.jsx # SVG thumbnail template picker
│   │   └── MockInterview.jsx   # Full mock interview engine
│   ├── pages/
│   │   └── Builder.jsx         # Main resume builder page
│   ├── resumeTemplates.js      # 4 HTML resume template renderers
│   ├── App.jsx
│   └── main.jsx
├── index.html                  # SEO meta tags, OG tags, JSON-LD
├── vercel.json                 # SPA rewrites, caching, security headers
├── vite.config.js              # Build config, chunk splitting
├── .env.example                # Template — copy to .env.local
├── gitignore.
└── README.md
```

---

## Local `useClaudeAPI` hook reference

The app ships with a streaming hook. Basic usage:

```js
const { generate, loading, error } = useClaudeAPI()

// Stream a response
let result = ''
await generate(systemPrompt, userMessage, chunk => {
  result += chunk
  setDisplay(result)        // update UI as tokens arrive
})

// Or collect the full response at once
await generate(systemPrompt, userMessage, text => setResult(text))
```

The hook reads `import.meta.env.VITE_ANTHROPIC_API_KEY` at runtime — it is never hardcoded.

---

## `useGeminiAPI` hook reference

Returns structured JSON from Gemini:

```js
const { generateJSON, loading, error } = useGeminiAPI()

const data = await generateJSON(systemPrompt, userPrompt)
// data is a parsed JS object or null on failure
```

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server on `:5173` |
| `npm run build` | Production build → `/dist` |
| `npm run preview` | Serve `/dist` on `:4173` |
| `npm run lint` | ESLint check |

---

## Browser support

| Browser | Minimum version |
|---|---|
| Chrome / Edge | 90+ |
| Firefox | 90+ |
| Safari | 15+ |
| Mobile Safari | iOS 15+ |

PDF export uses `window.print()` inside an iframe — works in all modern browsers. Chrome/Edge produce the cleanest PDF output.

---

## License

MIT — see [LICENSE](LICENSE) for details.