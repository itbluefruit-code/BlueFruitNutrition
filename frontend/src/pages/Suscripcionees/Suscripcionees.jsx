import React, { useEffect, useState } from "react";
import './Suscripcionees.css';

const Suscripciones = () => {
  const [suscripciones, setSuscripciones] = useState([]);

  useEffect(() => {
    const fetchSuscripciones = async () => {
      try {
        const res = await fetch("https://bluefruitnutrition-production.up.railway.app/api/subscriptions");
        const data = await res.json();
        setSuscripciones(data);
      } catch (error) {
        console.error("Error al obtener suscripciones:", error);
      }
    };

    fetchSuscripciones();

    // 🔹 Verificar si hay una nueva suscripción en localStorage
    const nuevaSuscripcion = JSON.parse(localStorage.getItem("nuevaSuscripcion"));
    if (nuevaSuscripcion) {
      setSuscripciones(prev => [nuevaSuscripcion, ...prev]);
      localStorage.removeItem("nuevaSuscripcion");
    }
  }, []);

  const handleEditar = (suscripcion) => {
    alert(`Editar suscripción de: ${suscripcion.usuario}`);
  };

  return (
    <div className="suscripciones-container">
      <h2>SUSCRIPCIONES</h2>
      <table className="suscripciones-tabla">
        <thead>
          <tr>
            <th>#</th>
            <th>Fecha de inicio</th>
            <th>Usuario</th>
            <th>Precio</th>
            <th>Plan de suscripción</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {suscripciones.map((s, i) => (
            <tr key={s._id || i}>
              <td>{i + 1}</td>
              <td>{s.fecha}</td>
              <td>{s.usuario}</td>
              <td>{s.precio}</td>
              <td>{s.plan}</td>
              <td>{s.estado}</td>
              <td>
                <button className="btn-editar" onClick={() => handleEditar(s)}>
                  Editar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Suscripciones;
