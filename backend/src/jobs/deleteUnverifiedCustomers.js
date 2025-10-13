import customersModel from "../models/Customers.js";

export async function deleteUnverifiedCustomers() {
  const now = new Date();

  try {
    const result = await customersModel.deleteMany({
      verified: { $eq: false },               // Solo los no verificados
      expireAt: { $exists: true, $lte: now }, // Solo si expireAt existe y ya pasó
    });

    if (result.deletedCount > 0) {
      console.log(`🧹 ${result.deletedCount} usuarios no verificados eliminados`);
    } else {
      console.log("✅ No hay usuarios no verificados para eliminar.");
    }
  } catch (error) {
    console.error("❌ Error eliminando usuarios no verificados:", error);
  }
}
