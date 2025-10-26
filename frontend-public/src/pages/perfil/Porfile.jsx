import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { FiEdit2, FiSave, FiLogOut, FiUser, FiMail, FiPhone, FiMapPin, FiCamera, FiCheck, FiX } from "react-icons/fi";
import "./profile.css";

const Perfil = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
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

  useEffect(() => { checkSession(); }, []);

  // Manejo de inputs
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Subida de imagen
  const handleImageUpload = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  if (file.size > 5 * 1024 * 1024) {
    Swal.fire({ icon: "error", title: "Imagen muy grande", text: "El tamaño máximo es 5MB" });
    return;
  }

  const form = new FormData();
  form.append("file", file);
  form.append("upload_preset", "bluefruit"); // 👈 preset unsigned real
  form.append("resource_type", "image");

  try {
    setUploadingImage(true);
    const res = await fetch("https://api.cloudinary.com/v1_1/dpjgktym3/image/upload", {
      method: "POST",
      body: form,
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("Error Cloudinary:", data);
      throw new Error(data.error?.message || "Error al subir imagen");
    }

    setFormData((prev) => ({ ...prev, avatar: data.secure_url }));

    Swal.fire({
      icon: "success",
      title: "¡Imagen actualizada!",
      timer: 1500,
      showConfirmButton: false,
    });
  } catch (error) {
    console.error(error);
    Swal.fire({ icon: "error", title: "Error al subir imagen" });
  } finally {
    setUploadingImage(false);
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
        text: "Tus cambios se guardaron correctamente",
        timer: 2000, 
        showConfirmButton: false 
      });
    } catch (error) {
      Swal.fire({ icon: "error", title: "Error", text: error.message });
    }
  };

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
      Swal.fire({ 
        icon: "success", 
        title: "Sesión cerrada", 
        timer: 1500, 
        showConfirmButton: false 
      });
      setUserData(null);
      navigate("/");
    } catch (error) {
      console.error(error);
      navigate("/");
    }
  };

  if (loading) return (
    <div className="perfil-loading">
      <div className="spinner"></div>
      <p>Cargando perfil...</p>
    </div>
  );

  if (!userData) return null;

  return (
    <div className="perfil-page">
      <div className="perfil-container">
        {/* Header con avatar */}
        <div className="perfil-header">
          <div className="avatar-section">
            <div className="avatar-wrapper">
              <div className="avatar">
                {uploadingImage ? (
                  <div className="avatar-loading">
                    <div className="spinner-small"></div>
                  </div>
                ) : formData.avatar ? (
                  <img src={formData.avatar} alt="Avatar" />
                ) : (
                  <FiUser size={60} color="#1b1b3c"/>
                )}
              </div>
              {editing && (
                <label className="avatar-upload-btn">
                  <FiCamera size={18} />
                  <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploadingImage} />
                </label>
              )}
            </div>
            <div className="header-info">
              <h1>{formData.name || "Usuario"}</h1>
              <p className="user-email">{formData.email}</p>
              <span className="role-badge">
                {userData.role === "admin" ? "👑 Administrador" : "👤 Cliente"}
              </span>
            </div>
          </div>
        </div>

        {/* Card de información */}
        <div className="perfil-card">
          {/* Header del card */}
          <div className="card-header">
            <h2>Información Personal</h2>
            {!editing ? (
              <button className="btn-edit" onClick={() => setEditing(true)}>
                <FiEdit2 /> Editar perfil
              </button>
            ) : (
              <div className="edit-actions">
                <button className="btn-cancel" onClick={handleCancel}>
                  <FiX /> Cancelar
                </button>
                <button className="btn-save" onClick={handleSaveProfile}>
                  <FiCheck /> Guardar
                </button>
              </div>
            )}
          </div>

          {/* Formulario */}
          <div className="perfil-form">
            <div className="form-group">
              <label>
                <FiUser className="label-icon" />
                Nombre completo
              </label>
              <input 
                type="text" 
                name="name" 
                value={formData.name} 
                disabled={!editing} 
                onChange={handleInputChange}
                placeholder="Ingresa tu nombre"
              />
            </div>

            <div className="form-group">
              <label>
                <FiMail className="label-icon" />
                Correo electrónico
              </label>
              <input 
                type="email" 
                value={formData.email} 
                disabled
                className="input-disabled"
              />
              <small className="input-hint">El correo no puede ser modificado</small>
            </div>

            <div className="form-group">
              <label>
                <FiPhone className="label-icon" />
                Teléfono
              </label>
              <input 
                type="tel" 
                name="phone" 
                value={formData.phone} 
                disabled={!editing} 
                onChange={handleInputChange}
                placeholder="Ej: 7890-1234"
              />
            </div>

            <div className="form-group">
              <label>
                <FiMapPin className="label-icon" />
                Dirección
              </label>
              <input 
                type="text" 
                name="address" 
                value={formData.address} 
                disabled={!editing} 
                onChange={handleInputChange}
                placeholder="Calle, colonia, ciudad"
              />
            </div>
          </div>
        </div>

        {/* Zona de seguridad */}
        <div className="danger-zone">
          <div className="danger-content">
            <div className="danger-info">
              <h3>Cerrar sesión</h3>
              <p>Salir de tu cuenta en este dispositivo</p>
            </div>
            <button className="btn-logout" onClick={handleLogout}>
              <FiLogOut /> Cerrar sesión
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Perfil;