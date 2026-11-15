const SESSION_COOKIE = "__Host-openblocks_session";
const SESSION_TTL_SECONDS = 7 * 24 * 60 * 60;
const PASSWORD_ITERATIONS = 600_000;
const MAX_BODY_BYTES = 4096;
const encoder = new TextEncoder();
const dummySalt = new Uint8Array(16);

class HttpError extends Error {
  constructor(status, code) {
    super(code);
    this.status = status;
    this.code = code;
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = request.headers.get("Origin");
    const originAllowed = !origin || origin === env.ALLOWED_ORIGIN;

    if (request.method === "OPTIONS") {
      if (!origin || !originAllowed) return new Response(null, { status: 403 });
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }

    if (url.pathname === "/health" && request.method === "GET") {
      return json(request, env, 200, { service: "openblocks-auth", status: "ok" });
    }
    if (!url.pathname.startsWith("/api/v1/")) {
      return json(request, env, 404, { error: "not_found" });
    }
    if (!originAllowed) return json(request, env, 403, { error: "origin_not_allowed" });
    if (env.AUTH_ENABLED !== "true") {
      return json(request, env, 503, { error: "account_access_not_enabled" });
    }
    if (!env.DB) return json(request, env, 503, { error: "database_not_configured" });

    try {
      if (url.pathname === "/api/v1/signup" && request.method === "POST") {
        return await signup(request, env);
      }
      if (url.pathname === "/api/v1/login" && request.method === "POST") {
        return await login(request, env);
      }
      if (url.pathname === "/api/v1/me" && request.method === "GET") {
        return await currentUser(request, env);
      }
      if (url.pathname === "/api/v1/logout" && request.method === "POST") {
        return await logout(request, env);
      }
      return json(request, env, 404, { error: "not_found" });
    } catch (error) {
      if (error instanceof HttpError) {
        return json(request, env, error.status, { error: error.code });
      }
      // Do not log request bodies, passwords, cookies, or database error details.
      return json(request, env, 500, { error: "internal_error" });
    }
  },
};

async function signup(request, env) {
  const body = await readJson(request);
  const email = normalizeEmail(body.email);
  const password = body.password;
  if (!isValidEmail(email) || !isValidPassword(password)) {
    return json(request, env, 400, { error: "invalid_input" });
  }

  const id = crypto.randomUUID();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const passwordHash = await hashPassword(password, salt);
  const now = Math.floor(Date.now() / 1000);
  const result = await env.DB.prepare(
    `INSERT INTO users (id, email, password_salt, password_hash, created_at)
     VALUES (?, ?, ?, ?, ?)
     ON CONFLICT(email) DO NOTHING`,
  )
    .bind(id, email, toHex(salt), passwordHash, now)
    .run();

  if (result.meta.changes === 0) {
    return json(request, env, 409, { error: "account_exists" });
  }

  const token = await createSession(env.DB, id, now);
  return json(
    request,
    env,
    201,
    { user: { id, email } },
    { "Set-Cookie": sessionCookie(token) },
  );
}

async function login(request, env) {
  const body = await readJson(request);
  const email = normalizeEmail(body.email);
  const password = body.password;
  if (
    !isValidEmail(email) ||
    typeof password !== "string" ||
    password.length === 0 ||
    encoder.encode(password).length > 128
  ) {
    return json(request, env, 400, { error: "invalid_input" });
  }

  const user = await env.DB.prepare(
    "SELECT id, email, password_salt, password_hash FROM users WHERE email = ?",
  )
    .bind(email)
    .first();

  const salt = user ? fromHex(user.password_salt) : dummySalt;
  const expected = user ? user.password_hash : "0".repeat(64);
  const actual = await hashPassword(password, salt);
  if (!user || !constantTimeEqual(actual, expected)) {
    return json(request, env, 401, { error: "invalid_credentials" });
  }

  const now = Math.floor(Date.now() / 1000);
  const token = await createSession(env.DB, user.id, now);
  return json(
    request,
    env,
    200,
    { user: { id: user.id, email: user.email } },
    { "Set-Cookie": sessionCookie(token) },
  );
}

async function currentUser(request, env) {
  const token = readSessionCookie(request.headers.get("Cookie"));
  if (!token) return json(request, env, 401, { error: "not_authenticated" });

  const tokenHash = await sha256Hex(encoder.encode(token));
  const now = Math.floor(Date.now() / 1000);
  const user = await env.DB.prepare(
    `SELECT users.id, users.email
       FROM sessions
       JOIN users ON users.id = sessions.user_id
      WHERE sessions.token_hash = ? AND sessions.expires_at > ?`,
  )
    .bind(tokenHash, now)
    .first();

  if (!user) return json(request, env, 401, { error: "not_authenticated" });
  return json(request, env, 200, { user });
}

async function logout(request, env) {
  const token = readSessionCookie(request.headers.get("Cookie"));
  if (token) {
    const tokenHash = await sha256Hex(encoder.encode(token));
    await env.DB.prepare("DELETE FROM sessions WHERE token_hash = ?")
      .bind(tokenHash)
      .run();
  }
  return json(
    request,
    env,
    200,
    { ok: true },
    { "Set-Cookie": expiredSessionCookie() },
  );
}

async function createSession(database, userId, now) {
  const token = toHex(crypto.getRandomValues(new Uint8Array(32)));
  const tokenHash = await sha256Hex(encoder.encode(token));
  const expiresAt = now + SESSION_TTL_SECONDS;

  await database
    .prepare("INSERT INTO sessions (token_hash, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)")
    .bind(tokenHash, userId, now, expiresAt)
    .run();
  await database.prepare("DELETE FROM sessions WHERE expires_at <= ?").bind(now).run();
  return token;
}

async function hashPassword(password, salt) {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt, iterations: PASSWORD_ITERATIONS },
    key,
    256,
  );
  return toHex(new Uint8Array(bits));
}

async function sha256Hex(value) {
  return toHex(new Uint8Array(await crypto.subtle.digest("SHA-256", value)));
}

function constantTimeEqual(left, right) {
  if (left.length !== right.length) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index += 1) {
    difference |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return difference === 0;
}

function readSessionCookie(cookieHeader) {
  const prefix = `${SESSION_COOKIE}=`;
  const value = cookieHeader
    ?.split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(prefix))
    ?.slice(prefix.length);
  return value && /^[a-f0-9]{64}$/.test(value) ? value : null;
}

function sessionCookie(token) {
  return `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${SESSION_TTL_SECONDS}`;
}

function expiredSessionCookie() {
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`;
}

function normalizeEmail(value) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

function isValidEmail(email) {
  return email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPassword(password) {
  return typeof password === "string" && password.length >= 12 && encoder.encode(password).length <= 128;
}

async function readJson(request) {
  if (!request.headers.get("Content-Type")?.toLowerCase().includes("application/json")) {
    throw new HttpError(415, "unsupported_media_type");
  }

  const contentLength = Number(request.headers.get("Content-Length") ?? 0);
  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
    throw new HttpError(413, "request_too_large");
  }
  if (!request.body) throw new HttpError(400, "missing_body");

  const reader = request.body.getReader();
  const chunks = [];
  let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > MAX_BODY_BYTES) {
      await reader.cancel();
      throw new HttpError(413, "request_too_large");
    }
    chunks.push(value);
  }

  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }

  let body;
  try {
    body = JSON.parse(new TextDecoder().decode(bytes));
  } catch {
    throw new HttpError(400, "invalid_json");
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new HttpError(400, "invalid_json_body");
  }
  return body;
}

function fromHex(value) {
  if (!/^(?:[a-f0-9]{2})+$/i.test(value)) throw new Error("invalid_salt");
  return Uint8Array.from(value.match(/.{2}/g), (byte) => Number.parseInt(byte, 16));
}

function toHex(bytes) {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function corsHeaders(origin) {
  return new Headers({
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "600",
    Vary: "Origin",
  });
}

function json(request, env, status, payload, extraHeaders = {}) {
  const headers = new Headers({
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
  });
  const origin = request.headers.get("Origin");
  if (origin && origin === env.ALLOWED_ORIGIN) {
    for (const [key, value] of corsHeaders(origin)) headers.set(key, value);
  }
  for (const [key, value] of Object.entries(extraHeaders)) headers.set(key, value);
  return new Response(JSON.stringify(payload), { status, headers });
}
