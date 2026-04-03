import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import './index.css';
import App from './App.tsx';
import { AuthProvider } from './contexts/AuthContext.tsx';

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;

if (!clientId) {
  throw new Error(
    'Missing required environment variable: VITE_GOOGLE_CLIENT_ID. ' +
    'Copy .env.example to .env and fill in your Google OAuth Client ID.'
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={clientId}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </GoogleOAuthProvider>
  </StrictMode>,
);

