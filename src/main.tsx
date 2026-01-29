import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import './index.css';
import './i18n';
import App from './App.tsx';
import {CheckSplitProvider} from './context/CheckSplitContext';
import {ThemeProvider} from './context/ThemeContext';
import {initializeFirebaseAppCheck} from './firebase';

// Initialize Firebase App Check before rendering
initializeFirebaseAppCheck();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <CheckSplitProvider>
        <App />
      </CheckSplitProvider>
    </ThemeProvider>
  </StrictMode>,
);
