import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import {
  FiEdit2,
  FiSave,
  FiLogOut,
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiCamera,
} from "react-icons/fi";
import "./Portfile.css";

const Perfil = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    avatar: "",
  });

  const navigate = useNavigate();
  const API_URL = "https://bluefruitnutrition-production.up.railway.app/api";

  // Obtener sesión
  const checkSession = async () => {
    try {
      const res = await fetch(`${API_URL}/session/auth/session`, {
        method: "GET",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Sesión inválida");
      const data = await res.json();

      setUserData(data);
      setFormData({
        name: data.name || "",
        email: data.email || "",
        phone: data.phone || "",
        address: data.address || "",
        avatar: data.avatar || "",
      });
    } catch (error) {
      console.error(error);
      navigate("/login");
    } finally {
      setLoading(false);
    }
  };

  // Cambios de inputs
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Subir imagen
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const form = new FormData();
    form.append("file", file);
    form.append("upload_preset", "YOUR_CLOUDINARY_PRESET"); // Cambiar por tu preset

    try {
      const res = await fetch(
        "https://api.cloudinary.com/v1_1/YOUR_CLOUDINARY_NAME/image/upload",
        { method: "POST", body: form }
      );
      const data = await res.json();
      setFormData((prev) => ({ ...prev, avatar: data.secure_url }));
      Swal.fire({
        icon: "success",
        title: "Imagen subida",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error(error);
      Swal.fire({ icon: "error", title: "Error al subir imagen" });
    }
  };

  // Guardar perfil
  const handleSaveProfile = async () => {
    const confirm = await Swal.fire({
      title: "¿Guardar cambios?",
      text: "Se actualizará tu información de perfil",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, guardar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#1b1b3c",
      cancelButtonColor: "#6b7280",
    });

    if (!confirm.isConfirmed) return;

    try {
      const res = await fetch(`${API_URL}/users/${userData.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Error al actualizar perfil");
      }

      const updated = await res.json();
      setUserData(updated);
      setEditing(false);

      Swal.fire({
        icon: "success",
        title: "¡Perfil actualizado!",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire({ icon: "error", title: "Error", text: error.message });
    }
  };

  // Cancelar edición
  const handleCancel = () => {
    setFormData({
      name: userData.name || "",
      email: userData.email || "",
      phone: userData.phone || "",
      address: userData.address || "",
      avatar: userData.avatar || "",
    });
    setEditing(false);
  };

  // Logout
  const handleLogout = async () => {
    const confirm = await Swal.fire({
      title: "¿Cerrar sesión?",
      text: "Tendrás que iniciar sesión nuevamente",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, salir",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#1b1b3c",
      cancelButtonColor: "#6b7280",
    });
    if (!confirm.isConfirmed) return;

    try {
      await fetch(`${API_URL}/logout`, { method: "POST", credentials: "include" });
      setUserData(null);
      navigate("/");
    } catch (error) {
      console.error(error);
      navigate("/");
    }
  };

  useEffect(() => {
    checkSession();
  }, []);

  if (loading) {
    return (
      <div className="perfil-loading">
        <div className="spinner"></div>
        <p>Cargando perfil...</p>
      </div>
    );
  }

  if (!userData) return null;

  return (
    <div className="perfil-container">
      <div className="perfil-wrapper">
        {/* Header */}
        <div className="perfil-header">
          <div className="perfil-header-content">
            <div className="perfil-avatar-section">
              <div className="perfil-avatar">
                {formData.avatar ? (
                  <img
                    src={formData.avatar}
                    alt="Avatar"
                    style={{ width: "100%", height: "100%", borderRadius: "50%" }}
                  />
                ) : (
                  <FiUser size={48} color="#fff" />
                )}
              </div>
              {editing && (
                <label className="avatar-upload-btn">
                  <FiCamera />
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={handleImageUpload}
                  />
                </label>
              )}
            </div>
            <h1>{formData.name || "Usuario"}</h1>
            <p className="perfil-email">{formData.email}</p>
            <span className="perfil-badge">
              {userData.role === "admin" ? "Administrador" : "Cliente"}
            </span>
          </div>
        </div>

        {/* Formulario */}
        <div className="perfil-section-header">
  <h2>Información Personal</h2>
  {!editing ? (
    <button className="btn-edit-header" onClick={() => setEditing(true)}>
      <FiEdit2 size={16}/> Editar perfil
    </button>
  ) : (
    <div className="edit-actions-header">
      <button className="btn-cancel" onClick={handleCancel}>Cancelar</button>
      <button className="btn-save-header" onClick={handleSaveProfile}>
        <FiSave size={16}/> Guardar
      </button>
    </div>
  )}
</div>
        <div className="perfil-section-content">
          <div className="perfil-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">
                  <FiUser className="input-icon" /> Nombre completo
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleInputChange}
                  disabled={!editing}
                />
              </div>
              <div className="form-group">
                <label htmlFor="email">
                  <FiMail className="input-icon" /> Correo electrónico
                </label>
                <input id="email" name="email" type="email" value={formData.email} disabled />
                <small className="input-hint">No se puede modificar el correo</small>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="phone">
                  <FiPhone className="input-icon" /> Teléfono
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleInputChange}
                  disabled={!editing}
                />
              </div>
              <div className="form-group">
                <label htmlFor="address">
                  <FiMapPin className="input-icon" /> Dirección
                </label>
                <input
                  id="address"
                  name="address"
                  type="text"
                  value={formData.address}
                  onChange={handleInputChange}
                  disabled={!editing}
                />
              </div>
            </div>
          </div>

          <div className="perfil-section-divider"></div>

          {/* Zona de logout */}
          <div className="perfil-danger-zone">
            <h3>Zona de seguridad</h3>
            <p>Administra tu sesión y acceso a la plataforma</p>
            <button className="btn-logout-danger" onClick={handleLogout}>
              <FiLogOut /> Cerrar sesión
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Perfil;
