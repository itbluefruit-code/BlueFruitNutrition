const customersController = {};
import customersModel from "../models/Customers.js";

//SELECT*******************************************************************
customersController.getCustomers = async (req, res) => {
    try {
        const customer = await customersModel.find();
        res.status(200).json(customer);
    } catch (error) {
        console.log("Error en getCustomers:", error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

//INSERT*******************************************************************
customersController.postCustomers = async (req, res) => {
    try {
        let { name, lastName, email, password, phone, weight, dateBirth, height, address, gender, idSports, isVerified } = req.body;

        // Validar campos obligatorios
        if (!name || !lastName || !email || !password || !dateBirth || !address || !gender) {
            return res.status(400).json({ message: 'Faltan campos obligatorios' });
        }

        // Convertir a números
        weight = weight ? Number(weight) : undefined;
        height = height ? Number(height) : undefined;

        // Validar rangos
        if (height && (height < 100 || height > 300)) {
            return res.status(400).json({ message: 'Ingrese una altura válida' });
        }
        if (weight && (weight < 10 || weight > 300)) {
            return res.status(400).json({ message: 'Ingrese un peso válido' });
        }

        // Crear nuevo customer
        const newCustomer = new customersModel({
            name, lastName, email, password, phone, weight, dateBirth, height, address, gender, idSports, isVerified
        });

        await newCustomer.save();
        res.status(201).json({ message: "Customer registrado correctamente" });

    } catch (error) {
        console.log("Error en postCustomers:", error);

        if (error.name === "ValidationError") {
            const messages = Object.values(error.errors).map(e => e.message);
            return res.status(400).json({ message: messages.join(', ') });
        }

        if (error.code === 11000) {
            const field = Object.keys(error.keyValue)[0];
            return res.status(400).json({ message: `Ya existe un usuario con ese ${field}` });
        }

        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

//DELETE*******************************************************************
customersController.deleteCustomers = async (req, res) => {
    try {
        await customersModel.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Customer eliminado" });
    } catch (error) {
        console.log("Error en deleteCustomers:", error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

//UPDATE*******************************************************************
customersController.putCustomers = async (req, res) => {
    try {
        const { name, lastName, email, password, phone, weight, dateBirth, height, address, gender, idSports, isVerified } = req.body;
        await customersModel.findByIdAndUpdate(req.params.id, {
            name, lastName, email, password, phone, weight, dateBirth, height, address, gender, idSports, isVerified
        }, { new: true });
        res.status(200).json({ message: "Customer actualizado" });
    } catch (error) {
        console.log("Error en putCustomers:", error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

export default customersController;