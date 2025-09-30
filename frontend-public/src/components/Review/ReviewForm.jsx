import React, { useState } from 'react';
import toast from 'react-hot-toast';

const ReviewForm = ({ productId, onClose, onReviewAdded }) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validaciones
    if (rating === 0) {
      toast.error('Por favor selecciona una calificación');
      return;
    }

    if (!comment.trim()) {
      toast.error('Por favor escribe un comentario');
      return;
    }

    if (comment.trim().length < 10) {
      toast.error('El comentario debe tener al menos 10 caracteres');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('http://localhost:4000/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Importante para enviar las cookies de autenticación
        body: JSON.stringify({
          comment: comment.trim(),
          rating: rating,
          idProduct: productId,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('¡Reseña agregada exitosamente!');
        setRating(0);
        setComment('');
        
        // Llamar callbacks
        if (onReviewAdded) onReviewAdded();
        if (onClose) onClose();
      } else {
        toast.error(data.message || 'Error al guardar la reseña');
      }
    } catch (error) {
      console.error('Error al enviar reseña:', error);
      toast.error('Error de conexión. Por favor intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setRating(0);
    setComment('');
    if (onClose) onClose();
  };

  return (
    <div className="review-form-container">
      <form onSubmit={handleSubmit} className="review-form">
        
        {/* Rating de estrellas */}
        <div className="form-group">
          <label>Calificación *</label>
          <div className="rating-input">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                className={`star interactive ${
                  star <= (hoveredRating || rating) ? 'filled' : ''
                }`}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
              >
                ★
              </span>
            ))}
            {rating > 0 && (
              <span className="rating-text">
                {rating === 1 && 'Muy malo'}
                {rating === 2 && 'Malo'}
                {rating === 3 && 'Regular'}
                {rating === 4 && 'Bueno'}
                {rating === 5 && 'Excelente'}
              </span>
            )}
          </div>
        </div>

        {/* Comentario */}
        <div className="form-group">
          <label htmlFor="comment">Tu reseña *</label>
          <textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Comparte tu experiencia con este producto..."
            rows="5"
            maxLength="500"
            disabled={isSubmitting}
          />
          <div className="character-count">
            {comment.length}/500 caracteres
          </div>
        </div>

        {/* Botones */}
        <div className="form-buttons">
          <button
            type="button"
            onClick={handleCancel}
            className="cancel-review-btn"
            disabled={isSubmitting}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="submit-review-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Enviando...' : 'Publicar Reseña'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReviewForm;