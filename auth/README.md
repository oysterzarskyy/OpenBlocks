# OpenBlocks auth Worker

This Cloudflare Worker is a starter API for email accounts backed by D1. It is intentionally **disabled by default** (`AUTH_ENABLED = "false"`); the app and website should remain guest-only until the full release is ready.

## Set up your D1 database

From this directory, create a database and copy the returned ID into `wrangler.jsonc`:

```sh
npx wrangler d1 create openblocks-auth
```

Replace `REPLACE_WITH_D1_DATABASE_ID` with the actual `database_id`. The ID is configuration, not a password. Set `ALLOWED_ORIGIN` to the exact HTTPS origin that will call this Worker (for example, your production website origin). Prefer putting the Worker behind a same-site custom domain such as `api.your-domain.example`.

Install Wrangler and apply the migration locally:

```sh
npm install
npm run db:migrate:local
npm run dev
```

For production, apply the schema to the remote database before deploying:

```sh
npm run db:migrate:remote
npm run deploy
```

## API scaffold

- `POST /api/v1/signup` — creates an account and starts a session.
- `POST /api/v1/login` — verifies credentials and starts a session.
- `GET /api/v1/me` — returns the session's user.
- `POST /api/v1/logout` — revokes the session and clears its cookie.
- `GET /health` — public health check.

Passwords are processed in the Worker with PBKDF2-HMAC-SHA-256 (600,000 iterations) and a per-user random salt. D1 stores only the salt/hash and SHA-256 hashes of random session tokens; session cookies are `HttpOnly`, `Secure`, and `SameSite=Strict`. Queries use bound prepared-statement parameters.

## Before enabling accounts

1. Keep `AUTH_ENABLED` false until the UI is intentionally released and the API origin is configured.
2. Add Cloudflare rate limits for signup/login, email verification, password reset, and account-abuse monitoring before public launch.
3. Use HTTPS and configure the site and API on the same registrable domain when possible; set `ALLOWED_ORIGIN` to the exact site origin.
4. Test signup, login, logout, session expiry, and CORS using a non-production D1 database first.

The Rust app and static website do not call these endpoints yet, and their email controls remain disabled. No database ID, API token, or password secret is checked into this repository.
