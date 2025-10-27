import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { FiLogOut, FiUser, FiMail, FiPhone, FiMapPin, FiCamera } from "react-icons/fi";
import "./profile.css";

const Perfil = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [avatar, setAvatar] = useState("");

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
      console.log("Datos de sesión recibidos:", data);
      setUserData(data);
      setAvatar(data.avatar || "");
    } catch (error) {
      console.error(error);
      navigate("/login");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { checkSession(); }, []);

  // Sincronizar avatar cuando userData cambia
  useEffect(() => {
    if (userData?.avatar) {
      setAvatar(userData.avatar);
    }
  }, [userData]);

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
    form.append("upload_preset", "bluefruit");
    form.append("resource_type", "image");

    try {
      setUploadingImage(true);
      
      // Subir a Cloudinary
      const res = await fetch("https://api.cloudinary.com/v1_1/dpjgktym3/image/upload", {
        method: "POST",
        body: form,
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("Error Cloudinary:", data);
        throw new Error(data.error?.message || "Error al subir imagen");
      }

      const newAvatar = data.secure_url;
      console.log("Avatar subido a Cloudinary:", newAvatar);
      
      // Actualizar estado local temporalmente
      setAvatar(newAvatar);

      // Guardar en la base de datos
      await saveAvatar(newAvatar);

      Swal.fire({
        icon: "success",
        title: "¡Foto de perfil actualizada!",
        text: "Tu foto se ha guardado correctamente",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Error completo:", error);
      Swal.fire({ 
        icon: "error", 
        title: "Error al subir imagen",
        text: error.message || "Hubo un problema al guardar tu foto"
      });
      // Revertir al avatar anterior si falla
      setAvatar(userData.avatar || "");
    } finally {
      setUploadingImage(false);
    }
  };

  // Guardar avatar en la base de datos
  const saveAvatar = async (avatarUrl) => {
    try {
      const isDistributor = userData.role === "distributor" || userData.companyName;
      const endpoint = isDistributor
        ? `${API_URL}/distributors/${userData._id}` 
        : `${API_URL}/customers/${userData._id}`;

      const updateData = { avatar: avatarUrl };

      console.log("Guardando avatar:", { endpoint, avatarUrl });

      const res = await fetch(endpoint, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(updateData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error("Error del servidor:", errorData);
        console.error("Status:", res.status);
        console.error("Endpoint usado:", endpoint);
        console.error("ID del usuario:", userData._id);
        throw new Error(errorData.message || "Error al guardar avatar");
      }

      const updatedUser = await res.json();
      console.log("Usuario actualizado:", updatedUser);

      // Actualizar userData y avatar con los datos actualizados del servidor
      setUserData({
        ...userData,
        avatar: updatedUser.avatar || avatarUrl,
      });
      setAvatar(updatedUser.avatar || avatarUrl);

    } catch (error) {
      console.error("Error guardando avatar:", error);
      throw error; // Re-lanzar el error para manejarlo en handleImageUpload
    }
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
                ) : avatar ? (
                  <img src={avatar} alt="Avatar" />
                ) : (
                  <FiUser size={60} color="#1b1b3c"/>
                )}
              </div>
              <label className="avatar-upload-btn">
                <FiCamera size={18} />
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageUpload} 
                  disabled={uploadingImage} 
                />
              </label>
            </div>
            <div className="header-info">
              <h1>{userData.name || userData.companyName || "Usuario"}</h1>
              <p className="user-email">{userData.email}</p>
              <span className="role-badge">
                {userData.role === "admin" ? "👑 Administrador" : userData.companyName ? "🏢 Distribuidor" : "👤 Cliente"}
              </span>
            </div>
          </div>
        </div>

        {/* Card de información */}
        <div className="perfil-card">
          <div className="card-header">
            <h2>Información Personal</h2>
          </div>

          {/* Información de solo lectura */}
          <div className="perfil-info">
            <div className="info-item">
              <div className="info-label">
                <FiUser className="label-icon" />
                <span>{userData.companyName ? "Nombre de la empresa" : "Nombre completo"}</span>
              </div>
              <div className="info-value">
                {userData.name || userData.companyName || "No especificado"}
                {userData.lastName && ` ${userData.lastName}`}
              </div>
            </div>

            <div className="info-item">
              <div className="info-label">
                <FiMail className="label-icon" />
                <span>Correo electrónico</span>
              </div>
              <div className="info-value">{userData.email}</div>
            </div>

            <div className="info-item">
              <div className="info-label">
                <FiPhone className="label-icon" />
                <span>Teléfono</span>
              </div>
              <div className="info-value">{userData.phone || "No especificado"}</div>
            </div>

            <div className="info-item">
              <div className="info-label">
                <FiMapPin className="label-icon" />
                <span>Dirección</span>
              </div>
              <div className="info-value">{userData.address || "No especificado"}</div>
            </div>

            {/* Información adicional para clientes */}
            {!userData.companyName && (
              <>
                {userData.weight && (
                  <div className="info-item">
                    <div className="info-label">
                      <span>⚖️</span>
                      <span>Peso</span>
                    </div>
                    <div className="info-value">{userData.weight} kg</div>
                  </div>
                )}

                {userData.height && (
                  <div className="info-item">
                    <div className="info-label">
                      <span>📏</span>
                      <span>Altura</span>
                    </div>
                    <div className="info-value">{userData.height} cm</div>
                  </div>
                )}

                {userData.gender && (
                  <div className="info-item">
                    <div className="info-label">
                      <span>👤</span>
                      <span>Género</span>
                    </div>
                    <div className="info-value">{userData.gender}</div>
                  </div>
                )}
              </>
            )}

            {/* Información adicional para distribuidores */}
            {userData.companyName && userData.NIT && (
              <div className="info-item">
                <div className="info-label">
                  <span>🏢</span>
                  <span>NIT</span>
                </div>
                <div className="info-value">{userData.NIT}</div>
              </div>
            )}
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