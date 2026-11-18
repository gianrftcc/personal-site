import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Main3d from './Main3d.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Main3d />
  </StrictMode>,
)
