import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useAuthContext } from '../../context/useAuth';
import './ReviewForm.css';


const ReviewForm = ({ productId, onClose, onReviewAdded }) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);


  const { API_URL } = useAuthContext();


  const handleSubmit = async (e) => {
    e.preventDefault();


   


    // Validaciones
    if (rating === 0) {
      console.log('❌ Error: rating es 0');
      toast.error('Por favor selecciona una calificación');
      return;
    }


    if (!comment.trim()) {
      console.log('❌ Error: comentario vacío');
      toast.error('Por favor escribe un comentario');
      return;
    }


    if (comment.trim().length < 10) {
      console.log('❌ Error: comentario muy corto');
      toast.error('El comentario debe tener al menos 10 caracteres');
      return;
    }


    console.log('✅ Validaciones pasadas');
    setIsSubmitting(true);


    try {
      const url = `${API_URL}/reviews`;
      const payload = {
        comment: comment.trim(),
        rating: rating,
        idProduct: productId,
      };


      console.log('📤 Enviando petición:');
      console.log('  URL:', url);
      console.log('  Payload:', payload);
      console.log('  Credentials: include');


      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(payload),
      });


      console.log('📡 Respuesta recibida:');
      console.log('  Status:', response.status);
      console.log('  Status Text:', response.statusText);
      console.log('  OK:', response.ok);


      const data = await response.json();
      console.log('  Data:', data);


      if (response.ok) {
        console.log(' Reseña guardada exitosamente');
        toast.success('¡Reseña agregada exitosamente!');
        setRating(0);
        setComment('');
       
        if (onReviewAdded) {
          console.log('Llamando onReviewAdded');
          onReviewAdded();
        }
        if (onClose) {
          console.log(' Cerrando formulario');
          onClose();
        }
      } else {
        console.error('❌ Error del servidor:', data);
        toast.error(data.message || 'Error al guardar la reseña');
      }
    } catch (error) {
      console.error('💥 Error en catch:', error);
      console.error('  Nombre:', error.name);
      console.error('  Mensaje:', error.message);
      console.error('  Stack:', error.stack);
      toast.error('Error de conexión. Por favor intenta nuevamente.');
    } finally {
      console.log('🏁 Finalizando handleSubmit');
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
       
        <div className="form-group">
          <label>Calificación *</label>
          <div className="rating-input">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                className={`star interactive ${
                  star <= (hoveredRating || rating) ? 'filled' : ''
                }`}
                onClick={() => {
                  setRating(star);
                  console.log('⭐ Rating seleccionado:', star);
                }}
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


        <div className="form-group">
          <label htmlFor="comment">Tu reseña *</label>
          <textarea
            id="comment"
            value={comment}
            onChange={(e) => {
              setComment(e.target.value);
             
            }}
            placeholder="Comparte tu experiencia con este producto..."
            rows="5"
            maxLength="500"
            disabled={isSubmitting}
          />
          <div className="character-count">
            {comment.length}/500 caracteres
          </div>
        </div>


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