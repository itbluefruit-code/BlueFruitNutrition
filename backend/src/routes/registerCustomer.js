import express from "express";
import registerCustomersController from "../controllers/CtrlRegisterCustomers.js";

const router = express.Router();

// Registrar cliente
router.route("/").post(registerCustomersController.register);

// Verificar código de email
router.route("/verifyCodeEmail").post(registerCustomersController.verificationCode);

export default router;
