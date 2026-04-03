import React, { createContext, useContext, useState, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';

interface GoogleJwtPayload {
  email: string;
  name: string;
  picture: string;
  sub: string;
}

interface AuthUser {
  email: string;
  name: string;
  picture: string;
  /** Raw Google OAuth access token for API calls */
  accessToken: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  signIn: (credentialResponse: { credential?: string; access_token?: string }) => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const AUTHORIZED_EMAIL = import.meta.env.VITE_AUTHORIZED_EMAIL as string;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);

  const signIn = useCallback(
    (response: { credential?: string; access_token?: string }) => {
      const credential = response.credential;
      if (!credential) return;

      let payload: GoogleJwtPayload;
      try {
        payload = jwtDecode<GoogleJwtPayload>(credential);
      } catch {
        alert('Invalid authentication token.');
        return;
      }

      if (AUTHORIZED_EMAIL && payload.email !== AUTHORIZED_EMAIL) {
        alert(`Access denied. Only ${AUTHORIZED_EMAIL} may use this app.`);
        return;
      }

      setUser({
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
        accessToken: credential,
      });
    },
    []
  );

  const signOut = useCallback(() => setUser(null), []);

  return (
    <AuthContext.Provider value={{ user, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
