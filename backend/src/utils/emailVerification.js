import fetch from "node-fetch";
import { config } from "../config.js";

// API Key de Brevo
const apiKey = config.apiKey.api_key;

/**
 * Envia un correo usando la API de Brevo
 * @param {string} to - Correo destino
 * @param {string} subject - Asunto del correo
 * @param {string} text - Texto plano del correo
 * @param {string} html - Contenido HTML del correo
 */
const sendMail = async (to, subject, text, html) => {
  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        accept: "application/json",
        "api-key": apiKey,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        sender: {
          name: "Blue Fruit Nutrition",
          email: config.email.email_user,
        },
        to: [{ email: to }],
        subject,
        htmlContent: html,
        textContent: text,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("❌ Error al enviar correo con Brevo:", errorData);
      throw new Error("Error al enviar el correo");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("📨 Error enviando correo con Brevo:", error);
    throw error;
  }
};

/**
 * Plantilla HTML para verificación de correo
 * @param {string} name - Nombre del cliente
 * @param {string} code - Código de verificación
 */
const HTMLVerificationEmail = (name, code) => {
  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8" />
      <title>Verifica tu correo</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #f4f4f4;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 40px auto;
          background: white;
          border: 1px solid #ddd;
          border-radius: 10px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }
        .header {
          background: linear-gradient(135deg, #001a4d 0%, #0056b3 100%);
          color: white;
          padding: 24px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 26px;
        }
        .content {
          padding: 30px;
          color: #333;
        }
        .content h2 {
          color: #001a4d;
        }
        .code {
          display: inline-block;
          margin: 20px 0;
          font-size: 28px;
          font-weight: bold;
          background-color: #eef3fb;
          padding: 15px 30px;
          border-radius: 10px;
          letter-spacing: 4px;
          color: #001a4d;
          border: 2px solid #0056b3;
        }
        .footer {
          background: #f8f9fa;
          padding: 15px;
          text-align: center;
          border-top: 1px solid #ddd;
          font-size: 12px;
          color: #666;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>BlueFruit Nutrition</h1>
        </div>
        <div class="content">
          <h2>Hola, ${name} 👋</h2>
          <p>Gracias por registrarte. Usa el siguiente código para verificar tu correo electrónico:</p>
          <div class="code">${code}</div>
          <p>Este código es válido por <strong>2 horas</strong>.</p>
          <p>Si no solicitaste este registro, ignora este mensaje.</p>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} Blue Fruit Nutrition. Todos los derechos reservados.
        </div>
      </div>
    </body>
    </html>
  `;
};

export { sendMail, HTMLVerificationEmail };
