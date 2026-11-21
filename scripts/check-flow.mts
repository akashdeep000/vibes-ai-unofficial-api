import { autoSession } from "../src/auth/auto-login.js";
import { VibesClient } from "../src/client.js";

const client = new VibesClient({ session: autoSession() });
const me = (await client.auth.me()).user;
console.log("[live] still logged in:", me.username);
const token = await client.auth.checkToken();
console.log("[live] checkToken:", token.user.id);
