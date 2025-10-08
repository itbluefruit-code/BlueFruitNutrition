import customersModel from "../models/Customers.js";
import bcrypt from "bcryptjs";
import jsonwebtoken from "jsonwebtoken";
import fetch from "node-fetch";
import { config } from "../config.js";

const apiKey = config.apiKey.api_key;

const customersController = {};

// REGISTER / INSERT (con verificación y hash de contraseña)
customersController.register = async (req, res) => {
  try {
    let { name, lastName, email, password, phone, weight, dateBirth, height, address, gender, idSports } = req.body;

    if (!name || !lastName || !email || !password || !dateBirth) {
      return res.status(400).json({ message: "Ingrese campos obligatorios" });
    }

    weight = weight ? Number(weight) : null;
    height = height ? Number(height) : null;
    address = address || "No especificado";
    gender = gender || "Otro";
    phone = phone || "00000000";

    if (height && (height < 100 || height > 300)) return res.status(400).json({ message: "Ingrese una altura válida" });
    if (weight && (weight < 10 || weight > 300)) return res.status(400).json({ message: "Ingrese un peso válido" });

    const existingCustomer = await customersModel.findOne({ email });
    if (existingCustomer) return res.status(400).json({ message: "Ya existe un cliente con este correo" });

    const passwordHash = await bcrypt.hash(password, 10);

    const newCustomer = new customersModel({
      name,
      lastName,
      email,
      password: passwordHash,
      phone,
      weight,
      dateBirth,
      height,
      address,
      gender,
      idSports,
      verified: false
    });

    await newCustomer.save();

    // Generar código de verificación
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const tokenCode = jsonwebtoken.sign({ email, verificationCode }, config.JWT.secret, { expiresIn: "2h" });
    res.cookie("verificationToken", tokenCode, { httpOnly: true });

    // Enviar correo
    try {
      await fetch("https://api.brevo.com/v3/smtp/email", {
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
    } catch (err) {
      console.error("Error enviando correo:", err);
    }

    res.status(201).json({ message: "Cliente registrado, verifica tu correo con el código" });

  } catch (error) {
    console.error("Error en customersController.register:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// GET ALL
customersController.getCustomers = async (req, res) => {
  try {
    const customer = await customersModel.find();
    res.status(200).json(customer);
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
    console.log("error: " + error);
  }
};

// DELETE
customersController.deleteCustomers = async (req, res) => {
  try {
    await customersModel.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "customer deleted" });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
    console.log("error: " + error);
  }
};

// UPDATE
customersController.putCustomers = async (req, res) => {
  try {
    const { name, lastName, email, password, phone, weight, dateBirth, height, address, gender, idSports, verified } = req.body;

    const updateData = { name, lastName, email, phone, weight, dateBirth, height, address, gender, idSports };

    // Si se proporciona contraseña nueva, hashearla
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const updateCustomer = await customersModel.findByIdAndUpdate(req.params.id, updateData, { new: true });

    res.status(200).json({ message: "customer updated" });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
    console.log("error: " + error);
  }
};

export default customersController;
