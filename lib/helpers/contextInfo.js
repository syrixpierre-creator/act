// ============================================================
//  contextInfo on EVERY outgoing message.
//
//  wrapSendMessageWithContext(sock) wraps sock.sendMessage once, like the
//  font and redaction wrappers, so every text / image / video / audio /
//  document / sticker the bot sends (menus, welcome, goodbye, replies from
//  any command) carries the same contextInfo:
//    • "View channel" chip   → forwardedNewsletterMessageInfo
//    • forwarded label       → isForwarded + forwardingScore (BOT_FORWARDED_TAG=off hides it)
//    • link card to the repo → externalAdReply (BOT_CONTEXT_CARD=off hides it)
//  A contextInfo a command sets itself always wins over these defaults
//  (e.g. the menu's own ad card), and is merged, never replaced, so
//  mentions and quoted replies keep working.
// ============================================================
import { config, envString } from '../../config/index.js';
import { forwardedEnabled } from './forwarded.js';
import { currentBotName } from '../brand.js';

export const CHANNEL_JID = () => envString('UPDATE_CHANNEL_JID', '120363427360133880@newsletter');
export const CHANNEL_NAME = () => envString('UPDATE_CHANNEL_NAME', 'QUEEN AKUMA V4 Updates');

const cardEnabled = () => !/^(off|none|false|0|no)$/i.test(envString('BOT_CONTEXT_CARD', 'on'));

export function defaultContextInfo() {
  const ci = {};
  if (forwardedEnabled()) { ci.isForwarded = true; ci.forwardingScore = 999; }
  ci.forwardedNewsletterMessageInfo = { newsletterJid: CHANNEL_JID(), newsletterName: CHANNEL_NAME(), serverMessageId: 1 };
  if (cardEnabled()) {
    ci.externalAdReply = {
      title: currentBotName().toUpperCase(),
      body: config.bot.ownerName,
      mediaType: 1,
      showAdAttribution: false,
      renderLargerThumbnail: false,
      sourceUrl: config.repoUrl
    };
  }
  return ci;
}

const CARRIES_CONTEXT = ['text', 'image', 'video', 'audio', 'document', 'sticker'];
const NEVER = ['react', 'delete', 'edit', 'forward', 'poll', 'pin', 'disappearingMessagesInMessage'];
const SKIP_JID = /@newsletter$|^status@broadcast$/;

export function withDefaultContext(jid, content) {
  if (!content || typeof content !== 'object') return content;
  if (SKIP_JID.test(String(jid || ''))) return content;
  if (NEVER.some((k) => content[k] !== undefined)) return content;
  if (!CARRIES_CONTEXT.some((k) => content[k] !== undefined)) return content;
  return { ...content, contextInfo: { ...defaultContextInfo(), ...(content.contextInfo || {}) } };
}

export function wrapSendMessageWithContext(sock) {
  const original = sock.sendMessage.bind(sock);
  sock.sendMessage = (jid, content, options) => {
    let out = content;
    try { out = withDefaultContext(jid, content); } catch { /* never block a send because of a cosmetic tag */ }
    return original(jid, out, options);
  };
}
