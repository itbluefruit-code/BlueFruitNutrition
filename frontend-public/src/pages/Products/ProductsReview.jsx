import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import ReviewForm from "../../components/Review/ReviewForm";
import Review from '../../components/Review/ReviewView';
import { useAuthContext } from '../../context/useAuth';
import './ProductsReview.css';


const ProductsReview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user, loading: authLoading, API_URL, checkSession } = useAuthContext();

  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [selectedFlavor, setSelectedFlavor] = useState('');
  const [loading, setLoading] = useState(true);
  const [userHasReviewed, setUserHasReviewed] = useState(false);

  // Verificar si el usuario es distribuidor
  const isDistribuidor = user?.role === "distributor";

  // Cargar producto
  useEffect(() => {
    setLoading(true);
    fetch(`${API_URL}/products/${id}`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        let flavorsArray = [];
       
        if (data.flavor) {
          if (Array.isArray(data.flavor)) {
            if (data.flavor.length > 0 && typeof data.flavor[0] === 'string') {
              if (data.flavor[0].startsWith('[') && data.flavor[0].endsWith(']')) {
                try {
                  flavorsArray = JSON.parse(data.flavor[0]);
                } catch (error) {
                  flavorsArray = data.flavor;
                }
              } else {
                flavorsArray = data.flavor;
              }
            } else {
              flavorsArray = data.flavor;
            }
          } else if (typeof data.flavor === 'string') {
            try {
              const parsed = JSON.parse(data.flavor);
              if (Array.isArray(parsed)) {
                flavorsArray = parsed;
              } else {
                flavorsArray = [data.flavor];
              }
            } catch (error) {
              flavorsArray = [data.flavor];
            }
          } else {
            flavorsArray = [String(data.flavor)];
          }
        }

        flavorsArray = flavorsArray
          .filter(f => f != null && f !== undefined)
          .map(f => String(f).trim())
          .filter(f => f.length > 0);

        setProduct({ ...data, flavor: flavorsArray });

        if (flavorsArray.length > 0) {
          setSelectedFlavor(flavorsArray[0]);
        }

        setLoading(false);
      })
      .catch(err => {
        console.error(' Error al cargar producto:', err);
        setProduct(null);
        setLoading(false);
      });
  }, [id, API_URL]);

  // Cargar reseñas
  useEffect(() => {
    loadReviews();
  }, [id, API_URL, user]);

  const loadReviews = () => {
    console.log(' Cargando reseñas...');
    fetch(`${API_URL}/reviews?idProduct=${id}`, { credentials: 'include' })
      .then(res => {
        if (!res.ok) {
          console.error(' Error al cargar reseñas, status:', res.status);
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        console.log(' Respuesta de reseñas:', data);
        if (Array.isArray(data)) {
          setReviews(data);
          console.log(' Reseñas cargadas:', data.length);
          
          // Verificar si el usuario ya dejó una reseña
          if (user && user.id) {
            const hasReviewed = data.some(review => review.idUser === user.id);
            setUserHasReviewed(hasReviewed);
            console.log(' Usuario ya dejó reseña:', hasReviewed);
          }
        } else {
          console.warn('La respuesta no es un array:', data);
          setReviews([]);
        }
      })
      .catch(err => {
        console.error('Error al cargar reseñas:', err);
        setReviews([]);
      });
  };

  const handleQuantityChange = (change) => {
    setQuantity(prev => Math.max(1, prev + change));
  };

  const handleFlavorChange = (flavor) => {
    setSelectedFlavor(flavor);
  };

  const handleFlavorSelectChange = (e) => {
    setSelectedFlavor(e.target.value);
  };

  const handleAddToCart = () => {
    if (!product) return;

    if (product.flavor && product.flavor.length > 0 && !selectedFlavor) {
      toast.error("Por favor selecciona un sabor");
      return;
    }

    const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    const productId = product._id || product.id;
    const uniqueId = selectedFlavor ? `${productId}_${selectedFlavor}` : productId;

    const existente = carrito.find(p => p.id === uniqueId);

    if (existente) {
      existente.cantidad += quantity;
    } else {
      carrito.push({
        id: uniqueId,
        productId: productId,
        nombre: product.name,
        precio: product.price,
        cantidad: quantity,
        sabor: selectedFlavor || 'Sin sabor',
        imagen: product.image || '/placeholder-product.png'
      });
    }

    localStorage.setItem("carrito", JSON.stringify(carrito));

    const flavorText = selectedFlavor ? ` - ${selectedFlavor}` : '';
    toast.success(`Agregado al carrito: ${quantity} x ${product.name}${flavorText}`);
  };

  const handleBackToProducts = () => navigate('/product');

  const handleAddReview = async () => {
    if (authLoading) {
      toast.loading('Verificando sesión...', { duration: 1000 });
      return;
    }

    if (!isAuthenticated || !user) {
      toast.loading('Verificando sesión...', { id: 'checking-session' });
      try {
        await checkSession();
        setTimeout(() => {
          toast.dismiss('checking-session');
          if (isAuthenticated && user) {
            // Verificar si es distribuidor
            if (user.role === "distributor") {
              toast.error("Los distribuidores no pueden agregar reseñas");
              return;
            }
            
            // Verificar si ya dejó una reseña
            if (userHasReviewed) {
              toast.error("Ya has dejado una reseña para este producto");
              return;
            }
            
            setShowReviewForm(true);
          } else {
            toast.error("Debes iniciar sesión para agregar una reseña");
            setTimeout(() => navigate("/login"), 1500);
          }
        }, 800);
      } catch (error) {
        toast.dismiss('checking-session');
        toast.error("Debes iniciar sesión para agregar una reseña");
        setTimeout(() => navigate("/login"), 1500);
      }
      return;
    }

    // Verificar si es distribuidor
    if (user.role === "distributor") {
      toast.error("Los distribuidores no pueden agregar reseñas");
      return;
    }

    // Verificar si ya dejó una reseña
    if (userHasReviewed) {
      toast.error("Ya has dejado una reseña para este producto");
      return;
    }

    setShowReviewForm(true);
  };

  const handleCustomize = () => {
    if (!isAuthenticated || !user) {
      toast.error("Debes iniciar sesión para personalizar productos");
      setTimeout(() => navigate("/login"), 1500);
      return;
    }

    if (isDistribuidor) {
      toast.error("Los distribuidores no pueden personalizar productos");
      return;
    }

    // Navegar a la página de personalización con los datos del producto
    navigate('/personalizar', { 
      state: { 
        nombre: product.name, 
        imagen: product.image || '/placeholder-product.png' 
      } 
    });
  };

  const calculateAverageRating = () => {
    if (!Array.isArray(reviews) || reviews.length === 0) {
      return 0;
    }
    const sum = reviews.reduce((acc, review) => acc + (review.rating || 0), 0);
    return (sum / reviews.length).toFixed(1);
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <span key={index} className={`star ${index < rating ? 'filled' : ''}`}>
        ★
      </span>
    ));
  };

  if (loading) {
    return (
      <div className="products-review-wrapper">
        <div className="product-detail-screen">
          <div className="loading-container">
            <div className="loading-spinner">
              <div className="spinner"></div>
              <p>Cargando producto...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (product === null) {
    return (
      <div className="products-review-wrapper">
        <div className="product-detail-screen">
          <div className="product-not-found">
            <h2>Producto no encontrado</h2>
            <p>El producto que buscas no está disponible</p>
            <button onClick={handleBackToProducts} className="back-to-products-btn">
              Volver a Productos
            </button>
          </div>
        </div>
      </div>
    );
  }

  const averageRating = calculateAverageRating();

  return (
    <div className="products-review-wrapper">
      <div className="product-detail-screen">
        <div className="product-detail-main">
          <div className="product-detail-container">
            <button className="back-button" onClick={handleBackToProducts}>
              ← Volver a Productos
            </button>

            <div className="product-detail-layout">
              <div className="product-image-section">
                <div className="product-image-container">
                  <img
                    src={product.image || '/placeholder-product.png'}
                    alt={product.name}
                    className="product-main-image"
                    onError={(e) => {
                      e.target.src = '/placeholder-product.png';
                    }}
                  />
                </div>
              </div>

              <div className="product-info-section">
                <div className="product-category">Producto</div>
                <h1 className="product-title">{product.name}</h1>

                <div className="product-rating">
                  <div className="stars">
                    {renderStars(Math.round(averageRating))}
                  </div>
                  <span className="rating-text">
                    {averageRating} ({reviews.length} Review{reviews.length !== 1 ? 's' : ''})
                  </span>
                </div>

                <div className="product-price-container">
                  <div className="product-price">${product.price.toFixed(2)}</div>
                  {product.oldPrice && (
                    <div className="product-price-old">${product.oldPrice.toFixed(2)}</div>
                  )}
                </div>

                <p className="product-short-description">
                  {product.description || 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'}
                </p>

                {product.flavor && product.flavor.length > 0 && (
                  <div className="flavor-selector-container">
                    <label className="flavor-label">Sabor:</label>
                    <div className="flavor-buttons">
                      {product.flavor.map((flavor, index) => (
                        <button
                          key={index}
                          className={`flavor-button ${selectedFlavor === flavor ? 'selected' : ''}`}
                          onClick={() => handleFlavorChange(flavor)}
                        >
                          {flavor}
                        </button>
                      ))}
                    </div>

                    <select
                      value={selectedFlavor}
                      onChange={handleFlavorSelectChange}
                      className="flavor-dropdown-select"
                    >
                      {product.flavor.map((flavor, index) => (
                        <option key={index} value={flavor}>
                          {flavor}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="quantity-and-actions">
                  <div className="quantity-controls">
                    <button
                      className="quantity-btn"
                      onClick={() => handleQuantityChange(-1)}
                      disabled={quantity <= 1}
                    >
                      −
                    </button>
                    <span className="quantity-display">{quantity}</span>
                    <button
                      className="quantity-btn"
                      onClick={() => handleQuantityChange(1)}
                    >
                      +
                    </button>
                  </div>

                  <button className="add-to-cart-btn-inline" onClick={handleAddToCart}>
                    Agregar al carrito
                  </button>
                </div>

                {/* Botones de Personalizar y Agregar Reseña - En la misma línea */}
                {!isDistribuidor && (
                  <div className="secondary-actions">
                    <button className="customize-btn" onClick={handleCustomize}>
                       Personalizar Producto
                    </button>
                    <button className="add-review-btn-inline" onClick={handleAddReview}>
                      + Agregar Reseña
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="reviews-section">
            <div className="reviews-column">
              <div className="reviews-header">
                <h2>Reseñas del Producto</h2>
                {/* Botón removido de aquí - ahora está arriba */}
              </div>

              <div className="reviews-stats">
                <div className="average-rating">{averageRating}</div>
                <div className="stars">
                  {renderStars(Math.round(averageRating))}
                </div>
                <div className="total-reviews">({reviews.length} Reviews)</div>
              </div>

              {showReviewForm && !isDistribuidor && (
                <div className="review-form-wrapper">
                  <ReviewForm
                    productId={id}
                    onClose={() => setShowReviewForm(false)}
                    onReviewAdded={() => {
                      toast.success("¡Reseña agregada exitosamente!");
                      loadReviews();
                      setShowReviewForm(false);
                    }}
                  />
                </div>
              )}

              <div className="reviews-list">
                {Array.isArray(reviews) && reviews.length > 0 ? (
                  reviews.map((review) => (
                    <Review key={review._id} review={review} />
                  ))
                ) : (
                  <div className="no-reviews">
                    <p>No hay reseñas aún. ¡Sé el primero en comentar!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductsReview;