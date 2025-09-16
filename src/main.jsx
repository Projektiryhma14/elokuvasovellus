import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './screens/App.jsx'
import SignUp from './screens/SignUp.jsx'
import SignIn from './screens/SignIn.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <SignIn />
  </StrictMode>,
)
