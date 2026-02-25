import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "./src/lib/auth";
const handlers = toNextJsHandler(auth);
console.log("Exports:", Object.keys(handlers));
