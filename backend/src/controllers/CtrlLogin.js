import customersModel from "../models/Customers.js";
import distributorsModel from "../models/Distributors.js";
import bcrypt from "bcryptjs";
import jsonwebtoken from "jsonwebtoken";
import { config } from "../config.js";

const loginController = {};

const loginAttempts = {};
const MAX_ATTEMPTS = 5;
const BLOCK_TIME_MS = 10 * 60 * 1000;

loginController.login = async (req, res) => {
  const { email, password } = req.body;
  const now = Date.now();

  const attemptData = loginAttempts[email];
  if (attemptData) {
    if (
      attemptData.attempts >= MAX_ATTEMPTS &&
      now - attemptData.lastAttempt < BLOCK_TIME_MS
    ) {
      const remainingTime = Math.ceil(
        (BLOCK_TIME_MS - (now - attemptData.lastAttempt)) / 60000
      );
      return res.status(429).json({
        message: `Demasiados intentos. Intenta en ${remainingTime} minutos.`,
      });
    } else if (now - attemptData.lastAttempt >= BLOCK_TIME_MS) {
      loginAttempts[email] = { attempts: 0, lastAttempt: now };
    }
  }

  try {
    let userFound;
    let userType;

    console.log("Intentando iniciar sesión con:", email);

    if (
      email === config.emailAdmin.email &&
      password === config.emailAdmin.password
    ) {
      userType = "admin";
      console.log("Login de administrador exitoso");

      // ✅ Usar un ID único generado en lugar de "adminId"
      userFound = {
        _id: "507f1f77bcf86cd799439011", // ID válido de MongoDB para admin
        email: config.emailAdmin.email,
        name: "Administrador"
      };
    } else {
      userFound = await distributorsModel.findOne({ email });
      userType = "distributor";

      if (!userFound) {
        userFound = await customersModel.findOne({ email });
        userType = "customer";
      }
    }

    if (!userFound) {
      recordFailedAttempt(email, now);
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    if (userType !== "admin") {
      const isMatch = await bcrypt.compare(password, userFound.password);
      if (!isMatch) {
        recordFailedAttempt(email, now);
        const remaining = MAX_ATTEMPTS - (loginAttempts[email]?.attempts || 1);
        return res.status(401).json({
          message: `Contraseña incorrecta. Te quedan ${remaining} intentos.`,
        });
      }
    }

    if (loginAttempts[email]) delete loginAttempts[email];

    // ✅ Incluir name en el token
    const tokenPayload = {
      id: userFound._id,
      email: userFound.email || email,
      name: userFound.name || userFound.companyName || "Usuario",
      userType,
      role: userType
    };

    const token = jsonwebtoken.sign(
      tokenPayload,
      config.JWT.secret,
      { expiresIn: config.JWT.expiresIn }
    );

 res.cookie("authToken", token, {
 
});

    console.log("Cookie authToken establecida");

    const userData = {
      id: userFound._id,
      email: userFound.email || email,
      name: userFound.name || userFound.companyName || "Usuario",
      role: userType,
      isAuthenticated: true
    };
    
    console.log("Usuario autenticado:", userData.name);

    return res.json({
      message: "Login exitoso",
      role: userType,
      user: userData,
      namek: userData.name,
      token: token
    });

  } catch (error) {
    console.error("Error en login:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

function recordFailedAttempt(email, now) {
  if (!loginAttempts[email]) {
    loginAttempts[email] = { attempts: 1, lastAttempt: now };
  } else {
    loginAttempts[email].attempts += 1;
    loginAttempts[email].lastAttempt = now;
  }
}

export default loginController;