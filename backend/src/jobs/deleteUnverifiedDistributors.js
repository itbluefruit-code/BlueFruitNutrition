import distributorModel from "../models/Distributors.js";

export async function deleteUnverifiedDistributors() {
  const now = new Date();

  try {
    const result = await distributorModel.deleteMany({
      verified: { $eq: false },               // Solo elimina los no verificados
      expireAt: { $exists: true, $lte: now }, // Solo si expireAt existe y ya expiró
    });

    if (result.deletedCount > 0) {
      console.log(`🧹 ${result.deletedCount} distribuidores no verificados eliminados`);
    } else {
      console.log("✅ No hay distribuidores no verificados para eliminar.");
    }
  } catch (error) {
    console.error("❌ Error eliminando distribuidores no verificados:", error);
  }
}
