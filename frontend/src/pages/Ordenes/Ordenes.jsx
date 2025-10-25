import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Ordenes.css';

const Ordenes = () => {
  const [ordenes, setOrdenes] = useState([]);
  const [filtro, setFiltro] = useState("todas");
  const navigate = useNavigate();

  const fetchOrdenes = async () => {
    try {
      const res = await axios.get('https://bluefruitnutrition-production.up.railway.app/api/ordenes');
      setOrdenes(res.data);
    } catch (error) {
      console.error('Error al cargar órdenes:', error);
    }
  };

  useEffect(() => {
    fetchOrdenes();
  }, []);

  // Filtrado dinámico por estado
  const ordenesFiltradas =
    filtro === "todas"
      ? ordenes
      : ordenes.filter(
          (orden) =>
            orden.estado &&
            orden.estado.toLowerCase() === filtro.toLowerCase()
        );

  return (
    <div className="ordenes-container">
      <h2>ÓRDENES</h2>

      {/* Filtro */}
      <div className="filtro-container">
        <label htmlFor="filtro">Filtrar por estado:</label>
        <select
          id="filtro"
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          className="filtro-select"
        >
          <option value="todas">Todas</option>
          <option value="completada">Completadas</option>
          <option value="en proceso">En proceso</option>
          <option value="pendiente">Pendientes</option>
          <option value="cancelada">Canceladas</option>
        </select>
      </div>

      <table className="ordenes-tabla">
        <thead>
          <tr>
            <th>Orden</th>
            <th>Fecha</th>
            <th>Total</th>
            <th>Items</th>
            <th>Estado</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {ordenesFiltradas.length > 0 ? (
            ordenesFiltradas.map((orden, index) => (
              <tr key={orden._id || index}>
                <td>#{index + 1}</td>
                <td>
                  {new Date(orden.fecha).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                  })}
                </td>
                <td>${orden.total.toFixed(2)}</td>
                <td>{Array.isArray(orden.items) ? orden.items.length : orden.items || 0}</td>
                <td>{orden.estado}</td>
                <td>
                  <button
                    className="btn-accion"
                    onClick={() => navigate(`/ordenes/${orden._id}`)}
                  >
                    Resumen de Orden
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" style={{ textAlign: "center", color: "#888" }}>
                No hay órdenes con ese estado
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Ordenes;
