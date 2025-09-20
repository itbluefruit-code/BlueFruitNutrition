import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../../context/useAuth"; 
import toast, { Toaster } from "react-hot-toast";
import "./Login.css";

const AdminCodeModal = ({ onClose, email }) => {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleVerifyCode = async () => {
    if (!code.trim()) return toast.error("Por favor ingresa el código");
    setLoading(true);
    try {
      const res = await fetch("https://bluefruitnutrition1.onrender.com/api/admin/verify-code", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Código inválido");

      toast.success("Código verificado correctamente");
      window.location.href = "https://blue-fruit-nutrition-private.vercel.app";
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Verificación de código</h3>
        <p>Ingrese el código enviado a <b>{email}</b></p>
        <input
          type="text"
          value={code}
          onChange={e => setCode(e.target.value)}
          maxLength={6}
          placeholder="Código de verificación"
          disabled={loading}
        />
        <button onClick={handleVerifyCode} disabled={loading}>
          {loading ? "Verificando..." : "Verificar"}
        </button>
        <button onClick={onClose} disabled={loading} className="modal-close-btn">Cancelar</button>
      </div>
    </div>
  );
};

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminEmail, setAdminEmail] = useState("");
  const [loadingLogin, setLoadingLogin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const { login, checkSession } = useAuthContext();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (loadingLogin) return;
    if (!email.trim() || !password.trim()) return toast.error("Completa todos los campos");

    setLoadingLogin(true);
    try {
      const result = await login(email, password);
      if (!result.success) throw new Error(result.error);

      // Admin
      if (result.data.user.role === "admin") {
        const sendCodeRes = await fetch("https://bluefruitnutrition1.onrender.com/api/admin/send-code", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        const sendCodeData = await sendCodeRes.json();
        if (!sendCodeRes.ok) throw new Error(sendCodeData.message || "Error enviando código");

        toast.success("Código enviado al correo. Por favor verifica.");
        setAdminEmail(email);
        setShowAdminModal(true);
        return;
      }

      // Usuario normal
      toast.success("Inicio de sesión exitoso");
      await checkSession();
      navigate("/");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoadingLogin(false);
    }
  };

  return (
    <div className="login-container">
      <Toaster position="top-center" reverseOrder={false} />
      <div className="left-side">
        <img src="/imgregister.png" alt="Promo" className="promo-image" />
      </div>
      <div className="right-side">
        <div className="form-wrapper">
          <h2>Inicie sesión en BlueFruit</h2>
          <form onSubmit={handleLogin} className="login-form">
            <input
              type="email"
              placeholder="Correo electrónico"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Contraseña"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
              <button type="button" onClick={() => setShowPassword(prev => !prev)} tabIndex={-1}>
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
            <button type="submit" disabled={loadingLogin}>
              {loadingLogin ? "Procesando..." : "Iniciar Sesión"}
            </button>
          </form>
        </div>
      </div>

      {showAdminModal && <AdminCodeModal email={adminEmail} onClose={() => setShowAdminModal(false)} />}
    </div>
  );
};

export default Login;
