import jsonwebtoken from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import fetch from "node-fetch";

import customersModel from "../models/Customers.js";
import distributorModel from "../models/Distributors.js";
import { config } from "../config.js";
const apiKey = config.apiKey.api_key;

const registerCustomersController = {};

registerCustomersController.register = async (req, res) => {
  try {
    let { name, lastName, email, password, phone, weight, dateBirth, height, address, gender, idSports, isVerified } = req.body;

    if (!name || !lastName || !email || !password || !dateBirth || !address || !gender) {
      return res.status(400).json({ message: "Ingrese campos obligatorios" });
    }

    weight = weight ? Number(weight) : undefined;
    height = height ? Number(height) : undefined;

    if (height && height > 300) return res.status(400).json({ message: "Ingrese una altura válida" });
    if (weight && weight > 300) return res.status(400).json({ message: "Ingrese un peso válido" });

    const existingDistributor = await distributorModel.findOne({ email });
    if (existingDistributor) return res.status(400).json({ message: "Ya existe un distribuidor con este correo" });

    const existingCustomer = await customersModel.findOne({ email });
    if (existingCustomer) return res.status(400).json({ message: "Customer already exist" });

    const passwordHash = await bcrypt.hash(password, 10);

    const newCustomer = new customersModel({
      name, lastName, email, password: passwordHash, phone, weight, dateBirth, height, address, gender, idSports, isVerified
    });

    await newCustomer.save();

    const verificationCode = Math.floor(10000 + Math.random() * 90000).toString();
    const tokenCode = jsonwebtoken.sign({ email, verificationCode }, config.JWT.secret, { expiresIn: "2h" });

    res.cookie("verificationToken", tokenCode, { httpOnly: true });

    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        accept: "application/json",
        "api-key": apiKey,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        sender: { name: "Blue Fruit Nutrition", email: config.email.email_user },
        to: [{ email, name }],
        subject: "Verificar Correo",
        htmlContent: `<p>Para verificar su correo utiliza el siguiente código: <b>${verificationCode}</b></p><p>Este código expira en 2 horas.</p>`
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Error Brevo:", errorData);
      return res.status(400).json({ message: "Error enviando el correo" });
    }

    res.status(201).json({ message: "Customer registered, please verify your email with the code" });

  } catch (error) {
    console.error("Error en registerCustomersController.register:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

registerCustomersController.verificationCode = async (req, res) => {
  const { requireCode } = req.body;
  const token = req.cookies.verificationToken;

  try {
    const decoded = jsonwebtoken.verify(token, config.JWT.secret);
    const { email, verificationCode: storedCode } = decoded;

    if (requireCode !== storedCode) return res.status(422).json({ message: "Invalid code" });

    const customer = await customersModel.findOne({ email });
    if (!customer) return res.status(404).json({ message: "Cliente no encontrado para verificación" });

    customer.isVerified = true;
    await customer.save();

    res.clearCookie("verificationToken");
    res.status(200).json({ message: "Email verified successfully" });
  } catch (error) {
    console.error("Error en verificationCode:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export default registerCustomersController;