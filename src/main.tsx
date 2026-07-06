import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { ThemeProvider } from './contexts/ThemeContext'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from './lib/queryClient'
import { ErrorBoundary } from './components/ErrorBoundary'

let rawClientId = ((import.meta as any).env.VITE_GOOGLE_CLIENT_ID || "").replace(/\s+/g, '');
if (rawClientId && !rawClientId.includes('-') && rawClientId.length === 71) {
  rawClientId = rawClientId.slice(0, 12) + '-' + rawClientId.slice(12);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <ThemeProvider>
        <QueryClientProvider client={queryClient}>
          <GoogleOAuthProvider clientId={rawClientId}>
            <App />
          </GoogleOAuthProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </ErrorBoundary>
  </StrictMode>,
)
