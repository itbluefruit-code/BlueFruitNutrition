import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { LogOut, Menu, X } from 'lucide-react';
import { useAuthContext } from '../../context/useAuth'; 
import toast from 'react-hot-toast';
import './Nav.css';
 
export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const { logout, API_URL } = useAuthContext();

  const handleLogout = async () => {
    try {
      const res = await fetch(`${API_URL}/logout`, {
        method: 'POST',
        credentials: 'include',
      });

      if (res.ok) {
        await logout(); // limpia estado en React
        toast.success('Sesión cerrada correctamente');
        window.location.href = "https://blue-fruit-nutrition-alpha.vercel.app"; 
      } else {
        const data = await res.json();
        toast.error(data.message || 'Error al cerrar sesión');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error al cerrar sesión');
    }
  };
 
  return (
    <>
      <button className="hamburger-btn" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <X size={28} /> : <Menu size={28} />}
      </button>
 
      <nav className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <img src="/Logo_Blue_Fruit.png" alt="Logo Blue Fruit" />
        </div>
 
        <ul className="sidebar-menu">
          <li><Link to="/homep">Inicio</Link></li>
          <li><Link to="/productos1">Productos</Link></li>
          <li><Link to="/ordenes">Órdenes</Link></li>
          <li><Link to="/ventas">Ventas</Link></li>
          {/* <li><Link to="/suscripciones">Suscripciones</Link></li> */}
          <li><Link to="/usuarios">Usuarios</Link></li>
          <li><Link to="/location">Mapa</Link></li>
        </ul>
 
        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <LogOut size={20} color="white" style={{ marginRight: 6, verticalAlign: 'middle' }} />
            Cerrar Sesión
          </button>
        </div>
      </nav>
 
      {isOpen && <div className="sidebar-overlay" onClick={() => setIsOpen(false)} />}
    </>
  );
}
