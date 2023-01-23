import { FastifyInstance } from "fastify";
import { dayRoutes } from "./routes/day.route";
import { habitRoutes } from "./routes/habit.route";
import { summaryRoutes } from "./routes/summary.routes";

export async function appRoutes(app: FastifyInstance) {
  app.register(habitRoutes);
  app.register(dayRoutes);
  app.register(summaryRoutes);
}
