import { FastifyInstance } from "fastify";
import { dayRoutes } from "./day.route";
import { habitRoutes } from "./habit.route";
import { summaryRoutes } from "./summary.routes";

export default async function appRoutes(app: FastifyInstance) {
  app.register(habitRoutes);
  app.register(dayRoutes);
  app.register(summaryRoutes);
}
