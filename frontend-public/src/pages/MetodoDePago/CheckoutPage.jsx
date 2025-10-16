import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../../context/useAuth";
import "./CheckoutPage.css";

// Objeto que contiene todos los departamentos y sus municipios
const departamentosMunicipios = {
  Ahuachapán: ["Ahuachapán", "Apaneca", "Atiquizaya", "Concepción de Ataco", "El Refugio", "Guaymango", "Jujutla", "San Francisco Menéndez", "San Lorenzo", "San Pedro Puxtla", "Tacuba", "Turín"],
  Cabañas: ["Cinquera", "Dolores", "Guacotecti", "Ilobasco", "Jutiapa", "San Isidro", "Sensuntepeque", "Tejutepeque", "Victoria"],
  // ... resto de departamentos
};

const AddressForm = () => {
  const { user, loading } = useAuthContext();
  const navigate = useNavigate();

  const [selectedDept, setSelectedDept] = useState("");
  const [selectedMunicipio, setSelectedMunicipio] = useState("");
  const [direccion, setDireccion] = useState("");
  const [referencia, setReferencia] = useState("");
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");

  const municipios = selectedDept ? departamentosMunicipios[selectedDept] || [] : [];

  useEffect(() => {
    const cargarDatosUsuario = async () => {
      if (user && user.id) {
        try {
          const tipoUsuario = user.role === 'customer' ? 'customers' : 'distributors';
          const response = await fetch(`https://bluefruitnutrition-production.up.railway.app/api/${tipoUsuario}/${user.id}`, {
            credentials: 'include'
          });

          if (response.ok) {
            const userData = await response.json();
            setNombre(userData.name || userData.companyName || '');
            setTelefono(userData.phone || '');
            setDireccion(userData.address || '');
          }
        } catch (error) {
          console.error('Error cargando datos del usuario:', error);
        }
      }
    };

    if (!loading && user) cargarDatosUsuario();
  }, [user, loading]);

  useEffect(() => {
    const datosGuardados = localStorage.getItem('datosEnvio');
    if (datosGuardados) {
      const datos = JSON.parse(datosGuardados);
      setSelectedDept(datos.departamento || '');
      setSelectedMunicipio(datos.municipio || '');
      setDireccion(datos.direccion || '');
      setReferencia(datos.referencia || '');
    }
  }, []);

  const handleBack = () => navigate("/carrito");

  const handleContinuar = () => {
    if (selectedDept && selectedMunicipio && direccion.trim() && nombre.trim()) {
      const datosEnvio = {
        nombre,
        telefono,
        departamento: selectedDept,
        municipio: selectedMunicipio,
        direccion,
        referencia,
        direccionCompleta: `${direccion}, ${selectedMunicipio}, ${selectedDept.replace(/([A-Z])/g, " $1").trim()}`,
        fechaRegistro: new Date().toISOString()
      };

      localStorage.setItem('datosEnvio', JSON.stringify(datosEnvio));

      const datosCompra = JSON.parse(localStorage.getItem('datosCompra') || '{}');
      const datosCompraActualizados = {
        ...datosCompra,
        datosEnvio
      };
      localStorage.setItem('datosCompra', JSON.stringify(datosCompraActualizados));

      navigate("/pay");
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="form-card">
          <p>Cargando datos del usuario...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <h2 className="title">Dirección de Envío</h2>
      
      <div className="user-info">
        <p><strong>Usuario:</strong> {user?.email}</p>
        <p><small>Los datos se llenarán automáticamente con tu información guardada</small></p>
      </div>

      <div className="form-card">
        <div className="flex-row">
          <div className="form-group flex-1">
            <label>Nombre completo*</label>
            <input
              type="text"
              placeholder="Nombre del destinatario"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="input"
            />
          </div>
          <div className="form-group flex-1">
            <label>Teléfono*</label>
            <input
              type="tel"
              placeholder="Ej: 7890-1234"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              className="input"
            />
          </div>
        </div>

        <div className="flex-row">
          <div className="form-group flex-1">
            <label>Departamento*</label>
            <select
              className="input"
              value={selectedDept}
              onChange={(e) => {
                setSelectedDept(e.target.value);
                setSelectedMunicipio("");
              }}
            >
              <option value="">Seleccione un departamento</option>
              {Object.keys(departamentosMunicipios).map((dept) => (
                <option key={dept} value={dept}>
                  {dept.replace(/([A-Z])/g, " $1").trim()}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group flex-1">
            <label>Municipio*</label>
            <select
              className="input"
              value={selectedMunicipio}
              onChange={(e) => setSelectedMunicipio(e.target.value)}
              disabled={!selectedDept}
            >
              <option value="">Seleccione un municipio</option>
              {municipios.map((muni) => (
                <option key={muni} value={muni}>{muni}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label>Dirección Completa*</label>
          <input
            type="text"
            placeholder="Ej: Calle los naranjos, casa #10"
            value={direccion}
            onChange={(e) => setDireccion(e.target.value)}
            className="input"
          />
        </div>

        <div className="form-group">
          <label>Puntos de referencia</label>
          <input
            type="text"
            placeholder="Ej: Frente a la tienda El Rosario"
            value={referencia}
            onChange={(e) => setReferencia(e.target.value)}
            className="input"
          />
        </div>

        <div className="button-row">
          <button onClick={handleBack} className="btn-outline">
            Regresar al Carrito
          </button>

          <button
            onClick={handleContinuar}
            disabled={!selectedDept || !selectedMunicipio || !direccion.trim() || !nombre.trim()}
            className={`btn-primary ${
              !selectedDept || !selectedMunicipio || !direccion.trim() || !nombre.trim() ? "disabled" : ""
            }`}
          >
            Continuar al Pago
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddressForm;
