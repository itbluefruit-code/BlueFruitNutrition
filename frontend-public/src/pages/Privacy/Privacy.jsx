import React from "react";
import './Privacy.css';

const Privacy = () => {
  return (
    <div className="privacy-page">
      <h1>POLÍTICA DE PRIVACIDAD DE BLUE FRUIT NUTRITION</h1>
      <p className="privacy-date">Fecha de última actualización: 12/10/2025</p>
      <p>
        En Blue Fruit Nutrition, estamos comprometidos con la protección de su privacidad. 
        Esta Política de Privacidad describe cómo recopilamos, utilizamos, procesamos y protegemos su información personal 
        al utilizar nuestro sitio web (<a href="https://www.bluefruitnutrition.com" target="_blank" rel="noopener noreferrer">www.bluefruitnutrition.com</a>) y nuestros servicios.
      </p>

      <h2>1. RESPONSABILIDAD DE UTILIZACIÓN DE DATOS</h2>
      <p>
        Nombre Comercial: Blue Fruit Nutrition<br/>
        Correo electrónico: info@bluefruitnutrition.com<br/>
        Sitio Web: www.bluefruitnutrition.com
      </p>

      <h2>2. INFORMACIÓN RECOPILADA</h2>
      <p>
        <strong>a) Información que usted nos proporciona directamente:</strong> 
        Se generará al momento de interactuar con nosotros (ej.: llenar un formulario, comprar un producto o registrarse).
      </p>
      <p>
        <strong>b) Información recopilada automáticamente (Datos de Navegación):</strong> 
        Cuando usted visita nuestro sitio web, se recopila automáticamente cierta información a través de tecnologías como cookies, píxeles y web beacons.
      </p>

      <h2>3. FINALIDAD Y BASE ESPECÍFICA DE UTILIZACIÓN DE INFORMACIÓN</h2>
      <table>
        <thead>
          <tr>
            <th>FINALIDAD</th>
            <th>BASE ESPECÍFICA</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Prestación de Servicios de Nutrición</td>
            <td>Ejecución de un contrato de servicios solicitado por usted</td>
          </tr>
          <tr>
            <td>Envío de Comunicaciones Comerciales</td>
            <td>Su consentimiento explícito (al suscribirse al boletín)</td>
          </tr>
          <tr>
            <td>Respuesta a Consultas</td>
            <td>Interés legítimo o su consentimiento</td>
          </tr>
          <tr>
            <td>Cumplimiento de Obligaciones Legales</td>
            <td>Obligación legal (ej. facturación, impuestos)</td>
          </tr>
          <tr>
            <td>Mejora del Sitio Web</td>
            <td>Interés legítimo (analizar y mejorar la calidad de nuestros servicios)</td>
          </tr>
        </tbody>
      </table>

      <h2>4. TRANSFERENCIA DE DATOS A TERCEROS</h2>
      <ul>
        <li><strong>Proveedores de Servicios:</strong> Con empresas que nos ayudan a operar el sitio web y los servicios (ej. alojamiento web, plataformas de email marketing, procesadores de pago). Estas entidades están obligadas contractualmente a proteger sus datos.</li>
        <li><strong>Obligación Legal:</strong> Si somos requeridos por ley o por una autoridad judicial / administrativa competente.</li>
        <li><strong>Datos Sensibles (Salud):</strong> Sus datos de salud solo son compartidos con los profesionales de Blue Fruit Nutrition y nunca son divulgados sin su consentimiento expreso, excepto por disposición legal.</li>
      </ul>

      <h2>5. USO DE COOKIES</h2>
      <p>
        Nuestro sitio web utiliza cookies (pequeños archivos de texto) para facilitar y mejorar la interacción del usuario y analizar el uso del sitio.
      </p>
      <ul>
        <li><strong>Cookies Esenciales:</strong> Necesarias para el funcionamiento básico del sitio.</li>
        <li><strong>Cookies Analíticas:</strong> Para entender cómo los usuarios navegan y así mejorar la estructura y el contenido.</li>
        <li><strong>Cookies de Marketing:</strong> Para ofrecer publicidad relevante.</li>
      </ul>
      <p>Usted puede aceptar, rechazar o configurar el uso de cookies en su navegador.</p>

      <h2>6. DERECHOS</h2>
      <p>Como titular de sus datos personales, usted tiene derecho a:</p>
      <ol>
        <li>Acceso: Conocer qué datos personales suyos tenemos y cómo los utilizamos.</li>
        <li>Rectificación: Solicitar la corrección de su información si está incompleta o inexacta.</li>
        <li>Cancelación/Supresión: Solicitar la eliminación de sus datos cuando ya no sean necesarios para los fines que fueron recopilados.</li>
        <li>Oposición: Oponerse al uso de sus datos para fines específicos (ej. marketing).</li>
        <li>Portabilidad: Recibir los datos personales que nos ha facilitado en un formato estructurado y de uso común.</li>
        <li>Retirar el Consentimiento: Revocar en cualquier momento el consentimiento que nos haya otorgado para el tratamiento de sus datos.</li>
      </ol>
      <p>Para ejercer cualquiera de estos derechos, por favor, envíe una solicitud por escrito a: info@bluefruitnutrition.com, adjuntando una copia de su identificación para verificar su identidad.</p>

      <h2>7. SEGURIDAD DE LOS DATOS</h2>
      <p>
        Hemos implementado medidas de seguridad técnicas y organizativas para proteger su información personal contra la pérdida, el acceso no autorizado, el uso indebido o la divulgación. 
        Estas medidas incluyen: uso de cifrado SSL, firewalls y controles de acceso.
      </p>

      <h2>8. CAMBIOS EN POLÍTICA DE PRIVACIDAD</h2>
      <p>
        Nos reservamos el derecho de modificar esta Política de Privacidad en cualquier momento. Si realizamos cambios materiales, se lo notificaremos publicando una Política actualizada en el sitio web y actualizando la "Fecha de última actualización" en la parte superior. 
        Le recomendamos revisar esta Política periódicamente.
      </p>
    </div>
  );
};

export default Privacy;
