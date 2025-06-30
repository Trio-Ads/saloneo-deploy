import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import './i18n'
import DirectionProvider from './components/DirectionProvider'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <DirectionProvider>
      <App />
    </DirectionProvider>
  </StrictMode>,
)
