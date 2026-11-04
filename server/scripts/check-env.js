import "dotenv/config";
import { validateMongoUri } from "../db.js";

try {
  const uri = validateMongoUri(process.env.MONGODB_URI);
  const parsed = new URL(uri);
  const protocol = parsed.protocol;
  const hostname = parsed.hostname;
  const authority = uri.match(/^mongodb(?:\+srv)?:\/\/([^/?#]*)/i)?.[1] || "";
  const atCount = (authority.match(/@/g) || []).length;

  console.log("MongoDB environment check passed.");
  console.log(`Protocol: ${protocol}`);
  console.log(`Hostname: ${hostname}`);
  console.log(`Credential separator @ count: ${atCount}`);
  console.log("Credentials: hidden");
  console.log("Note: this checks URI syntax only; it does not connect to Atlas.");
} catch (error) {
  console.error("MongoDB environment check failed:");
  console.error(error.message);
  process.exitCode = 1;
}
