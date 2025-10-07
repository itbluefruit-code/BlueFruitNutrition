import app from "./app.js";
import "./database.js";
import { config } from "./src/config.js";

import cron from "node-cron";
import { deleteUnverifiedCustomers } from "../backend/src/jobs/deleteUnverifiedClients.js";
import { deleteUnverifiedDistributors } from "../backend/src/jobs/deleteUnverifiedDistributors.js";


// Función que ejecuta el servidor
async function main() {
    // Iniciar servidor
    app.listen(config.server.port);
    console.log("Server running on port: " + config.server.port);

    // Iniciar cron job para eliminar usuarios no verificados cada 2 horas

    cron.schedule("0 */2 * * *", () => {
        console.log("Ejecutando limpieza de usuarios no verificados...");
        deleteUnverifiedCustomers();
      });

      cron.schedule("0 */2 * * *", () => {
        console.log("⏰ Ejecutando limpieza de distribuidores no verificados...");
        deleteUnverifiedDistributors();
    });
}

main();
