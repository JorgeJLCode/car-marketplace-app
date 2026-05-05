import { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { API_URL } from '../config';

const AuthContext = createContext();

const parseJwt = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
      const decoded = parseJwt(token);
      if (decoded) {
        const role = decoded.role || decoded.roles || (decoded.authorities ? decoded.authorities[0] : null) || 'USER';
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setUser({ email: decoded.sub || decoded.email, role: role, authenticated: true });
      } else {
        setUser({ authenticated: true, role: 'USER' });
      }
    } else {
      localStorage.removeItem('token');
      setUser(null);
    }
  }, [token]);

  const login = async (email, password) => {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || 'Login failed');
    }

    const data = await response.json();
    setToken(data.token);

    /**
     * REDIRECT CON QUERY PARAM:
     * Tras el login, comprobamos si la URL actual tiene un parámetro "redirect".
     * Este parámetro lo añade el botón ❤️ cuando un usuario no autenticado
     * intenta marcar un favorito: navega a /login?redirect=/cars/42
     *
     * De esta forma, tras autenticarse, el usuario vuelve exactamente
     * al punto donde estaba, en lugar de ir siempre al Home.
     * Esto mejora significativamente la experiencia de usuario.
     */
    const params = new URLSearchParams(location.search);
    const redirectTo = params.get('redirect') || '/';
    navigate(redirectTo);
  };

  const register = async (name, email, password) => {
    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || 'Registration failed');
    }

    const data = await response.json();
    setToken(data.token);

    // Mismo comportamiento que login: respetar el redirect param si existe
    const params = new URLSearchParams(location.search);
    const redirectTo = params.get('redirect') || '/';
    navigate(redirectTo);
  };

  const logout = () => {
    setToken(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
