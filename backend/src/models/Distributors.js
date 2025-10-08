import { Schema, model } from "mongoose";

const DistributorsSchema = new Schema(
  {
    companyName: {
      type: String,
      required: true, // ✅ corregido (era "require")
    },

    email: {
      type: String,
      required: true, // ✅ corregido (era "require")
      unique: true,
      match: [
        /^[a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z]{2,6}$/,
        "Por favor ingrese un correo electrónico válido",
      ],
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
      maxlength: 100,
      validate: {
        validator: function (value) {
          // exige al menos un carácter especial
          return /[!@#$%^&*(),.?":{}|<>]/.test(value);
        },
        message: "La contraseña debe contener al menos un carácter especial.",
      },
    },

    address: {
      type: String,
      required: true, // ✅ corregido (era "require")
    },

    phone: {
      type: String,
      required: true, // ✅ corregido (era "require")
      unique: true,
      match: [/^[0-9]{8}$/, "El número de teléfono debe tener 8 dígitos válidos"],
    },

    NIT: {
      type: String,
      required: true,
      unique: true,
      match: [/^[A-Z0-9\-]{5,20}$/, "El NIT debe tener entre 5 y 20 caracteres válidos"],
    },

    status: {
      type: Boolean,
      required: true, // ✅ corregido (era "require")
    },

    // Verificación
    verified: {
      type: Boolean,
      default: false,
      required: true, // ✅ para garantizar consistencia
    },

    verificationToken: {
      type: String,
      required: false,
    },

    // Expiración automática si no se verifica
    expireAt: {
      type: Date,
      default: () => new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 horas
    },
  },
  {
    timestamps: true,
    strict: true, // ✅ mejor mantener true para evitar datos inesperados
  }
);

DistributorsSchema.index({ expireAt: 1 }, { expireAfterSeconds: 0 });

export default model("Distributor", DistributorsSchema);
