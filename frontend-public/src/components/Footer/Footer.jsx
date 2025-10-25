import React from "react";
import { Link } from "react-router-dom";
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="blue-fruit-footer">
      <div className="blue-fruit-footer-top">
        <div className="blue-fruit-footer-section blue-fruit-logo-section">
          <img src="/Logo_Blue_Fruit.png" alt="Logo Blue Fruit" className="blue-fruit-footer-logo" />
        </div>

        <div className="blue-fruit-footer-section">
          <h4>Soporte</h4>
          <p>info@bluefruitnutrition.com</p>
          <p>+503 6859 7103</p>
        </div>

        <div className="blue-fruit-footer-section">
          <h4>Cuenta</h4>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            <li>
              <Link to="/login" style={{ color: "white", textDecoration: "none" }}>
                <u>Iniciar sesión</u>
              </Link>
            </li>
            <li>
              <Link to="/registro" style={{ color: "white", textDecoration: "none" }}>
                <u>Registrarse</u>
              </Link>
            </li>
          </ul>
        </div>

        <div className="blue-fruit-footer-section">
          <h4>Enlaces rápidos</h4>
          <p>
            <Link to="/contact" style={{ color: "white", textDecoration: "none" }}>Contacto</Link>
          </p>
        </div>

        {/* Sección separada para términos y privacidad */}
        <div className="blue-fruit-footer-section">
          <p>
            <Link to="/terminos" style={{ color: "white", textDecoration: "none" }}>
              Términos y Condiciones
            </Link>
          </p>
          <p>
            <Link to="/privacidad" style={{ color: "white", textDecoration: "none" }}>
              Políticas de Privacidad
            </Link>
          </p>
        </div>
      </div>

      <div className="blue-fruit-footer-bottom">
        <p>© Copyright 2025 – <strong>BLUE FRUIT NUTRITION®</strong> Alimentos Funcionales para Deportistas</p>
      </div>
    </footer>
  );
};

export default Footer;
