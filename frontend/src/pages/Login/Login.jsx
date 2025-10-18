import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../../context/useAuth"; 
import toast, { Toaster } from "react-hot-toast";
import "./Login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loadingLogin, setLoadingLogin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const { login, checkSession, API_URL } = useAuthContext();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (loadingLogin) return;

    if (email.trim() === "" || password.trim() === "") {
      toast.error("Por favor completa todos los campos");
      return;
    }

    setLoadingLogin(true);
    try {
      const result = await login(email, password);
      if (!result.success) throw new Error(result.error);

      toast.success("Inicio de sesión exitoso");
      await checkSession();
      setTimeout(() => navigate("Homep"), 500); // navega directamente a home
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoadingLogin(false);
    }
  };

  return (
    <div className="login-wrapper">
      <Toaster position="top-center" reverseOrder={false} />

      <div className="login-card">
        <div className="login-left">
          <img src={"/imgregister.png"} alt="Triathlon promotional" className="login-img" />
        </div>

        <div className="login-right">
          <h2 className="login-title">Inicie sesión en BlueFruit</h2>
          <p className="login-subtitle">Ingresa tus datos a continuación</p>

          <form onSubmit={handleLogin} className="login-form">
            <div className="input-group">
              <input
                type="email"
                placeholder="Correo electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="login-input"
                required
              />
            </div>

            <div className="input-group" style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="login-input"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                style={{
                  position: "absolute",
                  right: "10px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                }}
                tabIndex={-1}
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {showPassword ? "👁" : "👁‍🗨"}
              </button>
            </div>

            <button type="submit" className="login-btn" disabled={loadingLogin}>
              {loadingLogin ? "Procesando..." : "Iniciar Sesión"}
            </button>

          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
