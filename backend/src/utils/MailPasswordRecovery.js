import fetch from "node-fetch";
import { config } from "../config.js";

// API Key de Brevo
const apiKey = config.apiKey.api_key;

// 1 - Función para enviar correo usando Brevo
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
      console.error("Error al enviar correo con Brevo:", errorData);
      throw new Error("Error al enviar el correo");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.log("Error enviando correo con Brevo:", error);
    throw error;
  }
};

// 2 - Plantilla HTML de recuperación de contraseña
const HTMLRecoveryEmail = (code) => {
  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>Recuperación de contraseña</title>
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
        .header p {
          margin: 8px 0 0 0;
          opacity: 0.9;
          font-weight: 500;
        }
        .content {
          padding: 30px;
          background: #ffffff;
          color: #333;
        }
        .content h2 {
          color: #001a4d;
          margin-top: 0;
          border-bottom: 2px solid #0056b3;
          padding-bottom: 10px;
        }
        .content p {
          font-size: 16px;
          color: #555555;
          line-height: 1.5;
        }
        .code {
          display: inline-block;
          margin: 20px 0;
          font-size: 28px;
          font-weight: bold;
          background-color: #f1f4f9;
          padding: 15px 30px;
          border-radius: 10px;
          letter-spacing: 4px;
          color: #001a4d;
          border: 2px solid #0056b3;
          user-select: all;
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
          <p>Solicitud de recuperación de contraseña</p>
        </div>

        <div class="content">
          <h2>Restablece tu contraseña</h2>
          <p>Hemos recibido una solicitud para restablecer tu contraseña. Usa el siguiente código para continuar con el proceso:</p>
          <div class="code">${code}</div>
          <p>Si no solicitaste este cambio, puedes ignorar este mensaje.</p>
        </div>

        <div class="footer">
          &copy; ${new Date().getFullYear()} Blue Fruit Nutrition. Todos los derechos reservados.
        </div>
      </div>
    </body>
    </html>
  `;
};

export { sendMail, HTMLRecoveryEmail };
