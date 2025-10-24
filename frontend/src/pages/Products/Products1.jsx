import React, { useState, useEffect } from 'react';
import './Products1.css';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const API_URL = "https://bluefruitnutrition-production.up.railway.app/api/products";

function ProductCard({ product, onView, onDelete }) {
  // Función para procesar los sabores
  const getFlavorsArray = (flavor) => {
    if (!flavor) return [];
    
    // Si ya es un array
    if (Array.isArray(flavor)) {
      return flavor.filter(f => f && f.trim());
    }
    
    // Si es un string que parece JSON array
    if (typeof flavor === 'string') {
      // Intentar parsear si tiene formato de array
      if (flavor.startsWith('[') && flavor.endsWith(']')) {
        try {
          const parsed = JSON.parse(flavor);
          return Array.isArray(parsed) ? parsed.filter(f => f && f.trim()) : [flavor];
        } catch (e) {
          // Si falla, tratar como string normal
          return [flavor];
        }
      }
      
      // Si tiene comas, dividir
      if (flavor.includes(',')) {
        return flavor.split(',').map(f => f.trim()).filter(f => f);
      }
      
      // String simple
      return [flavor];
    }
    
    return [];
  };

  const flavorsArray = getFlavorsArray(product.flavor);

  return (
    <div className="product-card">
      <div className="product-image-container">
        <img
          src={product.image || "/producticon.png"}
          alt={product.name}
          className="product-image"
          onError={(e) => { e.target.src = "/producticon.png"; }}
        />
      </div>
      <h3 className="product-name">{product.name}</h3>
      <p className="product-description">{product.description}</p>
      
      {flavorsArray.length > 0 && (
        <div className="product-flavor">
          <strong>Sabores:</strong>
          <div className="flavor-tags">
            {flavorsArray.map((flavor, index) => (
              <span key={index} className="flavor-tag">
                {flavor}
              </span>
            ))}
          </div>
        </div>
      )}
      
      <p className="product-price"><strong>Precio:</strong> ${product.price}</p>
      <div className="product-buttons">
        <button 
          className="view-btn"
          onClick={() => onView(product)} 
        >
          Ver producto
        </button>
        <button 
          className="delete-btn"
          onClick={() => onDelete(product._id)}
        >
          Eliminar
        </button>
      </div>
    </div>
  );
}

function Product() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error('Error al cargar productos');
      const data = await response.json();
      setProducts(data);
    } catch (err) {
      setError(err.message);
      await Swal.fire({
        title: 'Error',
        text: `No se pudieron cargar los productos: ${err.message}`,
        icon: 'error',
        confirmButtonColor: '#0C133F'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción eliminará el producto permanentemente',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#0C133F',
      cancelButtonColor: '#DCDCDC',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true
    });

    if (!result.isConfirmed) return;

    try {
      const response = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
      if (response.ok) {
        await Swal.fire({
          title: '¡Eliminado!',
          text: 'Producto eliminado correctamente',
          icon: 'success',
          confirmButtonColor: '#0C133F',
          timer: 2000,
          timerProgressBar: true
        });
        await fetchProducts();
      } else {
        await Swal.fire({
          title: 'Error',
          text: 'No se pudo eliminar el producto',
          icon: 'error',
          confirmButtonColor: '#0C133F'
        });
      }
    } catch (err) {
      console.error("Error al eliminar:", err);
      await Swal.fire({
        title: 'Error',
        text: 'Ocurrió un error al eliminar el producto',
        icon: 'error',
        confirmButtonColor: '#0C133F'
      });
    }
  };

  const handleView = (product) => {
    navigate(`/product/${product._id}`); 
  };

  return (
    <div className="products-wrapper">
      <div className="products-container">
        <div className="products-header">
          <h2 className="products-title">Productos</h2>
          <button
            className="add-product-btn"
            onClick={() => navigate('/addProduct')}
          >
            Agregar Productos
          </button>
        </div>

        {loading ? (
          <div className="loading">Cargando productos...</div>
        ) : error ? (
          <div className="error">
            <p>Error: {error}</p>
            <button onClick={fetchProducts}>Reintentar</button>
          </div>
        ) : products.length === 0 ? (
          <div className="loading">No hay productos disponibles</div>
        ) : (
          <div className="product-grid">
            {products.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                onView={handleView}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Product;