import jsonwebtoken from "jsonwebtoken";
import { config } from "../config.js";
import fetch from "node-fetch";

const adminVerificationController = {};

// Enviar código por correo
adminVerificationController.sendCode = async (req, res) => {
  const { email, password } = req.body;

  // Validar credenciales base
  if (email !== config.emailAdmin.email || password !== config.emailAdmin.password) {
    return res.status(401).json({ message: "Credenciales inválidas" });
  }

  // Generar código de 6 dígitos
  const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

  // Crear token con el código (expira en 5 min)
  const verificationToken = jsonwebtoken.sign(
    { email, verificationCode },
    config.JWT.secret,
    { expiresIn: "5m" }
  );

  // Detectar entorno

  // Guardar el token temporal en cookie
  res.cookie("adminVerificationToken", verificationToken, {
    httpOnly: true,
    secure: true,
    sameSite: "None",
    maxAge: 5 * 60 * 1000 // 5 minutos
  });

  // ENVIAR CORREO CON BREVO API
  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        accept: "application/json",
        "api-key": config.apiKey.api_key,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        sender: { name: "Blue Fruit Nutrition", email: config.email.email_user },
        to: [{ email: email, name: "Admin" }],
        subject: "Código de verificación - Acceso Admin",
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
            <h2 style="color: #2E86C1; text-align: center;">Bienvenido Administrador</h2>
            <p style="font-size: 16px; text-align: center;">
              Este es su código de acceso. Úselo para completar el inicio de sesión:
            </p>
            <div style="margin: 30px 0; text-align: center;">
              <span style="font-size: 32px; font-weight: bold; color: #27AE60;">${verificationCode}</span>
            </div>
            <p style="font-size: 14px; color: #555; text-align: center;">
              Este código expira en 5 minutos.
            </p>
            <p style="font-size: 12px; text-align: center; color: #999;">
              Si usted no solicitó este acceso, por favor ignore este mensaje.
            </p>
          </div>
        `,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Error al enviar con Brevo:", errorData);
      return res.status(400).json({ message: "Error enviando el correo" });
    }

    return res.status(200).json({ message: "Código enviado al correo" });
  } catch (error) {
    console.error("Error al usar Brevo:", error);
    return res.status(500).json({ message: "Error interno al enviar correo" });
  }
};

// Verificar código y establecer sesión
adminVerificationController.verifyCode = async (req, res) => {
  const { code } = req.body;
  const token = req.cookies.adminVerificationToken;

  if (!token) {
    return res.status(400).json({ message: "No hay token de verificación" });
  }

  try {
    const decoded = jsonwebtoken.verify(token, config.JWT.secret);

    if (decoded.verificationCode !== code) {
      return res.status(422).json({ message: "Código inválido" });
    }

    // ✅ Si el código es correcto, creamos el token de sesión principal
    const sessionToken = jsonwebtoken.sign(
      {
        id: "507f1f77bcf86cd799439011",
        email: decoded.email,
        name: "Administrador",
        role: "admin",
      },
      config.JWT.secret,
      { expiresIn: "1d" }
    );


    // Guardar token de sesión en cookie
    res.cookie("authToken", sessionToken, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      maxAge: 24 * 60 * 60 * 1000 // 1 día
    });

    // Limpiar el token temporal
    res.clearCookie("adminVerificationToken");

    return res.status(200).json({ message: "Verificación exitosa y sesión iniciada" });
  } catch (error) {
    console.error("Error en verifyCode:", error);
    return res.status(400).json({ message: "Token inválido o expirado" });
  }
};

export default adminVerificationController;
