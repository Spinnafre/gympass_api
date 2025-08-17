import fastify from "fastify";
import { appRoutes } from "./http/routes";
import z, { ZodError } from "zod";
import { env } from "./config/env";

export const app = fastify({
  logger: true,
});

app.register(appRoutes);

app.setErrorHandler((err, _, res) => {
  if (err instanceof ZodError) {
    return res.status(400).send({
      message: z.treeifyError(err),
      code: "ValidationError",
    });
  }

  if (env.NODE_ENV != "prod") {
    console.error(err);
  }

  return res.status(500).send({
    message: "Internal Server Error",
  });
});
