const distributorsController = {};
import distributorsModel from "../models/Distributors.js";

// SELECT
distributorsController.getDistributors = async (req, res) => {
  try {
    const distributor = await distributorsModel.find();
    res.status(200).json(distributor);
  } catch (error) {
    console.log("Error en getDistributors:", error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// INSERT
distributorsController.postDistributors = async (req, res) => {
  try {
    const { companyName, email, password, address, phone, status, NIT, verified } = req.body;

    // validar campos
    if (!companyName || !email || !password || !phone || !address || !status || !NIT) {
      return res.status(400).json({ message: 'Faltan campos obligatorios' });
    }

    const newDistributor = new distributorsModel({ companyName, email, password, address, phone, status, NIT, verified });
    await newDistributor.save();
    res.status(201).json({ message: "Distributor registrado correctamente" });

  } catch (error) {
    console.log("Error en postDistributors:", error);

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ message: messages.join(', ') });
    }

    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(400).json({ message: `Ya existe un distribuidor con ese ${field}` });
    }

    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// DELETE
distributorsController.deleteDistributors = async (req, res) => {
  try {
    await distributorsModel.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Distributor eliminado" });
  } catch (error) {
    console.log("Error en deleteDistributors:", error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// UPDATE
distributorsController.putDistributors = async (req, res) => {
  try {
    const { companyName, email, password, address, phone, status, NIT, verified } = req.body;
    const updateDistributor = await distributorsModel.findByIdAndUpdate(
      req.params.id,
      { companyName, email, password, address, phone, status, NIT, verified },
      { new: true }
    );
    res.status(200).json({ message: "Distributor updated" });
  } catch (error) {
    console.log("Error en putDistributors:", error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export default distributorsController;

