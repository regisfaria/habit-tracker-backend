import Fastify from "fastify";

const app = Fastify();

app.get("/", () => {
  console.log("hello world");
});

app.listen({ port: 3333 });
