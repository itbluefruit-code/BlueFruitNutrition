import app from "./app.js";
import "./database.js";
import { config } from "./src/config.js";

import cron from "node-cron";
import { deleteUnverifiedCustomers } from "./src/jobs/deleteUnverifiedCustomers.js";
import { deleteUnverifiedDistributors } from "./src/jobs/deleteUnverifiedDistributors.js";


// Función que ejecuta el servidor
async function main() {
    // Iniciar servidor
    app.listen(config.server.port);
    console.log("Server running on port: " + config.server.port);

    // Iniciar cron job para eliminar usuarios no verificados cada 2 horas
// Cada 2 minutos (poner 0 */2 * * * para cada 2 horas)
cron.schedule("*/2 * * * *", async () => {
    try {
        console.log("Ejecutando limpieza de usuarios no verificados...");
        await deleteUnverifiedCustomers();
    } catch (error) {
        console.error("Error eliminando customers:", error);
    }
});

cron.schedule("*/2 * * * *", async () => {
    try {
        console.log("⏰ Ejecutando limpieza de distribuidores no verificados...");
        await deleteUnverifiedDistributors();
    } catch (error) {
        console.error("Error eliminando distributors:", error);
    }
});

}

main();
