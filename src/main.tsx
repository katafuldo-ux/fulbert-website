import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { useState, useEffect } from 'react'
import App from './App.tsx'
import Admin from './Admin.tsx'
import ClientSpace from './components/ClientSpace.tsx'

function Router() {
  const [page, setPage] = useState('home')

  useEffect(() => {
    const hash = window.location.hash.replace('#', '') || 'home'
    setPage(hash)
  }, [])

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '') || 'home'
      setPage(hash)
    }
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  switch (page) {
    case 'admin':
      return <Admin />
    case 'client':
      return <ClientSpace />
    default:
      return <App />
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Router />
  </StrictMode>,
)
