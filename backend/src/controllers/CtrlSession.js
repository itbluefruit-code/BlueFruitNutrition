// src/controllers/CtrlSession.js
import jwt from "jsonwebtoken";
import { config } from "../config.js";

export const checkSession = (req, res) => {
  try {
    const token = req.cookies.authToken;
    if (!token) return res.status(401).json({ message: "No autenticado" });

    const decoded = jwt.verify(token, config.JWT.secret);

    return res.json({
      id: decoded.id,
      email: decoded.email,
      name: decoded.name,
      role: decoded.role,
      isAuthenticated: true,
    });
  } catch (error) {
    console.error("Error en checkSession:", error);
    return res.status(401).json({ message: "Sesión inválida" });
  }
};
