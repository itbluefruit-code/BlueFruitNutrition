import React, { createContext, useContext, useState, useEffect } from "react";
import config from "../config.js";


const AuthContext = createContext();


export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context)
    throw new Error("useAuthContext debe usarse dentro de AuthProvider");
  return context;
};


export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);


  const API_URL = config.API_URL;


  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('Verificando sesión inicial...');
        console.log(' API_URL:', API_URL);
       
        const res = await fetch(`${API_URL}/session/auth/session`, {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });


        console.log('Respuesta de sesión:', res.status);


        if (res.ok) {
          const data = await res.json();
          setUser(data);
          setIsAuthenticated(true);
          console.log("✅ Sesión activa:", data);
        } else {
          setUser(null);
          setIsAuthenticated(false);
          console.log("❌ No hay sesión activa");
        }
      } catch (err) {
        console.error("❌ Error verificando sesión:", err);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, [API_URL]);


  const checkSession = async () => {
    console.log('Verificando sesión manualmente...');
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/session/auth/session`, {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
     
      console.log('Estado de respuesta:', res.status);
     
      if (res.ok) {
        const data = await res.json();
        setUser(data);
        setIsAuthenticated(true);
        console.log("✅ Sesión verificada:", data);
      } else {
        setUser(null);
        setIsAuthenticated(false);
        console.log("❌ Sesión no válida");
      }
    } catch (err) {
      console.error("❌ Error en checkSession:", err);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };


  const login = async (email, password) => {
    try {
      console.log(' Intentando login...');
      const res = await fetch(`${API_URL}/login`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
     
      console.log('Respuesta de login:', data);
     
      if (res.ok && data.user) {
        setUser(data.user);
        setIsAuthenticated(true);
        console.log("✅ Login exitoso:", data.user);
        return { success: true, data };
      } else {
        throw new Error(data.message || "Error en login");
      }
    } catch (err) {
      console.error("❌ Error en login:", err);
      return { success: false, error: err.message };
    }
  };


  const logout = async () => {
    try {
      await fetch(`${API_URL}/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.error(err);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
    }
  };


  return (
    <AuthContext.Provider
      value={{ user, loading, isAuthenticated, login, logout, checkSession, API_URL }}
    >
      {children}
    </AuthContext.Provider>
  );
};


export default AuthContext;