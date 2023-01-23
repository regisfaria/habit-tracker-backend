import { FastifyInstance } from "fastify";
import { z } from "zod";

import { prisma } from "../lib/prisma";

export async function summaryRoutes(app: FastifyInstance) {
  app.get("/summary", async (request) => {
    const summaryParams = z.object({
      userId: z.string(),
    });

    const { userId } = summaryParams.parse(request.query);

    // FYI: I'll use a SQL Raw query in order to achieve this summary
    // meaning that the Prisma BD compatibility maybe won't work for this endpoint
    // in case we use something different than SQLite
    const summary = await prisma.$queryRaw`
      SELECT
        D.id,
        D.date,
        (
          SELECT
            cast(count(*) AS FLOAT)
          FROM day_habits DH
          WHERE DH.day_id = D.id
        ) AS completed,
        (
          SELECT
            cast(count(*) AS FLOAT)
          FROM habit_week_days HWD
          JOIN habits H
            ON H.id = HWD.habit_id
          WHERE
            HWD.week_day = cast(strftime('%w', D.date/1000.0, 'unixepoch') AS INT)
            AND H.created_at <= D.date
        ) AS amount
      FROM days D
      WHERE D.user_id = ${userId}
    `;

    return summary;
  });
}
