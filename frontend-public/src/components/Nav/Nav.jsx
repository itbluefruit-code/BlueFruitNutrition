// src/components/Nav/Nav.jsx
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { FiShoppingCart, FiUser } from "react-icons/fi";
import { useAuthContext } from "../../context/useAuth";
import "./Nav.css";

const Nav = () => {
  const { isAuthenticated, user } = useAuthContext();
  const location = useLocation();

  // Verificar si el usuario es distribuidor
  const isDistribuidor = user?.role === "distributor";

  return (
    <nav className="inwood-navbar">
      <div className="inwood-container">
        <div className="inwood-logo">
          <img src="/logoBlueFruitt.png" alt="Blue Fruit" />
        </div>

        {/* --- Menú central --- */}
        <ul className="inwood-menu">
          <li>
            <Link to="/" className={location.pathname === "/" ? "active" : ""}>
              Inicio
            </Link>
          </li>
          
          {/* Ocultar "Sobre Nosotros" para distribuidores */}
          {!isDistribuidor && (
            <li>
              <Link
                to="/sobre-nosotros"
                className={location.pathname === "/sobre-nosotros" ? "active" : ""}
              >
                Sobre Nosotros
              </Link>
            </li>
          )}

          <li>
            <Link
              to="/product"
              className={location.pathname === "/product" ? "active" : ""}
            >
              Productos
            </Link>
          </li>

          {isAuthenticated && (
            <li>
              <Link
                to="/carrito"
                className={location.pathname === "/carrito" ? "active" : ""}
              >
                Carrito
              </Link>
            </li>
          )}

          {/* 
          Suscripciones - comentado para todos los roles
          <li>
            <Link
              to="/suscripciones"
              className={location.pathname === "/suscripciones" ? "active" : ""}
            >
              Suscripciones
            </Link>
          </li> 
          */}
        </ul>

        {/* --- Íconos derecha --- */}
        <div className="inwood-icons">
          {isAuthenticated && (
            <Link to="/carrito" className="icon-btn" aria-label="Carrito">
              <FiShoppingCart size={24} />
            </Link>
          )}

          {isAuthenticated ? (
            <Link to="/perfil" className="icon-btn" aria-label="Perfil">
              <FiUser size={24} />
            </Link>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn-login">
                Iniciar Sesión
              </Link>
              <Link to="/registro" className="btn-register">
                Regístrate
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Nav;