/*fields:
    companyName, email, password, address, phone, status, NIT
*/

import { Schema, model } from "mongoose";

const DistributorsSchema = new Schema({
    companyName: {
        type: String,
        require: true
    },

    email: {
        type: String,
        require: true,
        unique: true,
        match:[
            /^[a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z]{2,6}$/,
            "Por favor ingrese un correo electronico valido", //validar el correo
        ],
    },

password: {
  type: String,
  required: true,
  minlength: 6,
  maxlength: 100,
  validate: {
    validator: function (value) {
      return /[!@#$%^&*(),.?":{}|<>]/.test(value); //esta funcion hace que el correo necesite como minimo un caracter especial
    },
    message: "La contraseña debe contener al menos un carácter especial."
  }
},

    address: {
        type: String,
        require: true
    },


    phone: {
        type: String,
        require: true,
        unique: true,
        match: [/^[0-9]{8}$/, 
                "el numero de teléfono tiene que ser válido"] //validar número de teléfono
    },

    NIT: {
        type: String,
        required: true,
        unique: true,
       /* validate: {
        validator: function (v) {
            // Ejemplo de validación para un NIT (formato genérico)
            return /^[A-Z0-9\-]{5,20}$/.test(v);
        },*/

    },
    
    status: { //para saber si el usuario es valido y puede entrar
        type: Boolean,
        require: true
    },

            // Verificación
    isVerified: { 
        type: Boolean,
         default: false 
        },

    //Expiración automática si no se verifica
    expireAt: {
        type: Date,
        default: function () {
            return new Date(Date.now() + 2*60*60*1000); // 2 HORAS
        },
        index: { expires: 0 } 
    }

    },
    
    {
        timestamps: true,
        strict: false
    })

export default model("Distributors", DistributorsSchema);