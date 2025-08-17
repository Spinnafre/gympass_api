import { app } from "@/app";
import { env } from "@/config/env";

(async function () {
  try {
    const address = await app.listen({
      host: env.HOST,
      port: env.PORT,
    });

    app.log.info(`🚀HTTP server listening in port ${address}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
})();
