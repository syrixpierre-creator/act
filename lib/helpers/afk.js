// AFK state (in memory + persisted so it survives restarts).
import fs from 'fs';
import path from 'path';
import { currentDataDir, currentSessionId } from '../sessionContext.js';
// All sessions now share one process (see sessionContext.js), so both the
// file path AND the in-memory cache below are keyed by sessionId — a
// single shared `let state` here would leak one session's AFK list into
// every other session's chats.
const stateBySession = new Map();
function file() { return path.join(currentDataDir(), 'afk.json'); }

function load() {
  const id = currentSessionId();
  if (stateBySession.has(id)) return stateBySession.get(id);
  let state;
  try { state = JSON.parse(fs.readFileSync(file(), 'utf8')); } catch { state = {}; }
  stateBySession.set(id, state);
  return state;
}
function save() {
  const state = load();
  try { fs.mkdirSync(path.dirname(file()), { recursive: true }); fs.writeFileSync(file(), JSON.stringify(state, null, 2)); } catch { /* non-critical */ }
}
const norm = (jid) => String(jid || '').split('@')[0].split(':')[0];

export function setAfk(jid, reason) { load()[norm(jid)] = { reason: String(reason || 'AFK').slice(0, 120), since: Date.now() }; save(); }
export function getAfk(jid) { return load()[norm(jid)] || null; }
export function clearAfk(jid) { const s = load(); const had = s[norm(jid)]; if (had) { delete s[norm(jid)]; save(); } return had || null; }

export function ago(ms) {
  const s = Math.floor(ms / 1000);
  if (s < 60) return `${s}s`;
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ${Math.floor((s % 3600) / 60)}m`;
  return `${Math.floor(s / 86400)}d ${Math.floor((s % 86400) / 3600)}h`;
}

// Called for every incoming (non-command) message.
export async function handleAfkTraffic(sock, msg, chatId, senderJid, mentionedJids = []) {
  const back = clearAfk(senderJid);
  if (back) {
    await sock.sendMessage(chatId, { text: `👋 Welcome back @${norm(senderJid)}! You were AFK for ${ago(Date.now() - back.since)}.`, mentions: [senderJid] }, { quoted: msg }).catch(() => {});
  }
  const replied = msg.message?.extendedTextMessage?.contextInfo?.participant;
  const targets = new Set([...(mentionedJids || []), ...(replied ? [replied] : [])]);
  for (const jid of targets) {
    const a = getAfk(jid);
    if (a && norm(jid) !== norm(senderJid)) {
      await sock.sendMessage(chatId, { text: `💤 @${norm(jid)} is AFK (${ago(Date.now() - a.since)})\n📝 ${a.reason}`, mentions: [jid] }, { quoted: msg }).catch(() => {});
    }
  }
}
