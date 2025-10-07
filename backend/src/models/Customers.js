import { Schema, model } from "mongoose";

const customersSchema = new Schema(
  {
    name: { type: String, required: true },
    lastName: { type: String, required: true },
    email: {
      type: String,
      required: true,
      unique: true,
      match: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z]{2,6}$/,
    },
    password: { type: String, required: true, minlength: 6 },
    phone: { type: String, match: /^[0-9]{8}$/ },
    weight: { type: Number, min: 10, max: 300, default: null },
    height: { type: Number, min: 100, max: 300, default: null },
    dateBirth: { type: Date, required: true },
    address: { type: String, default: "No especificado" },
    gender: { type: String, default: "Otro" },
    idSports: { type: Schema.Types.ObjectId, ref: "Sport", default: null },
    verified: { type: Boolean, default: false },
    verificationToken: { type: String, required: false },
    expireAt: {
      type: Date,
      default: () => new Date(Date.now() + 2 * 60 * 60 * 1000),
      index: { expires: 0 },
    },
  },
  { timestamps: true }
);

export default model("Customer", customersSchema);
