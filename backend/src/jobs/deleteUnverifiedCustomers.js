import customersModel from "../models/Customers.js";

export async function deleteUnverifiedCustomers() {
  const now = new Date();

  try {
    const result = await customersModel.deleteMany({
      verified: false,
      expireAt: { $lte: now },
    });

    if (result.deletedCount > 0) {
      console.log(`🧹 ${result.deletedCount} usuarios no verificados eliminados`);
    }
  } catch (error) {
    console.error("❌ Error eliminando usuarios no verificados:", error);
  }
}
