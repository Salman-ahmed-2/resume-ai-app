
import { useRef, useEffect, useState, useCallback } from 'react'
import {
  Printer, Download, ZoomIn, ZoomOut, Maximize2, X,
  FileText, Loader2, RefreshCw
} from 'lucide-react'
import html2pdf from 'html2pdf.js'
import { TEMPLATES } from './ResumeTemplate'

export default function ResumePreview({
  resumeData,
  selectedTemplate,
  onTemplateChange,
  loading,
}) {
  const iframeRef  = useRef(null)
  const [zoom, setZoom]         = useState(0.55)
  const [fullscreen, setFullscreen] = useState(false)
  const [rendered, setRendered] = useState(false)

  const currentTemplate = TEMPLATES.find(t => t.id === selectedTemplate) || TEMPLATES[0]

  // Build combined data for template
  const buildTemplateData = useCallback(() => {
    if (!resumeData) return null
    return {
      personal:   resumeData.personal   || {},
      experience: (resumeData.experience || []).map(e => ({
        ...e,
        bullets: e.aiBullets || [],
      })),
      education:  resumeData.education  || [],
      skills:     resumeData.skills     || {},
      targetRole: resumeData.targetRole || '',
      aiSummary:  resumeData.aiSummary  || '',
      aiSkills:   resumeData.aiSkills   || [],
    }
  }, [resumeData])

  // Render template into iframe
  useEffect(() => {
    const data = buildTemplateData()
    if (!data || !iframeRef.current) { setRendered(false); return }
    try {
      const html = currentTemplate.render(data)
      const doc = iframeRef.current.contentDocument || iframeRef.current.contentWindow?.document
      if (!doc) return
      doc.open()
      doc.write(html)
      doc.close()
      setRendered(true)
    } catch (err) {
      console.error('Template render error:', err)
    }
  }, [resumeData, selectedTemplate, buildTemplateData, currentTemplate])

  const handleDownloadPDF = useCallback(async () => {
    const data = buildTemplateData()
    if (!data) return

    try {
      const html = currentTemplate.render(data)

      // Create a temporary element to hold the HTML
      const tempDiv = document.createElement('div')
      tempDiv.innerHTML = html
      tempDiv.style.width = '210mm'
      tempDiv.style.minHeight = '297mm'
      tempDiv.style.padding = '0mm'
      tempDiv.style.boxSizing = 'border-box'
      tempDiv.style.fontFamily = 'system-ui, -apple-system, sans-serif'

      // Configure html2pdf options
      const options = {
    
        filename: `resume-${selectedTemplate}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          letterRendering: true
        },
        jsPDF: {
          unit: 'mm',
          format: 'a4',
          orientation: 'portrait'
        }
      }

      // Generate and download PDF
      await html2pdf().set(options).from(tempDiv).save()
    } catch (error) {
      console.error('PDF generation failed:', error)
      alert('Failed to generate PDF. Please try again.')
    }
  }, [buildTemplateData, currentTemplate, selectedTemplate])

  const handlePrint = useCallback(() => {
    if (!iframeRef.current) return
    iframeRef.current.contentWindow?.print()
  }, [])




  const handleDownloadHTML = useCallback(() => {
    const data = buildTemplateData()
    if (!data) return
    const html = currentTemplate.render(data)
    const blob = new Blob([html], { type: 'text/html' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `resume-${selectedTemplate}.html`
    a.click()
    URL.revokeObjectURL(url)
  }, [buildTemplateData, currentTemplate, selectedTemplate])




  const PreviewFrame = () => (
    <div
      className="relative overflow-hidden rounded-xl"
      style={{
        background: '#e8e8e8',
        padding: '16px',
        minHeight: fullscreen ? 'calc(100vh - 120px)' : '600px',
      }}
    >
      {/* Paper shadow wrapper */}
      <div
        style={{
          width: '210mm',
          transformOrigin: 'top left',
          transform: `scale(${zoom})`,
          boxShadow: '0 4px 32px rgba(0,0,0,0.18), 0 1px 4px rgba(0,0,0,0.08)',
          borderRadius: '2px',
          overflow: 'hidden',
          background: '#fff',
          height: `${297 / zoom * zoom}mm`,
        }}
      >
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full gap-3" style={{ height: '297mm' }}>
            <Loader2 size={28} className="animate-spin" style={{ color: currentTemplate.accent }} />
            <p className="text-sm text-gray-500">Generating your resume…</p>
          </div>
        ) : !resumeData ? (
          <div className="flex flex-col items-center justify-center gap-4 text-center" style={{ height: '297mm' }}>
            <FileText size={40} color="#ccc" />
            <div>
              <p className="text-sm font-medium text-gray-400">No resume data yet</p>
              <p className="text-xs text-gray-300 mt-1">Fill in the form and click Enhance or Generate</p>
            </div>
          </div>
        ) : (
          <iframe
            ref={iframeRef}
            title="Resume Preview"
            style={{
              width: '210mm',
              height: '297mm',
              border: 'none',
              display: 'block',
            }}
            sandbox="allow-same-origin allow-scripts"
          />
        )}
      </div>
    </div>
  )

  return (
    <div className={fullscreen
      ? 'fixed inset-0 z-50 flex flex-col p-6 overflow-auto'
      : 'flex flex-col gap-3'
    }
      style={fullscreen ? { background: 'var(--bg-primary)' } : {}}
    >
      {/* Toolbar */}
      <div
        className="flex items-center gap-2 flex-wrap"
        style={fullscreen ? { marginBottom: '8px' } : {}}
      >
        {/* Template pills */}
        <div
          className="flex rounded-lg p-0.5 gap-0.5"
          style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}
        >
          {TEMPLATES.map(t => (
            <button
              key={t.id}
              onClick={() => onTemplateChange(t.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-150"
              style={{
                background: selectedTemplate === t.id ? t.accent : 'transparent',
                color: selectedTemplate === t.id ? '#fff' : 'var(--text-muted)',
              }}
            >
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ background: selectedTemplate === t.id ? 'rgba(255,255,255,0.6)' : t.accent }}
              />
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex-1" />

        {/* Zoom */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setZoom(z => Math.max(0.3, z - 0.05))}
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
            style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}
          >
            <ZoomOut size={12} />
          </button>
          <span className="text-xs font-mono w-10 text-center" style={{ color: 'var(--text-muted)' }}>
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => setZoom(z => Math.min(1.2, z + 0.05))}
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
            style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}
          >
            <ZoomIn size={12} />
          </button>
        </div>

        {/* Download PDF */}
        {rendered && (
          <button
            onClick={handleDownloadPDF}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
            style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
            title="Download as PDF"
          >
            <Download size={12} /> Download PDF
          </button>
        )}

        {/* Print */}
        {rendered && (
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
            style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
            title="Print resume"
          >
            <Printer size={12} /> Print
          </button>
        )}

        {/* Download HTML */}
        {rendered && (
          <button
            onClick={handleDownloadHTML}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
            style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
            title="Download as HTML file"
          >
            <Download size={12} /> Download HTML
          </button>
        )}

        {/* Fullscreen */}
        {/* <button
          onClick={() => setFullscreen(f => !f)}
          className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
          style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}
          title={fullscreen ? 'Exit fullscreen' : 'Fullscreen preview'}
        >
          {fullscreen ? <X size={12} /> : <Maximize2 size={12} />}
        </button> */}
      </div>

      {/* Preview area */}
      <div className="overflow-auto" style={{ maxHeight: fullscreen ? 'calc(100vh - 100px)' : '680px' }}>
        <div style={{
          width: `calc(210mm * ${zoom} + 32px)`,
          minWidth: '280px',
          paddingBottom: '16px',
        }}>
          <PreviewFrame />
        </div>
      </div>

      {/* Template info strip */}
      <div
        className="flex items-center justify-between px-3 py-2 rounded-lg text-xs"
        style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}
      >
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ background: currentTemplate.accent }} />
          <span style={{ color: 'var(--text-secondary)' }}>
            <strong>{currentTemplate.label}</strong> — {currentTemplate.subtitle}
          </span>
        </div>
        {rendered && (
          <span className="flex items-center gap-1" style={{ color: 'var(--accent)' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
            Live preview
          </span>
        )}
      </div>
    </div>
  )
}