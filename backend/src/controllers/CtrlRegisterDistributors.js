import jsonwebtoken from "jsonwebtoken";
import bcrypt from "bcryptjs";
import fetch from "node-fetch";

import distributorModel from "../models/Distributors.js";
import customersModel from "../models/Customers.js";
import { config } from "../config.js";

const apiKey = config.apiKey.api_key;

const registerDistributorController = {};

registerDistributorController.register = async (req, res) => {
  const { companyName, email, password, address, phone, status, NIT, isVerified } = req.body;

  if (!companyName || !email || !password || !address || !phone || !NIT) {
    return res.status(400).json({ message: "Ingrese campos obligatorios" });
  }

  try {
    // Verificar si el email ya existe como distribuidor
    const existingDistributor = await distributorModel.findOne({ email });
    if (existingDistributor) {
      console.log("Intento de registro con email ya registrado como distribuidor:", email);
      return res.status(400).json({ message: "Distributor already exist" });
    }

    // Verificar si el email ya existe como cliente
    const existingCustomer = await customersModel.findOne({ email });
    if (existingCustomer) {
      console.log("Intento de registro con email ya registrado como cliente:", email);
      return res.status(400).json({ message: "Ya existe un cliente registrado con este correo" });
    }

    // Encriptar la contraseña
    const passwordHash = await bcrypt.hash(password, 10);

    const newDistributor = new distributorModel({
      companyName,
      email,
      password: passwordHash,
      address,
      phone,
      status,
      NIT,
      isVerified,
    });

    await newDistributor.save();

    // GENERAR UN CÓDIGO ALEATORIO
    const verificationCode = Math.floor(10000 + Math.random() * 90000).toString();

    // Generar un token con el código
    const tokenCode = jsonwebtoken.sign(
      { email, verificationCode },
      config.JWT.secret,
      { expiresIn: "2h" }
    );

    // Configurar cookie según entorno
    const isProduction = process.env.NODE_ENV === "production";

res.cookie("verificationToken", tokenCode, {
  httpOnly: true,
  sameSite: "None",  // ✅ Correcto para frontend y backend en dominios distintos
  secure: true,      // ✅ Obligatorio si usas sameSite: "None"
  maxAge: 2 * 60 * 60 * 1000,
});


    // ENVIAR CORREO CON BREVO API
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        accept: "application/json",
        "api-key": apiKey,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        sender: { name: "Blue Fruit Nutrition", email: config.email.email_user },
        to: [{ email: email, name: companyName }],
        subject: "Verificar Correo - Distribuidor",
        htmlContent: `<p>Para verificar su correo utiliza el siguiente código: <b>${verificationCode}</b></p>
                      <p>Este código expira en 2 horas.</p>`,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Error Brevo:", errorData);
      return res.status(400).json({ message: "Error enviando el correo" });
    }

    res.status(201).json({ message: "Distributor registered, please verify your email with the code" });

  } catch (error) {
    console.log("error", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// VERIFICAR CÓDIGO
registerDistributorController.verificationCode = async (req, res) => {
  const { requireCode } = req.body;
  const token = req.cookies.verificationToken;

  try {
    const decoded = jsonwebtoken.verify(token, config.JWT.secret);
    const { email, verificationCode: storedCode } = decoded;

    if (requireCode !== storedCode) {
      return res.status(422).json({ message: "Invalid code" });
    }

    const distributor = await distributorModel.findOne({ email });
    if (!distributor) {
      return res.status(404).json({ message: "Distribuidor no encontrado para verificación" });
    }

    distributor.isVerified = true;
    await distributor.save();

    res.clearCookie("verificationToken");
    res.status(200).json({ message: "Email verified successfully" });
  } catch (error) {
    console.log("error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export default registerDistributorController;
