import { httpRouter } from "convex/server";
import { authenticateUser } from "./auth";

const http = httpRouter();

http.route({
  path: "/auth",
  method: "POST",
  handler: authenticateUser,
});

export default http;