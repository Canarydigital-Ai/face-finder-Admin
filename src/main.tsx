import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import { store, persistor } from './store/slices/index.ts' 
import './index.css'
import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom'
import { MantineProvider } from "@mantine/core";

// Loading component for PersistGate
const PersistLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-sky-600"></div>
  </div>
);

createRoot(document.getElementById('root') as HTMLElement).render( 
  <StrictMode>
    <Provider store={store}>
      <PersistGate loading={<PersistLoader />} persistor={persistor}>
        <BrowserRouter>
          <MantineProvider>
            <App />
          </MantineProvider>
        </BrowserRouter>
      </PersistGate>
    </Provider>
  </StrictMode>,
)
