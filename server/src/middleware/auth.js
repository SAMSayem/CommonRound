import { createRemoteJWKSet, jwtVerify } from "jose";

const authBaseUrl = (process.env.BETTER_AUTH_URL || "http://localhost:3000").replace(/\/$/, "");
const jwksUrl = new URL(`${authBaseUrl}/api/auth/jwks`);
const remoteJwks = createRemoteJWKSet(jwksUrl);

export async function requireAuth(req, res, next) {
  const authorization = req.headers.authorization || "";
  const [scheme, token] = authorization.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ success: false, message: "Sign in to continue." });
  }

  try {
    const { payload } = await jwtVerify(token, remoteJwks, {
      issuer: authBaseUrl,
      audience: authBaseUrl,
    });

    const userId = typeof payload.sub === "string" ? payload.sub : typeof payload.id === "string" ? payload.id : null;
    if (!userId) return res.status(401).json({ success: false, message: "The sign-in token is missing a user ID." });

    req.user = {
      id: userId,
      email: typeof payload.email === "string" ? payload.email : "",
      name: typeof payload.name === "string" ? payload.name : "Neighbour",
    };
    return next();
  } catch (error) {
    console.warn("JWT verification failed:", error.code || error.message);
    return res.status(401).json({ success: false, message: "Your session has expired. Please sign in again." });
  }
}
