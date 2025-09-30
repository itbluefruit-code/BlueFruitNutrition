import React from 'react';

const Review = ({ review }) => {
  // Función para renderizar estrellas
  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <span key={index} className={`star ${index < rating ? 'filled' : ''}`}>
        ★
      </span>
    ));
  };

  // Obtener iniciales del nombre
  const getInitials = (name) => {
    if (!name) return '?';
    const names = name.trim().split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return name[0].toUpperCase();
  };

  // Formatear fecha
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const customerName = review.idClient?.name || 'Usuario Anónimo';
  const createdAt = review.createdAt || new Date();

  return (
    <div className="review-card">
      <div className="review-header-card">
        <div className="reviewer-info">
          <div className="reviewer-avatar">
            {getInitials(customerName)}
          </div>
          <div className="reviewer-details">
            <div className="reviewer-name">{customerName}</div>
            <div className="review-date">{formatDate(createdAt)}</div>
          </div>
        </div>
        <div className="review-rating">
          {renderStars(review.rating)}
        </div>
      </div>
      
      <div className="review-comment">
        {review.comment}
      </div>

      {/* Badge de verificación opcional */}
      {review.verified && (
        <div className="verified-badge">
          ✓ Compra verificada
        </div>
      )}
    </div>
  );
};

export default Review;