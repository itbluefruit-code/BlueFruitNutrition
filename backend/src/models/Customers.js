import { Schema, model } from "mongoose";

const customersSchema = new Schema(
  {
    name: { type: String, required: true },
    lastName: { type: String, required: true },

    email: {
      type: String,
      required: true,
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
          return /[!@#$%^&*(),.?":{}|<>]/.test(value);
        },
        message: "La contraseña debe contener al menos un carácter especial.",
      },
    },

    phone: {
      type: String,
      required: false,
      match: [/^[0-9]{8}$/, "El número de teléfono tiene que ser válido"],
    },

    weight: { type: Number, min: 10, max: 300, default: null },
    height: { type: Number, min: 100, max: 300, default: null },

    dateBirth: {
      type: Date,
      required: true,
      validate: {
        validator: function (value) {
          const today = new Date();
          const minDate = new Date(
            today.getFullYear() - 18,
            today.getMonth(),
            today.getDate()
          );
          return value <= minDate;
        },
        message: "Debes tener al menos 18 años.",
      },
    },

    address: { type: String, required: false, default: null },
    gender: { type: String, required: false, default: null },

    idSports: { type: Schema.Types.ObjectId, ref: "Sport", required: false, default: null },

    // Verificación de correo
    verified: { type: Boolean, default: false },
    verificationToken: { type: String, required: false },

    expireAt: {
      type: Date,
      default: function () {
        return new Date(Date.now() + 2 * 60 * 60 * 1000);
      },
      index: { expires: 0 },
    },
  },
  { timestamps: true, strict: false }
);

export default model("Customer", customersSchema);
