import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../context/useAuth';
import toast from 'react-hot-toast';
import "./pay.css";

const Pay = () => {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const [showBack, setShowBack] = React.useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    watch,
  } = useForm({
    defaultValues: {
      cardNumber: '',
      cardHolder: '',
      expiryDate: '',
      securityCode: ''
    }
  });

  // 🔹 Formatear número de tarjeta con espacios
  const handleCardNumberInput = (e) => {
    let value = e.target.value.replace(/\D/g, ''); // solo dígitos
    if (value.length > 16) value = value.slice(0, 16);
    const formatted = value.replace(/(.{4})/g, '$1 ').trim();
    setValue('cardNumber', formatted);
  };

  // 🔹 Formatear fecha MM/AA
  const handleExpiryInput = (e) => {
    let rawValue = e.target.value.replace(/\D/g, '');
    if (rawValue.length >= 3) {
      rawValue = rawValue.slice(0, 2) + '/' + rawValue.slice(2, 4);
    }
    if (rawValue.length > 5) rawValue = rawValue.slice(0, 5);
    setValue('expiryDate', rawValue);
  };

  // 🔹 Solo números para CVV
  const handleSecurityCodeInput = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 3) value = value.slice(0, 3);
    setValue('securityCode', value);
  };

  // Simulación del pago (lo tuyo ya está bien)
  const onSubmitBack = async (formData) => {
    try {
      toast.loading('Procesando pago...', { id: 'payment' });
      await new Promise((r) => setTimeout(r, 2000));
      toast.success('¡Pago procesado exitosamente!', { id: 'payment' });
      localStorage.removeItem("carrito");
      navigate('/Bill');
    } catch (error) {
      toast.error('Error en el pago: ' + error.message, { id: 'payment' });
    }
  };

  const onSubmitFront = () => setShowBack(true);
  const goToCheckout = () => navigate('/metodo');

  return (
    <div className="page-wrapper">
      <div className="credit-card-container">
        <div className={`card-flip-wrapper ${showBack ? 'flip' : ''}`}>
          {/* ANVERSO */}
          <div className="credit-card-mockup front">
            <div className="chip"></div>
            <div className="card-number">
              {watch('cardNumber') || '1234 5678 9010 1234'}
            </div>
            <div className="card-info-bottom">
              <div className="card-holder-info">
                <span className="card-label">Titular:</span>
                <span className="card-value">{watch('cardHolder') || 'Nombre Apellido'}</span>
              </div>
              <div className="expiration-info">
                <span className="card-label">Vencimiento:</span>
                <span className="card-value">{watch('expiryDate') || 'MM/AA'}</span>
              </div>
            </div>
          </div>

          {/* REVERSO */}
          <div className="credit-card-mockup back">
            <div className="magnetic-stripe"></div>
            <div className="card-holder-back-info">
              <span className="card-label-back">Titular:</span>
              <span className="card-value-back">{watch('cardHolder') || 'Nombre Apellido'}</span>
            </div>
            <div className="security-code-label">Código:</div>
           {/* ✅ Mostrar solo asteriscos aunque el usuario escriba */}
          <div className="security-code-display">
          {'*'.repeat(watch('securityCode')?.length || 3)}
          </div>

          </div>
        </div>

        {/* FORMULARIOS */}
        {!showBack ? (
          <form className="input-fields-group" onSubmit={handleSubmit(onSubmitFront)}>
            <button type="button" className="back-button" onClick={goToCheckout}>← Volver</button>

            {/* NÚMERO TARJETA */}
            <div className="input-field">
              <label htmlFor="cardNumber">Número de Tarjeta</label>
              <input
                id="cardNumber"
                inputMode="numeric"
                maxLength={19}
                {...register('cardNumber', {
                  required: 'Campo requerido',
                  pattern: { value: /^(\d{4} ?){4}$/, message: 'Debe tener 16 dígitos' }
                })}
                onChange={handleCardNumberInput}
                className={errors.cardNumber ? "error-border" : ""}
              />
              {errors.cardNumber && <small className="error">{errors.cardNumber.message}</small>}
            </div>

            {/* TITULAR Y FECHA */}
            <div className="flex-group">
              <div className="input-field half-width">
                <label htmlFor="cardHolder">Titular</label>
                <input
                  id="cardHolder"
                  {...register('cardHolder', {
                    required: 'Campo requerido',
                    minLength: { value: 3, message: 'Nombre demasiado corto' },
                    pattern: { value: /^[A-Za-zÁÉÍÓÚÑáéíóúñ ]+$/, message: 'Solo letras' }
                  })}
                  className={errors.cardHolder ? "error-border" : ""}
                />
                {errors.cardHolder && <small className="error">{errors.cardHolder.message}</small>}
              </div>

              <div className="input-field half-width">
                <label htmlFor="expiryDate">Vencimiento (MM/AA)</label>
                <input
                  id="expiryDate"
                  placeholder="MM/AA"
                  maxLength={5}
                  inputMode="numeric"
                  {...register('expiryDate', {
                    required: 'Campo requerido',
                    pattern: { value: /^(0[1-9]|1[0-2])\/\d{2}$/, message: 'Formato inválido' }
                  })}
                  onChange={handleExpiryInput}
                  className={errors.expiryDate ? "error-border" : ""}
                />
                {errors.expiryDate && <small className="error">{errors.expiryDate.message}</small>}
              </div>
            </div>

            <button type="submit" className="next-step-button">Siguiente</button>
          </form>
        ) : (
          <form className="input-fields-group" onSubmit={handleSubmit(onSubmitBack)}>
            <button type="button" className="back-button" onClick={() => setShowBack(false)}>← Volver</button>

            {/* CVV */}
            <div className="input-field full-width">
           <label htmlFor="securityCode">Código de Seguridad</label>
          <input
           id="securityCode"
           type="password" // ✅ Se mostrará como ***
           maxLength={3}
           {...register('securityCode', {
          required: 'Requerido',
          pattern: { value: /^\d{3}$/, message: '3 dígitos' }
            })}
          onInput={(e) => {
          e.target.value = e.target.value.replace(/\D/g, ''); // ✅ Solo números
           }}
           />
          {errors.securityCode && <small className="error">{errors.securityCode.message}</small>}
         </div>


            <button type="submit" className="finish-purchase-button">Finalizar compra</button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Pay;
