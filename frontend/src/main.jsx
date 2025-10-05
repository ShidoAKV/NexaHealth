import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import Appcontextprovider from './Context/Context.jsx'
import { NotificationProvider } from './Context/Notification.jsx'
createRoot(document.getElementById('root')).render(

  <StrictMode>
   <BrowserRouter>
      <Appcontextprovider>
        <NotificationProvider>
             <App/>
        </NotificationProvider>
      </Appcontextprovider>
   </BrowserRouter>
  </StrictMode>
)
