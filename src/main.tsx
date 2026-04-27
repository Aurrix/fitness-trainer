import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { DndProvider } from 'react-dnd'
import { TouchBackend } from 'react-dnd-touch-backend'
import './index.css'
import App from './App.tsx'
import { registerPWA } from './pwa.ts'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <DndProvider backend={TouchBackend} options={{ enableMouseEvents: true }}>
      <App />
    </DndProvider>
  </StrictMode>,
)

void registerPWA()
