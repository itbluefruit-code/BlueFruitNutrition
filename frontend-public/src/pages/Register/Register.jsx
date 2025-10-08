import React, { useState } from "react";
import { useForm } from "react-hook-form";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import "./Register.css";

function Registro() {
  const [tipoUsuario, setTipoUsuario] = useState("customer"); // usa "customer" y "distributor"
  const [showModal, setShowModal] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({ mode: "onTouched" });

  const getMinBirthDate = () => {
    const today = new Date();
    today.setFullYear(today.getFullYear() - 18);
    return today.toISOString().split("T")[0];
  };
  const minBirthDate = getMinBirthDate();

  const onSubmit = async (data) => {
    try {
      let payload = {};
      let endpoint = "";

      if (tipoUsuario === "customer") {
        // aquí era "customers" en tu if, pero tu estado usa "customer", se unifica a "customer"
        endpoint = "https://bluefruitnutrition-production.up.railway.app/api/registerCustomers";
        payload = {
          name: data.name,
          lastName: data.lastName,
          email: data.email,
          password: data.password,
          phone: data.phone || "00000000",
          dateBirth: data.dateBirth,
          address: data.address || "No especificado",
          gender: data.gender || "Otro",
          weight: data.weight || 0,
          height: data.height || 0,
          idSports: data.idSports || null,

        };
      } else if (tipoUsuario === "distributor") {
        endpoint = "https://bluefruitnutrition-production.up.railway.app/api/registerDistributors";
        payload = {
          companyName: data.companyName,
          email: data.email,
          password: data.password,
          phone: data.phone || "00000000",
          NIT: data.NIT,
          address: data.address || "No especificado",
          verified: data.verified || false,
          status: data.status || true,

        };
      }

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      let result;
      try {
        result = await res.json();
      } catch {
        result = { message: "No se pudo interpretar la respuesta del servidor" };
      }

      if (!res.ok) {
        return Swal.fire({
          icon: "error",
          title: "Error en el registro",
          text: result.message || "Error interno del servidor",
        });
      }

      setRegisteredEmail(payload.email);
      setShowModal(true);
      reset();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Error de red o del servidor",
      });
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode) {
      return Swal.fire({
        icon: "warning",
        title: "Ingresa el código",
        text: "Introduce el código de verificación enviado a tu correo",
      });
    }

    try {
      const endpoint =
        tipoUsuario === "customer"
          ? "https://bluefruitnutrition-production.up.railway.app/api/registerCustomers/verifyCodeEmail"
          : "https://bluefruitnutrition-production.up.railway.app/api/registerDistributors/verifyCodeEmail";

      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ requireCode: verificationCode, email: registeredEmail }),
      });


      const result = await res.json();
      console.log("Verification result:", result);

      if (!res.ok) {
        return Swal.fire({
          icon: "error",
          title: "Código incorrecto",
          text: result.message || "El código ingresado no es válido.",
        });
      }

      Swal.fire({
        icon: "success",
        title: "Cuenta verificada",
        text: result.message || "Tu cuenta ha sido activada correctamente.",
      });

      setShowModal(false);
      setVerificationCode("");
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Error al verificar el código.",
      });
    }
  };

  return (
    <div className="registro-wrapper">
      <div className="registro-card" role="region" aria-label="Registro de usuario">
        <div className="registro-left" aria-hidden="true">
          <img src="/imgregister.png" alt="Ilustración de seguridad" className="registro-img" />
        </div>

        <div className="registro-right">
          <h1 className="welcome-title">Bienvenido!</h1>
          <h2 className="tipo-cuenta-titulo">Selecciona tu tipo de cuenta</h2>

          <div className="btn-switch-group" role="tablist" aria-label="Tipo de cuenta">
            <button
              type="button"
              aria-pressed={tipoUsuario === "customer"}
              className={`btn-switch ${tipoUsuario === "customer" ? "active" : ""}`}
              onClick={() => {
                setTipoUsuario("customer");
                reset();
              }}
            >
              Cliente
              <span className="btn-switch-icon" aria-hidden="true">
                <img src={"/customerIcon.png"} alt="" />
              </span>
            </button>
            <button
              type="button"
              aria-pressed={tipoUsuario === "distributor"}
              className={`btn-switch ${tipoUsuario === "distributor" ? "active" : ""}`}
              onClick={() => {
                setTipoUsuario("distributor");
                reset();
              }}
            >
              Distribuidor
              <span className="btn-switch-icon" aria-hidden="true">
                <img src={"/distributorIcon.png"} alt="" />
              </span>
            </button>
          </div>

          <p className="tipo-usuario-texto">
            Registrarse como {tipoUsuario === "customer" ? "Cliente" : "Distribuidor"}
          </p>
          <br />

          <form className="registro-form" onSubmit={handleSubmit(onSubmit)}>
            {tipoUsuario === "customer" ? (
              <>
                <input
                  type="text"
                  placeholder="Nombre"
                  className={`input-modern ${errors.name ? "input-error" : ""}`}
                  {...register("name", { required: "El nombre es obligatorio" })}
                />
                {errors.name && <span className="error-message">{errors.name.message}</span>}

                <input
                  type="text"
                  placeholder="Apellido"
                  className={`input-modern ${errors.lastName ? "input-error" : ""}`}
                  {...register("lastName", { required: "El apellido es obligatorio" })}
                />
                {errors.lastName && <span className="error-message">{errors.lastName.message}</span>}

                <input
                  type="email"
                  placeholder="Correo electrónico"
                  className={`input-modern ${errors.email ? "input-error" : ""}`}
                  {...register("email", { required: "El correo es obligatorio" })}
                />
                {errors.email && <span className="error-message">{errors.email.message}</span>}

                <input
                  type="password"
                  placeholder="Contraseña"
                  className={`input-modern ${errors.password ? "input-error" : ""}`}
                  {...register("password", { required: "La contraseña es obligatoria" })}
                />
                {errors.password && <span className="error-message">{errors.password.message}</span>}

                <input type="tel" placeholder="Número de teléfono" className="input-modern" {...register("phone")} />
                <input
                  type="date"
                  placeholder="Fecha de nacimiento"
                  className={`input-modern ${errors.dateBirth ? "input-error" : ""}`}
                  {...register("dateBirth", { required: "Fecha de nacimiento obligatoria" })}
                  max={minBirthDate}
                />
                <input type="text" placeholder="Dirección" className="input-modern" {...register("address")} />
                <select
                  className={`input-modern ${errors.gender ? "input-error" : ""}`}
                  {...register("gender", { required: "El género es obligatorio" })}
                  defaultValue=""
                >
                  <option value="" disabled>Selecciona tu género</option>
                  <option value="Hombre">Hombre</option>
                  <option value="Mujer">Mujer</option>
                </select>
                {errors.gender && <span className="error-message">{errors.gender.message}</span>}

              </>
            ) : (
              <>
                <input
                  type="text"
                  placeholder="Nombre de la empresa"
                  className={`input-modern ${errors.companyName ? "input-error" : ""}`}
                  {...register("companyName", { required: "El nombre de la empresa es obligatorio" })}
                />
                <input
                  type="email"
                  placeholder="Correo electrónico"
                  className={`input-modern ${errors.email ? "input-error" : ""}`}
                  {...register("email", { required: "El correo es obligatorio" })}
                />
                <input
                  type="password"
                  placeholder="Contraseña"
                  className={`input-modern ${errors.password ? "input-error" : ""}`}
                  {...register("password", { required: "La contraseña es obligatoria" })}
                />
                <input type="tel" placeholder="Teléfono" className="input-modern" {...register("phone")} />
                <input type="text" placeholder="NIT / Registro Fiscal" className="input-modern" {...register("NIT")} />
                <input type="text" placeholder="Dirección" className="input-modern" {...register("address")} />
              </>
            )}

            <div className="actions">
              <button type="submit" className="btn-primary" disabled={isSubmitting}>
                {isSubmitting ? "Registrando..." : "Registrarse"}
              </button>
            </div>
          </form>

          <p className="registro-login">
            ¿Ya tienes una cuenta? <a href="/login">Inicia Sesión</a>
          </p>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>¡Registro exitoso!</h2>
            <p>
              Hemos enviado un correo de verificación a: <strong>{registeredEmail}</strong>
            </p>
            <p>Introduce el código de verificación que recibiste:</p>
            <input
              type="text"
              placeholder="Código de verificación"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              className="input-modern"
            />
            <div className="actions">
              <button className="btn-primary" onClick={handleVerifyCode}>
                Verificar
              </button>
              <button className="btn-secondary" onClick={() => setShowModal(false)}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Registro;
