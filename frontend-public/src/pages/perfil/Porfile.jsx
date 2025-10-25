import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import {
  FiEdit,
  FiSave,
  FiLogOut,
  FiUser,
  FiMail,
  FiPhone,
  FiPackage,
  FiHome,
} from "react-icons/fi";
import "./Portfile.css";

const Perfil = () => {
  const [userData, setUserData] = useState(null);
  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const navigate = useNavigate();

  // Backend corre en puerto 4000
  const API_URL = "https://bluefruitnutrition-production.up.railway.app/api";

  // Verifica sesión activa
const checkSession = async () => {
  try {
    const res = await fetch(`${API_URL}/session/auth/session`, {
      method: "GET",
      credentials: "include",
    });
    if (!res.ok) throw new Error("Sesión inválida");
    const data = await res.json();
    console.log("📋 Datos del backend:", data);
      console.log("🆔 ID:", data.id);
      console.log("👤 Nombre:", data.name);
      
      setUserData(data);
      setFormData({
        name: data.name || "",
        email: data.email || "",
        phone: data.phone || "",
        address: data.address || "",
      });
      
      // Solo cargar órdenes y direcciones si no es admin
      if (data.role !== "admin") {
        fetchOrders(data.id);
        fetchAddresses(data.id);
      }
    } catch (error) {
      console.error("Error en sesión:", error);
      navigate("/login");
    } finally {
      setLoading(false);
    }
  };

  // Trae historial de órdenes
  const fetchOrders = async (userId) => {
    if (!userId) {
      setOrders([]);
      return;
    }
    
    try {
      const res = await fetch(`${API_URL}/ordenes/user/${userId}`, {
        credentials: "include",
      });
      if (!res.ok) {
        if (res.status === 404) {
          setOrders([]);
          return;
        }
        throw new Error("No se pudo cargar historial");
      }
      const data = await res.json();
      setOrders(data);
    } catch (error) {
      console.error("Error cargando órdenes:", error);
      setOrders([]);
    }
  };

  // Trae direcciones guardadas
  const fetchAddresses = async (userId) => {
    if (!userId) {
      setAddresses([]);
      return;
    }
    
    try {
      const res = await fetch(`${API_URL}/direcciones/user/${userId}`, {
        credentials: "include",
      });
      if (!res.ok) {
        if (res.status === 404) {
          setAddresses([]);
          return;
        }
        throw new Error("No se pudieron cargar direcciones");
      }
      const data = await res.json();
      setAddresses(data);
    } catch (error) {
      console.error("Error cargando direcciones:", error);
      setAddresses([]);
    }
  };

  // Guardar perfil editado
  const handleSaveProfile = async () => {
    const confirm = await Swal.fire({
      title: "¿Guardar cambios?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí",
      cancelButtonText: "Cancelar",
    });
    if (!confirm.isConfirmed) return;

    try {
      const res = await fetch(`${API_URL}/users/${userData.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error("Error al actualizar perfil");
      const updated = await res.json();
      setUserData(updated);
      setEditing(false);
      Swal.fire({ icon: "success", title: "Perfil actualizado", timer: 1500 });
    } catch (error) {
      Swal.fire({ icon: "error", title: error.message });
    }
  };

  // Logout
  const handleLogout = async () => {
    const confirm = await Swal.fire({
      title: "¿Cerrar sesión?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, salir",
      cancelButtonText: "Cancelar",
    });
    if (!confirm.isConfirmed) return;

    try {
      const res = await fetch(`${API_URL}/logout`, {
  method: "POST",
  credentials: "include",
});
      
      // Limpiar estado local
      setUserData(null);
      setOrders([]);
      setAddresses([]);
      setFormData({});
      
      if (res.ok) {
        await Swal.fire({ 
          icon: "success", 
          title: "Sesión cerrada", 
          timer: 1500,
          showConfirmButton: false 
        });
      }
      
      navigate("/");
    } catch (error) {
      console.error("Error en logout:", error);
      navigate("/");
    }
  };

  const handleInputChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  useEffect(() => {
    checkSession();
  }, []);

  if (loading) return <p className="loading">Cargando perfil...</p>;
  if (!userData) return null;

  return (
    <div className="perfil-page">
      <div className="perfil-left">
        <div className="perfil-card">
          <h2>
            <FiUser /> Mi Perfil
          </h2>
          <div className="perfil-fields">
            <label>
              <FiUser /> Nombre
            </label>
            <input
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              disabled={!editing}
            />

            <label>
              <FiMail /> Email
            </label>
            <input name="email" value={formData.email} disabled />

            <label>
              <FiPhone /> Teléfono
            </label>
            <input
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              disabled={!editing}
            />
          </div>

          <div className="perfil-actions">
            {editing ? (
              <button className="btn-save" onClick={handleSaveProfile}>
                <FiSave /> Guardar
              </button>
            ) : (
              <button className="btn-edit" onClick={() => setEditing(true)}>
                <FiEdit /> Editar
              </button>
            )}
            <button className="btn-logout" onClick={handleLogout}>
              <FiLogOut /> Cerrar sesión
            </button>
          </div>
        </div>

        {userData.role !== "customer" && (
          <div className="perfil-card">
            <h2>
              <FiHome /> Mis Direcciones
            </h2>
            {addresses.length === 0 ? (
              <p className="empty-orders">No tienes direcciones guardadas aún</p>
            ) : (
              addresses.map((dir) => (
                <div key={dir._id} className="address-item">
                  <div>
                    <strong>{dir.alias || "Dirección guardada"}</strong>
                    <p>{dir.direccionCompleta}</p>
                    <small>
                      {dir.departamento}, {dir.municipio}
                    </small>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      <div className="perfil-right">
        {userData.role !== "customer" && (
          <div className="orders-card">
            <h2>
              <FiPackage /> Historial de Órdenes
            </h2>
            {orders.length === 0 ? (
              <p className="empty-orders">No hay órdenes aún</p>
            ) : (
              orders.map((order) => (
                <div key={order._id} className="order-item">
                  <div>
                    <strong>Orden #{order._id.slice(-6)}</strong>
                    <p>{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="order-info">
                    <span>Total: ${order.total.toFixed(2)}</span>
                    <span
                      className={`order-status ${order.status.toLowerCase()}`}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Perfil;