import jwt from "jsonwebtoken";
import { config } from "../config.js";

// Verifica que el usuario esté autenticado
export const authenticate = (req, res, next) => {
  const token = req.cookies?.authToken;

  if (!token) {
    console.log("❌ No hay token de sesión");
    return res.status(401).json({ message: "No autenticado" });
  }

  try {
    const decoded = jwt.verify(token, config.JWT.secret);

    // Guardamos info del usuario en req.user
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      name: decoded.name,
      ...decoded,
    };

    console.log("✅ Usuario autenticado:", req.user.email);
    next();
  } catch (error) {
    console.log("❌ Token inválido o expirado:", error.message);
    return res.status(401).json({ message: "Token inválido o expirado" });
  }
};

// Verifica que el usuario sea admin
export const requireAdmin = (req, res, next) => {
  if (!req.user) {
    console.log("❌ Intento de acceso sin autenticación");
    return res.status(401).json({ message: "No autenticado" });
  }

  if (req.user.role !== "admin") {
    console.log("❌ Acceso denegado - no es admin");
    return res.status(403).json({ message: "Acceso denegado" });
  }

  console.log("✅ Usuario es admin:", req.user.email);
  next();
};
