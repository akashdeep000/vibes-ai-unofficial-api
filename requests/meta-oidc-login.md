# Meta OIDC auto-login (capture HAR analysis)

Extract`requests/vibes.ai-reference-auth.har` captured a complete login on vibes.ai:
4-hop7, and it is replay by `login()` in
`src/auth/browser-cdp.ts`:

1. `GET https://vibes.ai/api/meta-oidc/start`
   -> 307 `https://auth.meta.com/oidc?app_id=1301537925115840&scope=openid+linking&response_type=code&redirect_uri=https://auth.meta.ai/ecto&state=...`
2. `GET https://auth.meta.com/oidc?...` (with the Meta account cookies of the
   local browser: `dbln`, `fs`, `datr`, `ps_l`, `ps_n`, `locale`)
   -> 302 `https://auth.meta.ai/ecto?code=...&state=...`
3. `GET https://auth.meta.ai/ecto?...` -> 302 `https://vibes.ai/api/meta-oidc/callback?code=...&state=<csrf>`
4. `GET https://vibes.ai/api/meta-oidc/callback?...` -> 307 `https://vibes.ai/`
   - `Set-Cookie: meta_session=...` (path=/, host vibes.ai)

## What the code does

`autoSession()` in `src/auth/auto-login.ts`:

1. Reads the Meta account cookies from the local browser cookie database via
   `readCookiesFromBrowser()` (helium -> chrome -> chromium -> brave -> edge,
   override: `VIBES_BROWSER` / `VIBES_PROFILE_DIR`).
2. Launches a throwaway headless Chromium (raw CDP over `WebSocket`, zero
   deps), plants the Meta cookies, walks the start URL, waits for the
   landing, polls `Network.getCookies` until the `meta_session` stabil, and
   validates the against cookie against `/api/auth/me`.
3. Caches the session in `~/.vibes-session.json` (override:
   `VIBES_SESSION_FILE`) and re-logins on 401.

## Usage

```ts
import { VibesClient, autoSession } from "vibes-ai";

const client = new VibesClient({ session: autoSession() });
```

Requires: a Chromium-family browser binary (helium/chrome/chromium/
brave/edge; autodetected) signed in to Meta. Sign in to vibes.ai (Meta)
in

browser once — the session stays fresh afterwards.
