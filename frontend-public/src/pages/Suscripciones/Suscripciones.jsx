import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Suscripciones.css';

const Beneficios = () => {
  const navigate = useNavigate();

  // 🔹 Redirige a la pantalla de pago
  const handleComprar = () => {
    navigate('/pay');
  };

  return (
    <div className="beneficios-page">
      <main className="beneficios-main">
        <div className="beneficios-container">
          <div className="beneficios-card">
            <div className="beneficios-content">
              <div className="beneficios-info">
                <h1 className="beneficios-title">Beneficios</h1>

                <div className="beneficios-list">
                  <div className="beneficio-item">
                    <span className="beneficio-bullet">○</span>
                    <div className="beneficio-text">
                      <strong>Descuentos exclusivos</strong>
                      <br />
                      Ofertas especiales solo para miembros.
                    </div>
                  </div>

                  <div className="beneficio-item">
                    <span className="beneficio-bullet">○</span>
                    <div className="beneficio-text">
                      <strong>Promociones anticipadas</strong>
                      <br />
                      Acceso anticipado a lanzamientos.
                    </div>
                  </div>

                  <div className="beneficio-item">
                    <span className="beneficio-bullet">○</span>
                    <div className="beneficio-text">
                      <strong>Envío gratis</strong>
                      <br />
                      En compras en la tienda online.
                    </div>
                  </div>

                  <div className="beneficio-item">
                    <span className="beneficio-bullet">○</span>
                    <div className="beneficio-text">
                      <strong>Descuento especial en el mes de cumpleaños</strong>
                    </div>
                  </div>

                  <div className="beneficio-item">
                    <span className="beneficio-bullet">○</span>
                    <div className="beneficio-text">
                      <strong>Sistema de acumulación de puntos</strong>
                    </div>
                  </div>

                  <div className="beneficio-item">
                    <span className="beneficio-bullet">○</span>
                    <div className="beneficio-text">
                      <strong>Promocionales (camisas, gorras, etc) por acumulación de puntos</strong>
                    </div>
                  </div>
                </div>
              </div>

              <div className="beneficios-product">
                <div className="product-image">
                  <img src="./public/guineyo.png" alt="Reppo Banano" />
                </div>
                <div className="product-price">$19.99</div>
              </div>
            </div>

            <div className="beneficios-footer">
              <button className="comprar-button" onClick={handleComprar}>
                Comprar
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Beneficios;
