# Changelog

## Unreleased

**Single deployment, real multi-session, no SESSION_ID**: `npm start` now runs `sessions.js` (was `index.js`) — one process, one port, one deployment. It serves a pairing page at `/` (`public/index.html`): enter a WhatsApp number, get a pairing code, done. Every number paired this way is its own independent session (own connection, owner, settings) hosted from the same deployment — pair as many as you want, up to `MAX_SESSIONS` (default 25), the same way inconnu xd works. No separate session-generator deployment and no `SESSION_ID` env var are needed anymore.
  - New: `POST /api/pair`, `GET /api/status/:id`, `GET /api/stats`, `GET /api/sessions` (gate with `ADMIN_KEY`) on `sessions.js`.
  - Fixed: a fresh deploy with no `SESSION_ID` used to sit forever at a blocked interactive prompt on hosts with a pseudo-console (Pterodactyl etc.) — `/health` stuck on `"connected":false, "plugins":0`. `sessions.js` no longer auto-starts a session until one is paired, so nothing blocks.
  - `SESSION_ID` still works, unchanged, for a single legacy account via `npm run single` (`node index.js` directly).
  - Dockerfile, `docker-entrypoint.sh`, `Procfile`, `render.yaml` reference and README/DEPLOY-PANEL docs updated to `sessions.js`.

**Design**: new QUEEN AKUMA V4 look (`lib/design.js`) — `───  ❁ ǫᴜᴇᴇɴ ᴀᴋᴜᴍᴀ ᴠ4 ❁ ───` header, small-caps info rows, `── ❪ SECTION ❫ ──` blocks, `> brand` footer. It is menu style 1 (the default) and is used by the category pages, the category index, the image caption, every `*menu` shortcut, `.menulist`, `.menupreview`, `.vaultmenu`, `.ownerpanel`, `.alive`, `.profile`, `.repo`, the prefix panels, welcome/goodbye messages (and `.welcome`, `.goodbye`, `.welcometest`) and the connection welcome/invite messages. Styles 2–8 are unchanged.
**contextInfo everywhere**: `lib/helpers/contextInfo.js` wraps `sock.sendMessage` so every text/image/video/audio/document/sticker carries the channel chip, the forwarded label and a repo link card. Commands can still set their own contextInfo (it wins). `BOT_CONTEXT_CARD=off` hides the card.
**Repo**: one repo link, `https://akumagen2.vercel.app` (`REPO_URL`), used by `.repo` (aliases `sc source script git github`), `.fork`, the AI identity answer, package.json and the session generator. No GitHub URL or GitHub API call remains in these.
**Welcome/goodbye**: custom texts also accept `{user}`, `{group}`, `{count}`; a custom text is wrapped in the same header/footer.

## 2.6.1

**Menus**: every command is listed on its own line under its category (Tools → .ping / .runtime / …) in all eight styles. New `.adstag` sets the label above the menu ad (`MENU_ADS_TAG`); `.setmenuads` and `.reloadconfig` show it. The menu message also carries a WhatsApp-style "Ad" badge (`.adstag badge on|off`).
**Status replies**: `.ping`, `.runtime`, `.alive`, `.botinfo`, `.version`, `.stats`, `.sysinfo`, `.botcore` carry a cosmetic "Forwarded many times" label (`BOT_FORWARDED_TAG=off` to hide). `.ping` now sends the result as a new message and removes the "Pinging…" placeholder, because an edit cannot carry the label.
**Dev commands**: `uptime2.js` renamed to `processinfo.js`; all dev commands are `strictOwner` (hidden from sudo users who cannot run them); `.fixsettings` keeps a `.bak` copy; `.npm` only accepts package names and `--depth/--json/--long`; `.devcheck`/`.errorlog` cope with errors that have no scope; `.botcore` uses the same runtime format as `.ping`; wrong "$-prefix" wording removed.

## 2.6.0 — QUEEN AKUMA V4 clean release

**API layer**: single Wolvarex client (`lib/api/`) with timeouts, retry, redaction and tolerant response parsing; music, AI, fun, upload, search, screenshot, weather, Instagram and converter endpoints all use it. Fun commands fall back to their offline lists.
**Fixed**: `.play` rewritten on `/music/ytmp3-search` → `/music/ytmp3-download` with audio validation; `.setbotpp` no longer depends on Baileys' image library (also fixes `.groupicon`); API key was read before `.env` was loaded (empty key when supplied via `.env`); `watermark` imported an undeclared `jimp`; duplicate/dead code in ping/runtime.
**Menus**: text-only, six views × eight styles, ads block (`.setmenuads`), new USER / DOWNLOAD / SEARCH / UTILITY categories. Button menus and the `gifted-btns` / `my-md-btns` dependencies were removed.
**New commands**: `userinfo profile avatar afk reminder usermenu songs plugins reloadplugins setmenuads` and menu shortcuts per category.
**Security**: no secrets in the repo, SSRF guard, sandboxed file commands, strict-owner tier, `.eval`/`.update`/auto-join opt-in, hard-coded developer-number shortcut replaced by `DEV_NUMBERS`, global output redaction.
**Ops**: Dockerfile, compose, Fly.io, Koyeb, graceful SIGTERM, `/health` + `/healthz`, unit tests.
**Removed**: `.buttonmenu`, `.buttontest`, `.video` (guessed endpoints), `wouldyourather2`, unused deps (`pino`, `dotenv`).
