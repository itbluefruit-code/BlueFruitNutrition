import jsonwebtoken from "jsonwebtoken";
import bcryptjs from "bcryptjs";

import customersModel from "../models/Customers.js";
import distributorsModel from "../models/Distributors.js";
import { config } from "../config.js";
import { sendMail, HTMLRecoveryEmail } from "../utils/MailPasswordRecovery.js";

// Controlador de recuperación de contraseña
const passwordRecoveryController = {};

// ENVIAR CÓDIGO --------------------------------------------------------------------------------------
passwordRecoveryController.requestCode = async (req, res) => {
  const { email } = req.body;

  try {
    let userFound;
    let userType;

    // Buscar en clientes y distribuidores
    userFound = await customersModel.findOne({ email });
    if (userFound) {
      userType = "customer";
    } else {
      userFound = await distributorsModel.findOne({ email });
      if (userFound) {
        userType = "distributor";
      }
    }

    if (!userFound) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generar un código aleatorio de 5 dígitos
    const code = Math.floor(10000 + Math.random() * 90000).toString();

    // Crear token JWT con los datos necesarios
    const token = jsonwebtoken.sign(
      { email, code, userType, verified: false },
      config.JWT.secret,
      { expiresIn: "20m" }
    );

    // Guardar token en cookie
    res.cookie("tokenRecoveryCode", token, {
      maxAge: 20 * 60 * 1000, // 20 minutos
      httpOnly: true,
      sameSite: "None",
      secure: true,
    });

    // Enviar correo con Brevo (usa HTML y texto)
    await sendMail(
      email,
      "Recuperación de contraseña",
      `Su código de verificación es: ${code}`,
      HTMLRecoveryEmail(code)
    );

    res.status(200).json({ message: "Verification code sent" });
  } catch (error) {
    console.error("Error en requestCode:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// VERIFICAR CÓDIGO ------------------------------------------------------------------------------------
passwordRecoveryController.verfiedCode = async (req, res) => {
  const { code } = req.body;

  try {
    const token = req.cookies.tokenRecoveryCode;
    if (!token) {
      return res.status(401).json({ message: "Token not found" });
    }

    const decoded = jsonwebtoken.verify(token, config.JWT.secret);

    // Verificar si el código ingresado es correcto
    if (decoded.code !== code) {
      return res.status(422).json({ message: "Invalid Code" });
    }

    // Generar nuevo token con verified=true
    const newToken = jsonwebtoken.sign(
      {
        email: decoded.email,
        code: decoded.code,
        userType: decoded.userType,
        verified: true,
      },
      config.JWT.secret,
      { expiresIn: "20m" }
    );

    res.cookie("tokenRecoveryCode", newToken, {
      maxAge: 20 * 60 * 1000,
      httpOnly: true,
      sameSite: "None",
      secure: true,
    });

    res.json({ message: "Code verified successfully" });
  } catch (error) {
    console.error("Error en verifiedCode:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// CAMBIAR LA CONTRASEÑA -------------------------------------------------------------------------------
passwordRecoveryController.newPassword = async (req, res) => {
  const { newPassword } = req.body;

  try {
    const token = req.cookies.tokenRecoveryCode;
    if (!token) {
      return res.status(401).json({ message: "Token not found" });
    }

    const decoded = jsonwebtoken.verify(token, config.JWT.secret);

    if (!decoded.verified) {
      return res.status(403).json({ message: "Code not verified" });
    }

    const { email, userType } = decoded;

    // Encriptar la nueva contraseña
    const hashedPassword = await bcryptjs.hash(newPassword, 10);

    // Actualizar contraseña en base al tipo de usuario
    if (userType === "customer") {
      await customersModel.findOneAndUpdate(
        { email },
        { password: hashedPassword }
      );
    } else if (userType === "distributor") {
      await distributorsModel.findOneAndUpdate(
        { email },
        { password: hashedPassword }
      );
    }

    // Limpiar la cookie del token de recuperación
    res.clearCookie("tokenRecoveryCode");

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Error en newPassword:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export default passwordRecoveryController;
