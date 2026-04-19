import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { AuthProvider } from './context/AuthContext'
import Navbar from './components/Navbar'
import Landing from './pages/Landing'
import Builder from './pages/Builder'
import Coach from './pages/Coach'
import CoverLetter from './pages/CoverLetter'

export default function App() {
  const [dark, setDark] = useState(() => {
    const stored = localStorage.getItem('theme')
    if (stored) return stored === 'dark'
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('theme', dark ? 'dark' : 'light')
  }, [dark])

  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
          <Navbar dark={dark} setDark={setDark} />
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/builder" element={<Builder />} />
            <Route path="/coach" element={<Coach />} />
            <Route path="/cover-letter" element={<CoverLetter />} />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  )
}