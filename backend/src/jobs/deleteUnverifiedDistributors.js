import distributorModel from "../models/Distributors.js";

export async function deleteUnverifiedDistributors() {
  const now = new Date();

  try {
    const result = await distributorModel.deleteMany({
      verified: false,
      expireAt: { $lte: now },
    });

    if (result.deletedCount > 0) {
      console.log(`🧹 ${result.deletedCount} distribuidores no verificados eliminados`);
    }
  } catch (error) {
    console.error("Error eliminando distribuidores no verificados:", error);
  }
}
