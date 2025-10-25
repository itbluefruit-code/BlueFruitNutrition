import { useState } from "react";
import './VerifyCode.css'; // Nuevo CSS más bonito

export default function VerifyCode() {
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const email = localStorage.getItem("recoveryEmail");
    const res = await fetch("https://bluefruitnutrition-production.up.railway.app/api/passwordRecovery/verifyCode", {
      credentials: "include",
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code }),
    });
    const data = await res.json();
    setMessage(data.message);
    if (res.ok) {
      window.location.href = "/nueva-contraseña";
    }
  };

  return (
    <div className="verify-container">
      <div className="verify-wrapper">
        <div className="verify-image">
          <img src="/recuperar-contraseña.png" alt="Recuperar contraseña" />
        </div>

        <div className="verify-card">
          <h2>¿Olvidaste tu contraseña?</h2>
          <h4>Ingresa el código que enviamos a tu correo</h4>

          <form onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Código de verificación"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
            />
            <button type="submit" className="verify-btn">
              Enviar código
            </button>
          </form>

          {message && <p className="verify-message">{message}</p>}
        </div>
      </div>
    </div>
  );
}
