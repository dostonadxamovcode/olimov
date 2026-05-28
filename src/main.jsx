import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { AuthProvider } from './context/AuthContext'
import './index.css'
import { Toaster } from 'react-hot-toast'

const container = document.getElementById('root')
if (!container) throw new Error('Root element not found')

createRoot(container).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
      <Toaster position="bottom-right" />
    </AuthProvider>
  </React.StrictMode>
)