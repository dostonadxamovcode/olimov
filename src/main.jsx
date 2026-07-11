
import React, { useState, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'
import { Toaster } from 'react-hot-toast'
import './i18n/i18n'

function ResponsiveToaster() {
  const [position, setPosition] = useState('bottom-left')

  useEffect(() => {
    const updatePosition = () => {
      setPosition(window.innerWidth >= 768 ? 'bottom-left' : 'top-center')
    }
    updatePosition()
    window.addEventListener('resize', updatePosition)
    return () => window.removeEventListener('resize', updatePosition)
  }, [])

  return (
    <Toaster
      position={position}
      toastOptions={{
        duration: 4000,
        style: { background: 'transparent', boxShadow: 'none', padding: 0, maxWidth: '420px' },
      }}
    />
  )
}

const container = document.getElementById('root')
if (!container) throw new Error('Root element not found')

let root = window.__reactRoot
if (!root) {
  root = createRoot(container)
  window.__reactRoot = root
}

root.render(
  <React.StrictMode>
    <App />
    <ResponsiveToaster />
  </React.StrictMode>
)
