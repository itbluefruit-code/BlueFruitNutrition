import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, X, Upload, Save, XCircle, Edit3, ArrowLeft } from 'lucide-react';
import Swal from 'sweetalert2';
import './ProductsReview.css';

const ProductReviews = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [deletingReview, setDeletingReview] = useState(null);
  const [editing, setEditing] = useState(false);

  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    price: '',
    image: null,
    imagePreview: '',
  });

  // Cargar producto
  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = () => {
    fetch(`https://bluefruitnutrition-production.up.railway.app/api/products/${id}`)
      .then(res => res.json())
      .then(data => {
        setProduct(data);
        setEditForm({
          name: data.name,
          description: data.description,
          price: data.price,
          image: null,
          imagePreview: data.image || '/placeholder-product.png',
        });
      })
      .catch(err => {
        console.error('Error al cargar el producto:', err);
        setProduct(null);
      });
  };

  // Cargar reseñas
  useEffect(() => {
    loadReviews();
  }, [id]);

  const loadReviews = () => {
    fetch(`https://bluefruitnutrition-production.up.railway.app/api/reviews?idProduct=${id}`)
      .then(res => res.json())
      .then(data => setReviews(data))
      .catch(err => console.error('Error al obtener reseñas:', err));
  };

  const handleQuantityChange = (change) => {
    setQuantity(prev => Math.max(1, prev + change));
  };

  const handleDeleteReview = async (reviewId) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#0C133F',
      cancelButtonColor: '#DCDCDC',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (!result.isConfirmed) return;

    try {
      setDeletingReview(reviewId);
      const response = await fetch(`https://bluefruitnutrition-production.up.railway.app/api/admin/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        await Swal.fire({
          title: '¡Eliminado!',
          text: 'Reseña eliminada correctamente',
          icon: 'success',
          confirmButtonColor: '#0C133F'
        });
        loadReviews();
      } else {
        const data = await response.json();
        await Swal.fire({
          title: 'Error',
          text: data.message || 'Error al eliminar reseña',
          icon: 'error',
          confirmButtonColor: '#0C133F'
        });
      }
    } catch (err) {
      console.error('Error:', err);
      await Swal.fire({
        title: 'Error',
        text: 'Error al eliminar la reseña',
        icon: 'error',
        confirmButtonColor: '#0C133F'
      });
    } finally {
      setDeletingReview(null);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditForm(prev => ({
        ...prev,
        image: file,
        imagePreview: URL.createObjectURL(file)
      }));
    }
  };

  const handleSave = async () => {
    try {
      const formData = new FormData();
      formData.append('name', editForm.name);
      formData.append('description', editForm.description);
      formData.append('price', editForm.price);
      if (editForm.image) formData.append('image', editForm.image);

      const response = await fetch(`https://bluefruitnutrition-production.up.railway.app/api/products/${id}`, {
        method: 'PUT',
        body: formData,
      });

      if (response.ok) {
        await Swal.fire({
          title: '¡Actualizado!',
          text: 'Producto actualizado correctamente',
          icon: 'success',
          confirmButtonColor: '#0C133F'
        });
        setEditing(false);
        fetchProduct();
      } else {
        const data = await response.json();
        await Swal.fire({
          title: 'Error',
          text: data.message || 'Error al actualizar producto',
          icon: 'error',
          confirmButtonColor: '#0C133F'
        });
      }
    } catch (err) {
      console.error('Error al actualizar producto:', err);
      await Swal.fire({
        title: 'Error',
        text: 'Error al actualizar producto',
        icon: 'error',
        confirmButtonColor: '#0C133F'
      });
    }
  };

  const handleCancel = () => {
    setEditing(false);
    setEditForm({
      name: product.name,
      description: product.description,
      price: product.price,
      image: null,
      imagePreview: product.image || '/placeholder-product.png',
    });
  };

  const handleBackToProducts = () => navigate('/productos1');

  const renderStars = (rating) => (
    [...Array(5)].map((_, i) => (
      <Star key={i} className={`star ${i < rating ? 'filled' : 'empty'}`} size={16} fill={i < rating ? '#fbbf24' : 'none'} color={i < rating ? '#fbbf24' : '#e0e0e0'} />
    ))
  );

  if (product === null) {
    return (
      <div className="products-review-wrapper">
        <div className="product-detail-screen">
          <div className="product-not-found">
            <h2>Producto no encontrado</h2>
            <button onClick={handleBackToProducts} className="back-to-products-btn">
              Volver a Productos
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="products-review-wrapper">
      <div className="product-detail-screen">
        <div className="product-detail-main">
          <div className={`product-detail-container ${editing ? 'editing-mode' : ''}`}>
            <button className="back-button" onClick={handleBackToProducts}>
              <ArrowLeft size={18} style={{ display: 'inline', marginRight: '8px' }} />
              Volver a Productos
            </button>

            {/* Layout principal */}
            <div className="product-detail-layout">
              <div className={`product-image-section ${editing ? 'editing' : ''}`}>
                <div className={`product-image-container ${editing ? 'editing' : ''}`}>
                  <img
                    src={editing ? editForm.imagePreview : (product.image || '/placeholder-product.png')}
                    alt={product.name}
                    className="product-main-image"
                  />
                  {editing && (
                    <label className="image-upload-label">
                      <Upload size={18} />
                      Cambiar Imagen
                      <input type="file" accept="image/*" onChange={handleImageChange} className="image-input"/>
                    </label>
                  )}
                </div>
              </div>

              <div className={`product-info-section ${editing ? 'editing' : ''}`}>
                {editing && (
                  <span className="editing-badge">
                    <Edit3 size={14} style={{ display: 'inline', marginRight: '4px' }} />
                    Modo Edición
                  </span>
                )}
                
                <h1 className="product-title">{product.name}</h1>

                {editing ? (
                  <>
                    <label className="edit-field-label">Descripción</label>
                    <textarea
                      name="description"
                      value={editForm.description}
                      onChange={handleInputChange}
                      placeholder="Ingresa la descripción del producto..."
                      className="edit-textarea"
                      rows={5}
                    />
                    
                    <label className="edit-field-label">Precio (USD)</label>
                    <input
                      type="number"
                      name="price"
                      value={editForm.price}
                      onChange={handleInputChange}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      className="edit-input"
                    />
                  </>
                ) : (
                  <>
                    <div className="product-price">${product.price.toFixed(2)}</div>
                    {product.flavor && <div className="product-flavor">Sabor: {product.flavor}</div>}
                    <div className="product-description">{product.description}</div>
                  </>
                )}

                <div className="action-buttons">
                  {editing ? (
                    <>
                      <button className="save-btn" onClick={handleSave}>
                        <Save size={18} />
                        Guardar Cambios
                      </button>
                      <button className="cancel-btn" onClick={handleCancel}>
                        <XCircle size={18} />
                        Cancelar
                      </button>
                    </>
                  ) : (
                    <button className="customize-btn" onClick={() => setEditing(true)}>
                      <Edit3 size={18} />
                      Editar Producto
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* RESEÑAS  */}
          <div className="reviews-section">
            <div className="reviews-container">
              <div className="reviews-header">
                <h2>Reseñas del Producto</h2>
                <span className="reviews-count">
                  {reviews.length} {reviews.length === 1 ? 'Reseña' : 'Reseñas'}
                </span>
              </div>

              {reviews.length === 0 ? (
                <div className="no-reviews-message">
                  <p>No hay reseñas para este producto aún.</p>
                </div>
              ) : (
                <div className="reviews-grid">
                  {reviews.map((review) => (
                    <div key={review._id} className="review-card-admin">
                      <div className="review-card-header">
                        <div className="reviewer-info">
                          <div className="reviewer-avatar">
                            {review.idClient?.name?.charAt(0)?.toUpperCase() || 'U'}
                          </div>
                          <div className="reviewer-details">
                            <h4 className="reviewer-name">
                              {review.idClient?.name || 'Usuario Anónimo'}
                            </h4>
                            <div className="review-rating">
                              {renderStars(review.rating)}
                            </div>
                          </div>
                        </div>
                        <button
                          className="delete-review-btn"
                          onClick={() => handleDeleteReview(review._id)}
                          disabled={deletingReview === review._id}
                          title="Eliminar reseña"
                        >
                          {deletingReview === review._id ? (
                            <span className="spinner-small"></span>
                          ) : (
                            <X size={22} strokeWidth={2.5} />
                          )}
                        </button>
                      </div>
                      
                      <div className="review-comment">
                        {review.comment}
                      </div>
                      
                      <div className="review-date">
                        {new Date(review.createdAt).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductReviews;