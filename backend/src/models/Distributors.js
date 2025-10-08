import { Schema, model } from "mongoose";

const DistributorsSchema = new Schema(
  {
    companyName: { type: String, required: true },
    email: {
      type: String,
      required: true,
      unique: true,
      match: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z]{2,6}$/,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      maxlength: 100,
      validate: {
        validator: function (value) {
          return /[!@#$%^&*(),.?":{}|<>]/.test(value); // al menos un carácter especial
        },
        message: "La contraseña debe contener al menos un carácter especial.",
      },
    },
    address: { type: String, required: true },
    phone: {
      type: String,
      required: true,
      unique: true,
      match: [/^[0-9]{8}$/, "El número de teléfono debe tener 8 dígitos válidos"],
    },
    NIT: {
      type: String,
      required: true,
      unique: true,
      match: [/^[A-Z0-9\-]{5,20}$/, "El NIT debe tener entre 5 y 20 caracteres válidos"],
    },
    status: { type: Boolean, required: true, default: true },
    verified: { type: Boolean, default: false, required: true },
    verificationToken: { type: String },
    expireAt: {
      type: Date,
      default: () => new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 horas 2 * 60 * 60 * 1000
    },
  },
  { timestamps: true, strict: true }
);

// TTL index solo para distribuidores no verificados
DistributorsSchema.index(
  { expireAt: 1 },
  { expireAfterSeconds: 0, partialFilterExpression: { verified: false } }
);

export default model("Distributor", DistributorsSchema);
