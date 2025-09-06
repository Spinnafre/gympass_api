import fastify from "fastify";
import { appRoutes } from "./http/routes";
import z, { ZodError } from "zod";
import { env } from "./config/env";
import fastifyJwt from "@fastify/jwt";
import fastifyCookie from "@fastify/cookie";
import { ResourceNotFoundError } from "./services/errors/resource-not-found.error";
import { gymRoutes } from "./http/routes/gym.routes";
import { checkInRoutes } from "./http/routes/checkIn.routes";

export const app = fastify({
  logger: env.NODE_ENV == "test" ? false : true,
});

app.register(fastifyJwt, {
  secret: env.JWT_SECRET,
  cookie: {
    signed: false,
    cookieName: "refresh-token",
  },
});

app.register(fastifyCookie);

app.register(appRoutes);
app.register(gymRoutes);
app.register(checkInRoutes);

app.setErrorHandler((err, _, res) => {
  if (err instanceof ZodError) {
    return res.status(400).send({
      message: z.treeifyError(err),
      code: "ValidationError",
    });
  }
  if (err instanceof ResourceNotFoundError) {
    return res.status(404).send({
      message: err.message,
      code: err.name,
    });
  }

  if (env.NODE_ENV != "prod") {
    console.error(err);
  }

  return res.status(500).send({
    message: "Internal Server Error",
  });
});
