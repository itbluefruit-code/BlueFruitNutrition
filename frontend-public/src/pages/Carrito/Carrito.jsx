import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import "./Carrito.css";

const Carrito = () => {
  const [productos, setProductos] = useState([]);
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();
  const API_URL = "https://bluefruitnutrition-production.up.railway.app/api";

  // Verificar sesión del usuario al cargar
  useEffect(() => {
    const verificarSesion = async () => {
      try {
        const res = await fetch(`${API_URL}/session/auth/session`, {
          method: "GET",
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          setUserData(data);
        }
      } catch (error) {
        console.error("Error verificando sesión:", error);
      }
    };

    verificarSesion();
  }, []);

  useEffect(() => {
    const carritoGuardado = JSON.parse(localStorage.getItem("carrito")) || [];
    setProductos(carritoGuardado);
  }, []);

  const actualizarCantidad = (id, nuevaCantidad) => {
    const actualizados = productos.map((producto) =>
      producto.id === id
        ? { ...producto, cantidad: parseInt(nuevaCantidad) || 1 }
        : producto
    );
    setProductos(actualizados);
    localStorage.setItem("carrito", JSON.stringify(actualizados));
  };

  const eliminarProducto = (id) => {
    const actualizados = productos.filter((producto) => producto.id !== id);
    setProductos(actualizados);
    localStorage.setItem("carrito", JSON.stringify(actualizados));
  };

  const calcularSubtotal = (producto) =>
    (producto.precio * producto.cantidad).toFixed(2);

  const total = productos
    .reduce((acc, p) => acc + p.precio * p.cantidad, 0)
    .toFixed(2);

  const irAMetodoDePago = async () => {
    // Verificar si el usuario está logueado
    if (!userData || !userData.id) {
      await Swal.fire({
        icon: "warning",
        title: "Inicia sesión",
        text: "Debes iniciar sesión para realizar una compra",
        confirmButtonText: "Ir a login",
        confirmButtonColor: "#0c133f",
      });
      navigate("/login");
      return;
    }

    const orden = {
      userId: userData.id, // ✅ IMPORTANTE: Asociar la orden al usuario
      numeroOrden: `ORD-${Date.now()}`,
      fecha: new Date().toLocaleDateString(),
      total: parseFloat(total),
      items: productos.reduce((acc, p) => acc + p.cantidad, 0),
      status: "Pendiente", // Cambié "estado" a "status" para consistencia
      productos: productos.map((p) => ({
        id: p.id.toString(),
        nombre: p.nombre,
        precio: p.precio,
        cantidad: p.cantidad,
      })),
    };

    try {
      const response = await fetch(`${API_URL}/ordenes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // ✅ Incluir cookies de sesión
        body: JSON.stringify(orden),
      });

      if (response.ok) {
        const ordenCreada = await response.json();
        
        await Swal.fire({
          icon: "success",
          title: "¡Orden creada!",
          text: `Orden #${ordenCreada._id.slice(-6)} registrada correctamente`,
          confirmButtonText: "Continuar al pago",
          confirmButtonColor: "#4CAF50",
          timer: 3000,
          timerProgressBar: true,
        });

        // Guardar datos para el proceso de pago
        const datosCompra = {
          ordenId: ordenCreada._id, // ✅ ID de la orden creada
          orden: ordenCreada,
          productos,
          total: parseFloat(total),
          fecha: new Date().toISOString(),
        };
        localStorage.setItem("datosCompra", JSON.stringify(datosCompra));
        
        // Navegar a método de pago
        navigate("/metodo");
      } else {
        const error = await response.json();
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error.message || "No se pudo crear la orden. Intenta nuevamente.",
          confirmButtonText: "Entendido",
          confirmButtonColor: "#f44336",
        });
      }
    } catch (error) {
      console.error("Error al enviar la orden:", error);
      Swal.fire({
        icon: "error",
        title: "Error de conexión",
        text: "Hubo un problema al conectar con el servidor.",
        confirmButtonText: "Entendido",
        confirmButtonColor: "#f44336",
      });
    }
  };

  return (
    <div className="carrito-container">
      <h1>Tu Carrito</h1>
      {userData && (
        <p style={{ textAlign: "center", color: "#666", marginBottom: "1rem" }}>
          Comprando como: <strong>{userData.name}</strong>
        </p>
      )}
      <div className="carrito">
        {productos.length === 0 ? (
          <div className="carrito-vacio">
            <div className="carrito-vacio-content">
              <svg
                className="carrito-vacio-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
              <h2>Tu carrito está vacío</h2>
              <p>¡Agrega productos para empezar tu compra!</p>
              <button
                className="btn-seguir-comprando"
                onClick={() => navigate("/product")}
              >
                Explorar Productos
              </button>
            </div>
          </div>
        ) : (
          <>
            <table>
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Precio</th>
                  <th>Cantidad</th>
                  <th>Subtotal</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {productos.map((producto) => (
                  <tr key={producto.id}>
                    <td className="producto-celda">
                      <img src={producto.imagen} alt={producto.nombre} />
                      <span>{producto.nombre}</span>
                    </td>
                    <td>${producto.precio.toFixed(2)}</td>
                    <td>
                      <input
                        type="number"
                        value={producto.cantidad}
                        min="1"
                        onChange={(e) =>
                          actualizarCantidad(producto.id, e.target.value)
                        }
                      />
                    </td>
                    <td>${calcularSubtotal(producto)}</td>
                    <td>
                      <button
                        onClick={() => eliminarProducto(producto.id)}
                        className="btn-eliminar"
                        aria-label="Eliminar producto"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={2}
                          stroke="currentColor"
                          width="24"
                          height="24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="resumen">
              <h2>Total del carrito</h2>
              <div className="linea">
                <span>Subtotal</span>
                <span>${total}</span>
              </div>
              <div className="linea total">
                <span>Total</span>
                <span>${total}</span>
              </div>
              <button className="checkout" onClick={irAMetodoDePago}>
                Check Out
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Carrito;