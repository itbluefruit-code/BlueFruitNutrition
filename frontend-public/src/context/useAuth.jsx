import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext debe usarse dentro de AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // URL base del backend en Render
  const API_URL = "https://bluefruitnutrition1.onrender.com/api";

  // Verificar sesión al cargar la app
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch(`${API_URL}/session/auth/session`, {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        });

        if (!res.ok) throw new Error("No autenticado");

        const data = await res.json();
        setUser(data.user || data);
        setIsAuthenticated(true);
        console.log("✅ Sesión verificada:", data);
      } catch (error) {
        console.log("❌ No hay sesión activa");
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const checkSession = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/session/auth/session`, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) throw new Error("No autenticado");

      const data = await res.json();
      setUser(data.user || data);
      setIsAuthenticated(true);
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const res = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Error en login");

      if (!data.user || !data.user.id) throw new Error("Datos de usuario incompletos");

      setUser(data.user);
      setIsAuthenticated(true);

      return { success: true, data };
    } catch (error) {
      console.error("❌ Error login:", error);
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      await fetch(`${API_URL}/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error("❌ Error logout:", error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const value = { user, loading, isAuthenticated, login, logout, checkSession };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
