import "dotenv/config";
import Fastify from "fastify";
import cors from "@fastify/cors";

import { appRoutes } from "./routes";

const app = Fastify();

app.register(cors);
app.register(appRoutes);

app
  .listen({ port: Number(process.env.APP_PORT) })
  .then(() =>
    console.log(`🚀 Server running on port ${process.env.APP_PORT} ! 🚀`)
  );
