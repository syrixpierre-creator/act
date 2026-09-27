<div align="center">

# 🌑 QUEEN AKUMA V4

**A self-hosted WhatsApp multi-device bot built on [Baileys](https://github.com/WhiskeySockets/Baileys) — 370 commands, text-only menus, Docker-ready.**

</div>

---

## Features

- **370 commands / 148 aliases** in 17 categories, loaded by a fault-tolerant plugin loader (one broken file never stops the bot; duplicates and alias clashes are skipped and reported).
- **Music** — `.play <song>` searches with the Wolvarex music API, downloads the audio and sends it with title, artist, duration and thumbnail.
- **AI** — `.flux`, `.imagine`, `.groqai`, `.gpt4`, `.gptdirect`, `.llamachat`, `.translate`.
- **Fun** — jokes, riddles, trivia, truth/dare, roasts, pickup/flirt lines, quotes, would-you-rather, fun facts (API first, built-in offline lists as fallback).
- **Downloads / search / tools** — Instagram, TikTok, YouTube audio, video search, website screenshots, weather, image hosting (imgbb / catbox).
- **Group & admin tooling**, welcome/goodbye, anti-spam/link/delete/view-once, automation, sudo list.
- **Text-only redesigned menus** — 6 views (public, private, group, owner, admin, user) × 8 layouts, permission-aware and compact.
- **Security-minded defaults** — API key only from the environment, SSRF guard on every URL, credential files unreadable by `.cat/.ls/.download`, `.eval` and `.update` disabled until you enable them, global output redaction.
- **Deploy anywhere** — Docker, Docker Compose, Fly.io, Koyeb, Render, Pterodactyl panels, plain Node.

## Command categories

| Category | Cmds | Category | Cmds |
|---|---|---|---|
| ADMIN | 40 | MEDIA | 7 |
| AI | 9 | OWNER | 39 |
| AUTOMATION | 8 | SUDO | 4 |
| BOT SETTINGS | 24 | TOOLS | 23 |
| CONVERTER | 7 | USER | 11 |
| DEV | 21 | DOWNLOAD | 5 |
| FUN | 77 | SEARCH | 3 |
| GROUP | 32 | UTILITY | 50 |
| | | MENU STYLE | 10 |

Send `.menu` in WhatsApp. `.menu list` = category index · `.menu ai` = one category · `.menu owner|admin|group|user|public|private` = a specific view (you can only open views you're entitled to).

## Requirements

- Node.js **20+** (22 works)
- `ffmpeg` on the host (stickers, video conversion, and the image-processing fallback used by `.setbotpp`)
- A WhatsApp account for the bot and a **Wolvarex API key** for the API-backed commands

## Installation

```bash
git clone <your-repo-url> QUEEN-AKUMA-V4 && cd QUEEN-AKUMA-V4
npm install
cp .env.example .env      # then edit .env
npm start
```

`npm start` runs `sessions.js` — a single deployment, no `SESSION_ID` needed. It opens a web pairing page on `PORT` (default `3000`): open it, enter a WhatsApp number, get a pairing code. Every number paired this way runs as its own independent session from the same deployment (multi-session, like a hosting panel) — add more any time by pairing another number on the same page, or by sending `.linkme <phone>` from an already-connected session. `SESSION_ID` still works for a single legacy account (see below) if you prefer that over pairing.

## Configuration

Everything is configured through environment variables (a local `.env` file is read automatically; real environment variables always win). **`.env` is git-ignored — never commit it.**

| Variable | Purpose | Default |
|---|---|---|
| `WOLVAREX_API_KEY` | Key for every Wolvarex-backed command | *(unset → those commands are hidden from menus)* |
| `WOLVAREX_BASE_URL` | API base URL | `https://apix.wolvarex.com/api` |
| `API_TIMEOUT_MS` / `DOWNLOAD_TIMEOUT_MS` / `API_RETRIES` | Request tuning | `25000` / `90000` / `1` |
| `SESSION_ID` | Legacy: session string for automatic single-account login (skip the pairing page for that one account) | – |
| `MAX_SESSIONS` | Cap on concurrent paired sessions (`sessions.js`) | `25` |
| `BOT_NAME`, `BOT_PREFIX`, `OWNER_NAME` | Identity | `QUEEN AKUMA V4`, `.`, `INCONNU BOY SENSEI` |
| `PORT` | Health/status web server | `3000` |
| `MENU_ADS_ENABLED`, `MENU_ADS_TEXT` | Default for the menu ad block | `true`, `Powered by INCONNU BOY SENSEI` |
| `MENU_IMAGE_URL` | Header image when `.setmenuimage on` | built-in |
| `BOT_FORWARDED_TAG` | Cosmetic "Forwarded many times" label on `.ping` `.runtime` `.alive` `.botinfo` `.version` `.stats` `.sysinfo` `.botcore` (`off` hides it) | `on` |
| `BOT_NOTICE_LINE` | Optional plain-text line above `.ping`/`.runtime` | *(none)* |
| `MENU_ADS_BADGE`, `MENU_ADS_URL` | WhatsApp "Ad" badge on the menu (`.adstag badge on\|off`) and the link it opens | `true`, repo URL |
| `MENU_ADS_TAG` | Label shown above the menu ad (`.adstag` changes it in chat) | `📢 ADVERTISEMENT` |
| `MAX_AUDIO_MB`, `MAX_AUDIO_MINUTES`, `MAX_MEDIA_MB`, `MAX_UPLOAD_MB` | Size limits | `40`, `20`, `50`, `15` |
| `DEV_NUMBERS` | Digits-only numbers allowed to use the `$` dev shortcut | *(empty)* |
| `ENABLE_EVAL` | Enables `.eval` (arbitrary code — owner only) | `false` |
| `UPDATE_REPO` / `UPDATE_BRANCH` | `owner/repo` that `.update` pulls from | *(unset → `.update` disabled)* |
| `AUTO_JOIN_GROUP` | Auto-join the project support group on first connect | `false` |
| `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `GEMINI_API_KEY`, `GROQ_API_KEY`, `REMOVEBG_API_KEY`, `OPENWEATHER_API_KEY` | Optional extra providers | – |

### API configuration

All Wolvarex calls go through one client (`lib/api/wolvarex.js`); it reads `WOLVAREX_API_KEY` from the environment, applies timeouts and one retry for transient failures, and strips the key from any log line or chat message.

| Command(s) | Endpoint(s) |
|---|---|
| `.play`, `.songs`, `.ytmp3dl` | `/music/ytmp3-search`, `/music/ytmp3-download` |
| `.flux`, `.imagine` | `/ai/tools/generate` (`.imagine` tries `/ai/image/dall-e` first) |
| `.translate` | `/ai/translate` (MyMemory fallback) |
| `.groqai`, `.gpt4`/`.gptdirect`, `.llamachat` | `/ai/groq`, `/ai/gpt`, `/ai/llama` |
| `.riddle .pickupline .quote .flirtline .joke .wouldrather .roast .fact .dare .truth .trivia` | `/fun/riddles`, `/fun/pickuplines`, `/fun/quotes`, `/fun/flirt`, `/fun/jokes`, `/fun/wouldyourather`, `/fun/roasts`, `/fun/funfacts`, `/fun/dares`, `/fun/truth`, `/fun/trivia` |
| `.imgbb`, `.catbox` | `/url/imgbb`, `/url/catbox` |
| `.videosearch` (`.search`) | `/search/videos` |
| `.ssweb` | `/tools/screenshot` |
| `.weather` | `/tools/weather` (wttr.in fallback) |
| `.instadl` | `/download/instagram/igram` |
| `.giftovideo .stickertoimg .stickertovideo .videotogif .videotosticker` | `/converter/*` |

> The Wolvarex API is not publicly documented. Response parsing is deliberately tolerant (`lib/api/normalize.js`), and when a response can't be understood the *key structure only* is written to the server log so the mapping can be adjusted.

## Local development

```bash
npm run check           # syntax-check every file
npm run audit:imports   # missing files / undeclared packages
npm test                # unit tests (mocked network, no WhatsApp needed)
npm run verify          # all of the above
npm run dev             # restart on file changes
```

Project layout:

```
commands/<category>/   one file per command (folder = menu category)
lib/api/               Wolvarex client + music / ai / fun / tools / upload / social / convert
lib/menu/              menu model, 6 views, 8 styles, ads
lib/plugins/           fault-tolerant loader (+ live reload)
lib/helpers/           reply, media, image processing, AFK, factories
lib/utils/             errors, redact, logger, http, SSRF guard, safe paths
config/                environment-driven configuration
deployment/            entrypoint, Koyeb spec, panel/troubleshooting guides
tests/                 node:test suites
```

## Deployment

### Docker

```bash
cp .env.example .env         # fill in WOLVAREX_API_KEY (SESSION_ID optional — pair via the web page instead)
docker compose up -d --build
docker compose logs -f
```

The image runs the bot as the unprivileged `node` user (via `gosu` after fixing volume permissions), forwards `SIGTERM/SIGINT` with `tini` for a graceful shutdown, and exposes `/health` (also `/healthz`) plus the pairing page at `/` for health checks and adding sessions. Keep `/app/sessions`, `/app/session` and `/app/data` on volumes (compose does this).

### Fly.io

```bash
fly launch --no-deploy --copy-config      # choose your own app name and region
fly volumes create queen_akuma_data --size 1   # same region as the app
fly secrets set WOLVAREX_API_KEY="your_api_key_here"  # SESSION_ID optional — pair via the web page instead
fly deploy
```

`fly.toml` mounts one volume at `/persist`; the entrypoint keeps `data/` and `session/` on it. Machines never auto-stop, so the bot stays connected.

### Koyeb

Create a **Web Service** from your Git repo with the **Dockerfile** builder, port `3000` (HTTP), health check path `/health`, and add `WOLVAREX_API_KEY` as a secret. `deployment/koyeb.yaml` lists the same settings for the CLI. The free tier has no persistent volume — pairing (or `SESSION_ID`) won't survive a redeploy there.

### Render, Railway, Heroku-style hosts, VPS, panels

Any host that runs `npm install && npm start` works: set the environment variables above, expose `PORT`, and use `/health` as the health check. `render.yaml` and `Procfile` are included; see `deployment/DEPLOY-PANEL.md` for Pterodactyl panels. Use pm2/systemd on a VPS.

## Security notes

- **Rotate any API key that was ever committed or shared.** The archive this release was cleaned from shipped a `.env` containing an API key; it has been removed and `.env` is now git-ignored, but the old key must be considered exposed.
- Secrets are read only from the environment. Outgoing chat messages and logs are passed through a redactor that removes configured secrets, `key=`/`token=` values, bearer tokens and server paths.
- User- or API-supplied URLs go through an SSRF guard: http(s) only, ports 80/443, no credentials, DNS results must be public addresses, redirects are re-validated hop by hop.
- Privileged commands: `.eval`, `.update`, `.restart`, `.shutdown`, `.leaveall`, `.join`, `.gitclone`, `.forwardmsg`, `.factoryreset`, `.setowner`, `.resetowner`, `.addwhitelist`, `.removewhitelist` and **every DEV command** are **owner-only — sudo users are not enough**. `.cat/.ls/.download` cannot touch `.env`, `session/`, `owner.json`, `.git`, `node_modules` or symlinks pointing outside the project.
- The `$` dev shortcut only works for numbers listed in `DEV_NUMBERS` (empty by default).
- `AUTO_JOIN_GROUP` is off unless you opt in.
- Known limit: DNS is resolved by the SSRF guard and again by the HTTP client, so a hostile DNS server could still race the check.

## Troubleshooting

| Symptom | Fix |
|---|---|
| API commands missing from `.menu` | `WOLVAREX_API_KEY` is not set (owners still see them flagged ⚠️). Run `.devcheck`. |
| `.play` says "Request failed" | Check the server log (`LOG_LEVEL=debug` shows the response *shape*). Try `.songs <name>` to see the search step alone. |
| `.setbotpp` says image processing is unavailable | The host can't load `sharp` (common on Termux/Alpine/panels). Run `npm install sharp jimp` (or `npm rebuild sharp`), or install `ffmpeg`. `.devcheck` shows which backends load. |
| `npm install` fails on a panel | See `deployment/DEPLOY_TROUBLESHOOTING.md`. |
| Bot exits at start with "No SESSION_ID" | You're running `node index.js` directly (`npm run single`) with no terminal and no `SESSION_ID` set — either set `SESSION_ID`, or use `npm start` (`node sessions.js`) instead, which pairs over the web page and never needs one. |
| Health page shows `"connected":false` and `"plugins":0` forever | Same cause as above under a panel's pseudo-console (Pterodactyl etc.) — it's stuck at an interactive prompt nobody is answering. Switch the startup command to `node sessions.js` and use its pairing page. |
| A command doesn't appear | `.plugins failed` lists files that failed to load and why. `.reloadplugins` re-scans without a restart. |

## Credits & licence

MIT — see `LICENSE`. Built on Baileys.
