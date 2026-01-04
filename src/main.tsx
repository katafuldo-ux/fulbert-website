import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import Admin from './Admin.tsx'
import ClientSpace from './components/ClientSpace.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {window.location.pathname === '/admin' ? <Admin /> : 
     window.location.pathname === '/client' ? <ClientSpace /> : <App />}
  </StrictMode>,
)
