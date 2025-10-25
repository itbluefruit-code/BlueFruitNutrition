import { useState } from "react";
import Swal from "sweetalert2";
import './forgotPassword.css';

export default function ForgotPassword() {
  const [email, setEmail] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("https://bluefruitnutrition-production.up.railway.app/api/passwordRecovery/requestCode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
        credentials: "include",
      });

      const data = await res.json();

      if (res.ok) {
        Swal.fire({
          icon: "success",
          title: "¡Código enviado!",
          text: data.message || "Revisa tu correo electrónico para continuar.",
          confirmButtonColor: "#4CAF50",
        }).then(() => {
          localStorage.setItem("recoveryEmail", email);
          window.location.href = "/verificar-codigo";
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: data.message || "No se pudo enviar el código. Inténtalo de nuevo.",
          confirmButtonColor: "#f44336",
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error del servidor",
        text: "No se pudo conectar al servidor. Inténtalo más tarde.",
        confirmButtonColor: "#f44336",
      });
    }
  };

  return (
    <div className="recovery-page">
      <div className="recovery-box">
        <div className="recovery-left">
          <img
            src="/recuperar-contraseña.png"
            alt="Recuperar contraseña"
            className="recovery-image"
          />
        </div>

        <div className="recovery-right">
          <h2 className="recovery-title">¿Olvidaste tu contraseña?</h2>
          <p className="recovery-text">
            Ingresá tu correo y te enviaremos un código de verificación para restablecerla.
          </p>

          <form onSubmit={handleSubmit} className="recovery-form">
            <input
              type="email"
              placeholder="Correo electrónico"
              className="recovery-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button type="submit" className="recovery-button">
              Enviar código
            </button>
          </form>

          <div className="recovery-footer">
            <a href="/login" className="recovery-link">
              ← Volver al inicio de sesión
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
